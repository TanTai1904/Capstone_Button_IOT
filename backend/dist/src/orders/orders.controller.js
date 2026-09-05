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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let OrdersController = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async list(req, status) {
        const data = await this.ordersService.list(req.user, status);
        return { success: true, data };
    }
    async getById(id) {
        const data = await this.ordersService.getById(id);
        if (!data)
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        return { success: true, data };
    }
    async quickReorder(req, deviceId) {
        const device = await this.ordersService['prisma'].device.findUnique({
            where: { deviceId },
            include: { configuration: true },
        });
        if (!device || device.customerId !== req.user.customerProfileId) {
            throw new common_1.NotFoundException('Thiết bị không tồn tại hoặc không thuộc sở hữu của bạn');
        }
        const data = await this.ordersService.handleButtonEvent(device, {
            eventType: 'APP_QUICK_REORDER',
            requestId: `app_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            battery: device.batteryLevel,
            rssi: device.wifiRSSI,
        });
        return { success: true, message: 'Đặt hàng thành công!', data };
    }
    async updateStatus(id, status) {
        const data = await this.ordersService.updateOrderStatus(id, status);
        return { success: true, message: `Đã cập nhật trạng thái đơn: ${status}`, data };
    }
    async cancel(id, reason) {
        const data = await this.ordersService.cancelOrder(id, reason || 'Khách hàng hủy đơn');
        return { success: true, message: 'Đã hủy đơn hàng thành công', data };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getById", null);
__decorate([
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, common_1.Post)('quick-reorder'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "quickReorder", null);
__decorate([
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF', 'SUPER_ADMIN'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('orders'),
    __param(0, (0, common_1.Inject)(orders_service_1.OrdersService)),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map