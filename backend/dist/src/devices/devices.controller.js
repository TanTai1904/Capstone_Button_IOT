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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const devices_service_1 = require("./devices.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let DevicesController = class DevicesController {
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    async getFleetStats(req) {
        const data = await this.devicesService.getFleetStats(req.user);
        return { success: true, data };
    }
    async list(req, query) {
        const data = await this.devicesService.list(req.user, query);
        return { success: true, data };
    }
    async register(body, req) {
        const data = await this.devicesService.registerDevice(body, req.user);
        return { success: true, message: 'Đăng ký thiết bị thành công!', data };
    }
    async bulkImport(body, req) {
        return this.devicesService.bulkImport(body, req.user);
    }
    async lookupCode(body) {
        const data = await this.devicesService.lookupByCode(body.code);
        return { success: true, data };
    }
    async configureByCode(body, req) {
        return this.devicesService.configureByCode(body, req.user);
    }
    async getById(id, req) {
        const data = await this.devicesService.getById(id, req.user);
        return { success: true, data };
    }
    async update(id, body, req) {
        const data = await this.devicesService.update(id, body, req.user);
        return { success: true, message: 'Cập nhật thiết bị thành công', data };
    }
    async remove(id, req) {
        const data = await this.devicesService.remove(id, req.user);
        return data;
    }
    async pair(id, body, req) {
        const data = await this.devicesService.pair(id, body, req.user);
        return { success: true, message: 'Ghép nối thiết bị thành công!', data };
    }
    async repair(id, req) {
        const data = await this.devicesService.repair(id, req.user);
        return { success: true, message: 'Đã tạo lại mã QR và token ghép nối mới', data };
    }
    async assignProduct(id, body, req) {
        return this.devicesService.assignProduct(id, body, req.user);
    }
    async unassignProduct(id, req) {
        return this.devicesService.unassignProduct(id, req.user);
    }
    async disable(id, req) {
        const data = await this.devicesService.disable(id, req.user);
        return { success: true, message: 'Đã vô hiệu hóa thiết bị', data };
    }
    async enable(id, req) {
        const data = await this.devicesService.enable(id, req.user);
        return { success: true, message: 'Đã kích hoạt thiết bị', data };
    }
    async getTelemetry(id, req) {
        const data = await this.devicesService.getTelemetry(id, req.user);
        return { success: true, data };
    }
    async getAuditLogs(id, req) {
        const data = await this.devicesService.getAuditLogs(id, req.user);
        return { success: true, data };
    }
    async claim(req, body) {
        const data = await this.devicesService.claim(body.deviceId, body.claimCode, req.user.storeId, req.user.id);
        return { success: true, message: 'Kích hoạt thiết bị thành công!', data };
    }
    async assign(id, body, req) {
        const data = await this.devicesService.assign(id, body, req.user.storeId, req.user.id);
        return { success: true, message: 'Gán nút bấm thành công!', data };
    }
    async updateConfig(id, body, req) {
        const data = await this.devicesService.updateConfig(id, body, req.user);
        return { success: true, message: 'Cập nhật cấu hình thành công', data };
    }
    async toggleStatus(id, status) {
        const data = await this.devicesService.toggleStatus(id, status);
        return { success: true, message: `Trạng thái đã chuyển sang ${status}`, data };
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Get)('fleet/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getFleetStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('bulk-import'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Post)('lookup-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "lookupCode", null);
__decorate([
    (0, common_1.Post)('configure-by-code'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "configureByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/pair'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "pair", null);
__decorate([
    (0, common_1.Post)(':id/re-pair'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "repair", null);
__decorate([
    (0, common_1.Post)(':id/assign-product'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "assignProduct", null);
__decorate([
    (0, common_1.Delete)(':id/product'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "unassignProduct", null);
__decorate([
    (0, common_1.Post)(':id/disable'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "disable", null);
__decorate([
    (0, common_1.Post)(':id/enable'),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "enable", null);
__decorate([
    (0, common_1.Get)(':id/telemetry'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getTelemetry", null);
__decorate([
    (0, common_1.Get)(':id/audit-logs'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "getAuditLogs", null);
__decorate([
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Post)('claim'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "claim", null);
__decorate([
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "assign", null);
__decorate([
    (0, common_1.Put)(':id/config'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "updateConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "toggleStatus", null);
exports.DevicesController = DevicesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('devices'),
    __param(0, (0, common_1.Inject)(devices_service_1.DevicesService)),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map