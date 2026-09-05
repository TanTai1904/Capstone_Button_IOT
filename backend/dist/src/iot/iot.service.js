"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const orders_service_1 = require("../orders/orders.service");
let IotService = class IotService {
    constructor(prisma, ordersService) {
        this.prisma = prisma;
        this.ordersService = ordersService;
    }
    async handleEvent(device, body) {
        const { eventType = 'DOUBLE_PRESS', requestId, battery, rssi } = body;
        if (!requestId) {
            throw new common_1.BadRequestException('Thiếu trường requestId');
        }
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
        if (eventType === 'DOUBLE_PRESS' || eventType === 'ORDER') {
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
            if (pendingOrder && (!pendingOrder.cancelExpiresAt || new Date() <= pendingOrder.cancelExpiresAt)) {
                const cancelled = await this.ordersService.cancelOrder(pendingOrder.id, 'Khách bấm 2 lần hủy đơn trực tiếp trên nút vật lý');
                return {
                    success: true,
                    code: 'ORDER_CANCELLED_BY_BUTTON',
                    message: 'Đã hủy đơn hàng thành công qua 2 lần bấm nút vật lý!',
                    data: { order: cancelled },
                };
            }
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
    async handleTelemetry(device, body) {
        const { battery = 100, voltageMv = 3700, rssi = -50, bootReason = 'GPIO_WAKEUP', wakeDurationMs = 2800, firmwareVersion = '1.2.0', } = body;
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
    async getConfig(device) {
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
};
exports.IotService = IotService;
exports.IotService = IotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(orders_service_1.OrdersService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService])
], IotService);
//# sourceMappingURL=iot.service.js.map