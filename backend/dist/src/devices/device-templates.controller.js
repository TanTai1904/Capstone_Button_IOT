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
exports.DeviceTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const device_templates_service_1 = require("./device-templates.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let DeviceTemplatesController = class DeviceTemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async list(req) {
        const data = await this.templatesService.list(req.user);
        return { success: true, data };
    }
    async create(body, req) {
        const data = await this.templatesService.create(body, req.user);
        return { success: true, message: 'Đã tạo template mẫu thiết bị thành công', data };
    }
    async getById(id, req) {
        const data = await this.templatesService.getById(id, req.user);
        return { success: true, data };
    }
    async update(id, body, req) {
        const data = await this.templatesService.update(id, body, req.user);
        return { success: true, message: 'Cập nhật template thành công', data };
    }
    async delete(id, req) {
        return this.templatesService.delete(id, req.user);
    }
    async deploy(id, body, req) {
        return this.templatesService.deploy(id, body, req.user);
    }
};
exports.DeviceTemplatesController = DeviceTemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/deploy'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DeviceTemplatesController.prototype, "deploy", null);
exports.DeviceTemplatesController = DeviceTemplatesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Controller)('device-templates'),
    __param(0, (0, common_1.Inject)(device_templates_service_1.DeviceTemplatesService)),
    __metadata("design:paramtypes", [device_templates_service_1.DeviceTemplatesService])
], DeviceTemplatesController);
//# sourceMappingURL=device-templates.controller.js.map