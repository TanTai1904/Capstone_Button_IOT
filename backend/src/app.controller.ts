import { Controller, Get, Post, Body, Inject, HttpCode } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { OrdersService } from './orders/orders.service';
import { EventsGateway } from './websocket/events.gateway';

@Controller()
export class AppController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OrdersService) private readonly ordersService: OrdersService,
    @Inject(EventsGateway) private readonly eventsGateway: EventsGateway,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'NestJS Smart Order Backend',
    };
  }

  @HttpCode(200)
  @Post('event')
  async handleSimpleEvent(@Body() body: any) {
    const event = body.event || body.eventType || 'success';
    console.log(`🔘 [ESP32 Simple Event] Nhận sự kiện từ nút bấm: ${event}`);

    // Default device: BTN-8829-WTR
    const device = await this.prisma.device.findFirst({
      where: { deviceId: body.deviceId || 'BTN-8829-WTR' },
      include: { configuration: true },
    });

    if (!device) {
      return { success: false, message: 'Không tìm thấy thiết bị BTN-8829-WTR trong hệ thống' };
    }

    if (event === 'start' || event === 'hold') {
      const pressingPayload = {
        deviceId: device.deviceId,
        customName: device.configuration?.customName || 'Nút Nước Lavie Bếp',
        message: 'Nút đang được nhấn giữ...',
      };
      if (device.customerId) {
        this.eventsGateway.emitToCustomer(device.customerId, 'BUTTON_PRESSING', pressingPayload);
      }
      if (device.storeId) {
        this.eventsGateway.emitToStore(device.storeId, 'BUTTON_PRESSING', pressingPayload);
      }
      return { success: true, message: 'Đã nhận tín hiệu bắt đầu nhấn giữ nút' };
    }

    if (event === 'fail') {
      const releasePayload = {
        deviceId: device.deviceId,
        message: 'Đã thả nút sớm',
      };
      if (device.customerId) {
        this.eventsGateway.emitToCustomer(device.customerId, 'BUTTON_RELEASED', releasePayload);
      }
      if (device.storeId) {
        this.eventsGateway.emitToStore(device.storeId, 'BUTTON_RELEASED', releasePayload);
      }
      return { success: true, message: 'Người dùng đã thả nút sớm' };
    }

    if (event === 'cancel' || event === 'DOUBLE_PRESS') {
      try {
        const pendingOrder = await this.prisma.order.findFirst({
          where: { deviceId: device.id, status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
        });

        if (pendingOrder) {
          const cancelled = await this.ordersService.cancelOrder(
            pendingOrder.id,
            'Khách bấm nút hủy đơn trên ESP32',
          );
          console.log(`❌ [ESP32 Simple Event] Đã hủy đơn hàng: ${cancelled.orderNumber}`);
          return {
            success: true,
            code: 'ORDER_CANCELLED',
            message: 'Đã hủy đơn hàng thành công qua nút bấm',
            orderNumber: cancelled.orderNumber,
            blink: true,
          };
        }
        return {
          success: false,
          code: 'NO_PENDING_ORDER',
          message: 'Không có đơn hàng nào đang chờ để hủy trong 60 giây',
          blink: false,
        };
      } catch (err: any) {
        return {
          success: false,
          code: 'CANCEL_FAILED',
          message: err.message || 'Hủy đơn không thành công',
          blink: false,
        };
      }
    }

    // Create order on 'success' or 'SINGLE_PRESS'
    try {
      const requestId = `btn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const result = await this.ordersService.handleButtonEvent(device, {
        eventType: 'SINGLE_PRESS',
        requestId,
        battery: body.battery || 96,
        rssi: body.rssi || -55,
      });

      if (result.isDuplicate) {
        console.log(`⚠️ [ESP32 Simple Event] Đơn hàng đang xử lý (chống spam 30s): ${result.order.orderNumber}`);
        if (device.customerId) {
          this.eventsGateway.emitToCustomer(device.customerId, 'ORDER_DUPLICATE_THROTTLED', {
            order: result.order,
            message: 'Đơn hàng gần đây đang được xử lý, tránh bấm lặp lại trong 30 giây.',
          });
        }
        return {
          success: true,
          isDuplicate: true,
          message: 'Đơn hàng gần đây đang được xử lý (tránh đặt trùng trong 30s)',
          orderNumber: result.order.orderNumber,
          blink: true,
        };
      }

      console.log(`✅ [ESP32 Simple Event] ĐÃ TẠO ĐƠN HÀNG THÀNH CÔNG: ${result.order.orderNumber}`);

      return {
        success: true,
        isDuplicate: false,
        message: 'Đã tạo đơn hàng thành công qua nút bấm ESP32!',
        orderNumber: result.order.orderNumber,
        totalAmount: result.order.totalAmount,
        blink: true,
      };
    } catch (err: any) {
      console.error('❌ [ESP32 Simple Event Error]', err);
      return {
        success: false,
        message: err.message || 'Lỗi khi tạo đơn hàng qua nút bấm',
        blink: false,
      };
    }
  }

  @HttpCode(200)
  @Post('heartbeat')
  async handleSimpleHeartbeat(@Body() body: any) {
    const device = await this.prisma.device.findFirst({
      where: { deviceId: body.deviceId || 'BTN-8829-WTR' },
    });

    if (device) {
      const now = new Date();
      const battery = body.battery !== undefined ? body.battery : device.batteryLevel;
      const rssi = body.rssi !== undefined ? body.rssi : device.wifiRSSI;

      await this.prisma.device.update({
        where: { id: device.id },
        data: {
          lastSeenAt: now,
          wifiRSSI: rssi,
          batteryLevel: battery,
        },
      });

      const heartbeatPayload = {
        deviceId: device.deviceId,
        isOnline: true,
        batteryLevel: battery,
        wifiRSSI: rssi,
        lastSeenAt: now.toISOString(),
      };

      if (device.storeId) {
        this.eventsGateway.emitToStore(device.storeId, 'DEVICE_HEARTBEAT', heartbeatPayload);
      }
      if (device.customerId) {
        this.eventsGateway.emitToCustomer(device.customerId, 'DEVICE_HEARTBEAT', heartbeatPayload);
      }
    }

    return {
      status: 'OK',
      timestamp: Date.now(),
      message: 'Heartbeat acknowledged',
      blink: false,
    };
  }
}


