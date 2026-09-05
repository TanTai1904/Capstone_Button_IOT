import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class IotService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  async handleEvent(device: any, body: any) {
    const { eventType = 'DOUBLE_PRESS', requestId, battery, rssi } = body;

    if (!requestId) {
      throw new BadRequestException('Thiếu trường requestId');
    }

    // 1. Bấm 1 lần: Kích hoạt thiết bị lên (Wakeup / Activate / Heartbeat)
    if (eventType === 'WAKEUP' || eventType === 'SINGLE_PRESS' || eventType === 'ACTIVATE') {
      const now = new Date();
      await this.prisma.device.update({
        where: { id: device.id },
        data: {
          status: 'ACTIVE',
          lastSeenAt: now,
          batteryLevel: battery !== undefined ? battery : device.batteryLevel,
          wifiRSSI: rssi !== undefined ? rssi : device.wifiRSSI,
        },
      });

      this.ordersService['eventsGateway'].emitGlobal('DEVICE_HEARTBEAT', {
        deviceId: device.deviceId,
        batteryLevel: battery !== undefined ? battery : device.batteryLevel,
        wifiRSSI: rssi !== undefined ? rssi : device.wifiRSSI,
        lastSeenAt: now,
        status: 'ACTIVE',
      });

      this.ordersService['eventsGateway'].emitGlobal('DEVICE_ACTIVATED', {
        deviceId: device.deviceId,
        message: 'Nút bấm đã được kích hoạt lên thành công và sẵn sàng đặt hàng!',
      });

      return {
        success: true,
        code: 'DEVICE_ACTIVATED',
        message: 'Nút bấm đã được kích hoạt thành công!',
        data: { deviceId: device.deviceId, status: 'ACTIVE' },
      };
    }

    // 2. Bấm 2 lần: Đặt hàng; Nếu vừa đặt trong 60s thì bấm 2 lần là HỦY đơn
    if (eventType === 'DOUBLE_PRESS' || eventType === 'ORDER') {
      // Check idempotency first: if this exact requestId was already processed, return duplicate
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
            success: true,
            code: 'ORDER_ACKNOWLEDGED_DUPLICATE',
            message: 'Đã ghi nhận đơn hàng trước đó (Anti-Spam Idempotent)',
            data: {
              order: existingOrder,
              isDuplicate: true,
              cancelWindowSeconds: 60,
            },
          };
        }
      }

      const pendingOrder = await this.prisma.order.findFirst({
        where: { deviceId: device.id, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      });

      // Nếu đang có đơn hàng PENDING trong thời hạn hủy -> Bấm 2 lần là HỦY ĐƠN
      if (pendingOrder && (!pendingOrder.cancelExpiresAt || new Date() <= pendingOrder.cancelExpiresAt)) {
        const cancelled = await this.ordersService.cancelOrder(
          pendingOrder.id,
          'Khách bấm 2 lần hủy đơn trực tiếp trên nút vật lý',
        );
        return {
          success: true,
          code: 'ORDER_CANCELLED_BY_BUTTON',
          message: 'Đã hủy đơn hàng thành công qua 2 lần bấm nút vật lý!',
          data: { order: cancelled },
        };
      }

      // Nếu chưa có đơn hoặc đơn cũ đã xong -> Bấm 2 lần là ĐẶT HÀNG
      const orderResult = await this.ordersService.handleButtonEvent(device, {
        eventType: 'DOUBLE_PRESS',
        requestId,
        battery,
        rssi,
      });

      return {
        success: true,
        code: orderResult.isDuplicate ? 'ORDER_ACKNOWLEDGED_DUPLICATE' : 'ORDER_CREATED',
        message: orderResult.isDuplicate
          ? 'Đã ghi nhận đơn hàng trước đó (Anti-Spam Idempotent)'
          : 'Đơn hàng mới đã được tạo thành công bằng 2 lần bấm!',
        data: orderResult,
      };
    }

    // Fallback: Default to handleButtonEvent
    const orderResult = await this.ordersService.handleButtonEvent(device, {
      eventType,
      requestId,
      battery,
      rssi,
    });

    return {
      success: true,
      code: orderResult.isDuplicate ? 'ORDER_ACKNOWLEDGED_DUPLICATE' : 'ORDER_CREATED',
      message: 'Đơn hàng đã được ghi nhận!',
      data: orderResult,
    };
  }

  async handleTelemetry(device: any, body: any) {
    const {
      battery = 100,
      voltageMv = 3700,
      rssi = -50,
      bootReason = 'GPIO_WAKEUP',
      wakeDurationMs = 2800,
      firmwareVersion = '1.2.0',
    } = body;

    const telemetry = await this.prisma.deviceTelemetry.create({
      data: {
        deviceId: device.id,
        batteryLevel: battery,
        voltageMv,
        wifiRSSI: rssi,
        bootReason,
        wakeDurationMs,
        firmwareVersion,
      },
    });

    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        batteryLevel: battery,
        wifiRSSI: rssi,
        lastSeenAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Ghi nhận thông số telemetry thành công',
      data: telemetry,
    };
  }

  async getConfig(device: any) {
    const config = await this.prisma.deviceConfiguration.findUnique({
      where: { deviceId: device.id },
      include: { product: true },
    });

    return {
      success: true,
      data: {
        deviceId: device.deviceId,
        customName: config?.customName || 'Smart Order Button',
        productName: config?.product?.name || 'Sản phẩm',
        cancelWindowSeconds: config?.cancelWindowSeconds || 60,
        soundEnabled: config?.soundEnabled ?? true,
        ledEnabled: config?.ledEnabled ?? true,
        version: config?.version || 1,
      },
    };
  }
}
