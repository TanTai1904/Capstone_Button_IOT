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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../security/crypto.service");
const events_gateway_1 = require("../websocket/events.gateway");
let OrdersService = class OrdersService {
    constructor(prisma, crypto, eventsGateway) {
        this.prisma = prisma;
        this.crypto = crypto;
        this.eventsGateway = eventsGateway;
    }
    async handleButtonEvent(device, eventPayload) {
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
            throw new common_1.BadRequestException('Thiết bị chưa được cấu hình sản phẩm đặt hàng');
        }
        if (!config.device.customer || !config.device.storeId) {
            throw new common_1.BadRequestException('Thiết bị chưa được gán cho khách hàng hoặc cửa hàng');
        }
        const customer = config.device.customer;
        const store = config.device.store;
        const product = config.product;
        const quantity = config.defaultQuantity || 1;
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
        const availableStock = product.stock - product.reservedStock;
        if (availableStock < quantity) {
            throw new common_1.BadRequestException(`Sản phẩm "${product.name}" tạm thời hết hàng (Còn: ${availableStock}, Cần: ${quantity})`);
        }
        const cancelExpiresAt = new Date(Date.now() + config.cancelWindowSeconds * 1000);
        const orderNumber = this.crypto.generateOrderNumber();
        const totalAmount = product.price * quantity;
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id: product.id },
                data: { reservedStock: { increment: quantity } },
            });
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
            await tx.idempotencyRecord.create({
                data: {
                    key: requestId,
                    deviceId: device.id,
                    orderId: newOrder.id,
                    expiresAt: new Date(Date.now() + 3600000),
                },
            });
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
    async cancelOrder(orderId, reason = 'Khách hàng hủy đơn') {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException('Đơn hàng đã được cửa hàng tiếp nhận, không thể hủy');
        }
        if (order.cancelExpiresAt && new Date() > order.cancelExpiresAt) {
            throw new common_1.BadRequestException('Đã quá thời gian cho phép hủy đơn');
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
    async updateOrderStatus(orderId, newStatus) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
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
    async list(user, status) {
        let whereClause = {};
        if (user.role === 'CUSTOMER') {
            whereClause.customerId = user.customerProfileId;
        }
        else if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) {
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
    async getById(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                device: { include: { configuration: true } },
                customer: { include: { user: true } },
            },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(crypto_service_1.CryptoService)),
    __param(2, (0, common_1.Inject)(events_gateway_1.EventsGateway)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        events_gateway_1.EventsGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map