import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../security/crypto.service';
import { EventsGateway } from '../websocket/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CryptoService) private readonly crypto: CryptoService,
    @Inject(EventsGateway) private readonly eventsGateway: EventsGateway,
  ) {}

  async handleButtonEvent(
    device: any,
    eventPayload: { eventType: string; requestId: string; battery?: number; rssi?: number },
  ) {
    const { eventType, requestId, battery = 100, rssi = -50 } = eventPayload;

    const config = await this.prisma.deviceConfiguration.findUnique({
      where: { deviceId: device.id },
      include: {
        product: true,
        device: {
          include: {
            customer: { include: { user: true } },
            store: true,
          },
        },
      },
    });

    if (!config || !config.product) {
      throw new BadRequestException('Thiết bị chưa được cấu hình sản phẩm đặt hàng');
    }

    if (!config.device.customer || !config.device.storeId) {
      throw new BadRequestException('Thiết bị chưa được gán cho khách hàng hoặc cửa hàng');
    }

    const customer = config.device.customer;
    const store = config.device.store;
    const product = config.product;
    const quantity = config.defaultQuantity || 1;

    // Anti-Spam / Idempotency check
    const existingIdempotency = await this.prisma.idempotencyRecord.findUnique({
      where: { key: requestId },
    });

    if (existingIdempotency && existingIdempotency.orderId) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id: existingIdempotency.orderId },
        include: { items: true },
      });
      if (existingOrder) {
        return {
          order: existingOrder,
          isDuplicate: true,
          cancelWindowSeconds: config.cancelWindowSeconds,
        };
      }
    }

    // Debounce check: If an order from this device occurred in the last 30s
    const recentOrder = await this.prisma.order.findFirst({
      where: {
        deviceId: device.id,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] },
        createdAt: { gte: new Date(Date.now() - 30000) },
      },
      include: { items: true },
    });

    if (recentOrder) {
      return {
        order: recentOrder,
        isDuplicate: true,
        cancelWindowSeconds: config.cancelWindowSeconds,
      };
    }

    // Stock check
    const availableStock = product.stock - product.reservedStock;
    if (availableStock < quantity) {
      throw new BadRequestException(
        `Sản phẩm "${product.name}" tạm thời hết hàng (Còn: ${availableStock}, Cần: ${quantity})`,
      );
    }

    const cancelExpiresAt = new Date(Date.now() + config.cancelWindowSeconds * 1000);
    const orderNumber = this.crypto.generateOrderNumber();
    const totalAmount = product.price * quantity;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Reserve stock
      await tx.product.update({
        where: { id: product.id },
        data: { reservedStock: { increment: quantity } },
      });

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          storeId: store.id,
          customerId: customer.id,
          deviceId: device.id,
          status: 'PENDING',
          totalAmount,
          deliveryAddress: customer.deliveryAddress,
          customerPhone: customer.phone,
          customerName: customer.user.fullName,
          cancelExpiresAt,
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                quantity,
                unitPrice: product.price,
                totalPrice: totalAmount,
              },
            ],
          },
        },
        include: { items: true },
      });

      // 3. Save Idempotency
      await tx.idempotencyRecord.create({
        data: {
          key: requestId,
          deviceId: device.id,
          orderId: newOrder.id,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      // 4. Update Device event & telemetry
      await tx.deviceEvent.create({
        data: {
          deviceId: device.id,
          eventType,
          requestId,
          batteryLevel: battery,
          wifiRSSI: rssi,
          processed: true,
        },
      });

      await tx.device.update({
        where: { id: device.id },
        data: {
          batteryLevel: battery,
          wifiRSSI: rssi,
          lastSeenAt: new Date(),
        },
      });

      return newOrder;
    });

    const orderPayload = {
      order: result,
      deviceName: config.customName,
      customerName: customer.user.fullName,
      productName: product.name,
      quantity,
      cancelWindowSeconds: config.cancelWindowSeconds,
      storeId: store.id,
      customerId: customer.id,
    };

    this.eventsGateway.emitToStore(store.id, 'ORDER_CREATED', orderPayload);
    this.eventsGateway.emitToCustomer(customer.id, 'ORDER_CREATED', orderPayload);
    if (customer.userId) {
      this.eventsGateway.emitToCustomer(customer.userId, 'ORDER_CREATED', orderPayload);
    }
    this.eventsGateway.emitGlobal('ORDER_CREATED', orderPayload);


    return {
      order: result,
      isDuplicate: false,
      cancelWindowSeconds: config.cancelWindowSeconds,
    };
  }

  async cancelOrder(orderId: string, reason: string = 'Khách hàng hủy đơn') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Đơn hàng đã được cửa hàng tiếp nhận, không thể hủy');
    }

    if (order.cancelExpiresAt && new Date() > order.cancelExpiresAt) {
      throw new BadRequestException('Đã quá thời gian cho phép hủy đơn');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { decrement: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
        include: { items: true },
      });
    });

    const cancelPayload = { order: updated, reason, storeId: order.storeId, customerId: order.customerId };
    this.eventsGateway.emitToStore(order.storeId, 'ORDER_CANCELLED', cancelPayload);
    this.eventsGateway.emitToCustomer(order.customerId, 'ORDER_CANCELLED', cancelPayload);
    this.eventsGateway.emitGlobal('ORDER_CANCELLED', cancelPayload);

    return updated;
  }

  async updateOrderStatus(orderId: string, newStatus: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (newStatus === 'COMPLETED' && order.status !== 'COMPLETED') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              reservedStock: { decrement: item.quantity },
            },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: { items: true },
      });
    });

    const statusPayload = { order: updated, storeId: order.storeId, customerId: order.customerId };
    this.eventsGateway.emitToStore(order.storeId, 'ORDER_STATUS_CHANGED', statusPayload);
    this.eventsGateway.emitToCustomer(order.customerId, 'ORDER_STATUS_CHANGED', statusPayload);
    this.eventsGateway.emitGlobal('ORDER_STATUS_CHANGED', statusPayload);

    return updated;
  }


  async list(user: any, status?: string) {
    let whereClause: any = {};
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.customerProfileId;
    } else if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) {
      whereClause.storeId = user.storeId;
    }

    if (status) {
      whereClause.status = status;
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        items: { include: { product: true } },
        device: { include: { configuration: true } },
        customer: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        device: { include: { configuration: true } },
        customer: { include: { user: true } },
      },
    });
  }
}
