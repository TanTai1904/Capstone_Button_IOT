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
exports.IotController = void 0;
const common_1 = require("@nestjs/common");
const iot_service_1 = require("./iot.service");
const hmac_auth_guard_1 = require("../common/guards/hmac-auth.guard");
let IotController = class IotController {
    constructor(iotService) {
        this.iotService = iotService;
    }
    handleEvent(req, body) {
        return this.iotService.handleEvent(req.device, body);
    }
    handleTelemetry(req, body) {
        return this.iotService.handleTelemetry(req.device, body);
    }
    getConfig(req) {
        return this.iotService.getConfig(req.device);
    }
};
exports.IotController = IotController;
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IotController.prototype, "handleEvent", null);
__decorate([
    (0, common_1.Post)('telemetry'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IotController.prototype, "handleTelemetry", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IotController.prototype, "getConfig", null);
exports.IotController = IotController = __decorate([
    (0, common_1.UseGuards)(hmac_auth_guard_1.HmacAuthGuard),
    (0, common_1.Controller)('iot'),
    __param(0, (0, common_1.Inject)(iot_service_1.IotService)),
    __metadata("design:paramtypes", [iot_service_1.IotService])
], IotController);
//# sourceMappingURL=iot.controller.js.map