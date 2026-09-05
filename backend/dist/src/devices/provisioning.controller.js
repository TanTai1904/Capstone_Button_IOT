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
exports.ProvisioningController = void 0;
const common_1 = require("@nestjs/common");
const provisioning_service_1 = require("./provisioning.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ProvisioningController = class ProvisioningController {
    constructor(provisioningService) {
        this.provisioningService = provisioningService;
    }
    async createSession(body) {
        return this.provisioningService.createSession(body);
    }
    async verifySession(sessionId) {
        return this.provisioningService.verifySession(sessionId);
    }
    async bootstrap(headers, body) {
        return this.provisioningService.bootstrap(headers, body);
    }
    async claim(id, body, req) {
        return this.provisioningService.claim(id, body, req.user);
    }
    async unclaim(id, req) {
        return this.provisioningService.unclaim(id, req.user);
    }
    async transfer(id, req) {
        return this.provisioningService.transfer(id, req.user);
    }
    async factoryReset(id, req) {
        return this.provisioningService.factoryReset(id, req.user);
    }
    async changeWifi(id, body, req) {
        return this.provisioningService.changeWifi(id, req.user, body);
    }
    async getSecurityIncidents() {
        const data = this.provisioningService.getSecurityIncidents();
        return { success: true, data };
    }
};
exports.ProvisioningController = ProvisioningController;
__decorate([
    (0, common_1.Post)('provisioning/session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('provisioning/verify'),
    __param(0, (0, common_1.Body)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "verifySession", null);
__decorate([
    (0, common_1.Post)('devices/bootstrap'),
    __param(0, (0, common_1.Headers)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "bootstrap", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, common_1.Post)('devices/:id/claim'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "claim", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('CUSTOMER', 'SUPER_ADMIN'),
    (0, common_1.Post)('devices/:id/unclaim'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "unclaim", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('CUSTOMER'),
    (0, common_1.Post)('devices/:id/transfer'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "transfer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Post)('devices/:id/factory-reset'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "factoryReset", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('CUSTOMER', 'STORE_OWNER', 'STORE_MANAGER', 'SUPER_ADMIN'),
    (0, common_1.Post)(['devices/:id/change-wifi', 'provisioning/devices/:id/change-wifi']),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "changeWifi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    (0, common_1.Get)('admin/security/devices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProvisioningController.prototype, "getSecurityIncidents", null);
exports.ProvisioningController = ProvisioningController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(provisioning_service_1.ProvisioningService)),
    __metadata("design:paramtypes", [provisioning_service_1.ProvisioningService])
], ProvisioningController);
//# sourceMappingURL=provisioning.controller.js.map