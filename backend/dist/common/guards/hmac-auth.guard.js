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
exports.HmacAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_service_1 = require("../../security/crypto.service");
const nonceCache = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [nonce, expiresAt] of nonceCache.entries()) {
        if (expiresAt < now) {
            nonceCache.delete(nonce);
        }
    }
}, 60000);
let HmacAuthGuard = class HmacAuthGuard {
    constructor(prisma, crypto) {
        this.prisma = prisma;
        this.crypto = crypto;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const deviceId = req.headers['x-device-id'];
        const timestampStr = req.headers['x-timestamp'];
        const nonce = req.headers['x-nonce'];
        const signature = req.headers['x-signature'];
        if (!deviceId || !timestampStr || !nonce || !signature) {
            throw new common_1.UnauthorizedException('Thiếu các headers bảo mật thiết bị (x-device-id, x-timestamp, x-nonce, x-signature)');
        }
        let timestamp = parseInt(timestampStr, 10);
        if (timestamp < 100000000000) {
            timestamp = timestamp * 1000;
        }
        const now = Date.now();
        const driftSeconds = Math.abs(now - timestamp) / 1000;
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        if (isNaN(timestamp) || (!isDev && driftSeconds > 300)) {
            throw new common_1.UnauthorizedException(`Thời gian thiết bị không đồng bộ hoặc đã hết hạn (${Math.round(driftSeconds)}s lệch)`);
        }
        const nonceKey = `${deviceId}:${nonce}`;
        if (nonceCache.has(nonceKey)) {
            throw new common_1.ConflictException({
                statusCode: 409,
                code: 'REPLAY_DETECTED',
                message: 'Nonce đã được sử dụng. Phát hiện dấu hiệu Replay Attack!',
            });
        }
        nonceCache.set(nonceKey, now + 120000);
        const device = await this.prisma.device.findUnique({
            where: { deviceId },
            include: { configuration: true },
        });
        if (!device) {
            throw new common_1.NotFoundException(`Thiết bị không tồn tại: ${deviceId}`);
        }
        if (device.status !== 'ACTIVE') {
            if (device.status === 'READY_FOR_CUSTOMER' || device.status === 'CLAIMED') {
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { status: 'ACTIVE' },
                });
                device.status = 'ACTIVE';
            }
            else {
                throw new common_1.ForbiddenException(`Thiết bị đang ở trạng thái không hoạt động (${device.status})`);
            }
        }
        const bodyString = JSON.stringify(req.body || {});
        const expectedSignature = this.crypto.calculateDeviceSignature(device.deviceSecret, deviceId, timestampStr, nonce, bodyString);
        if (!this.crypto.safeCompare(signature, expectedSignature)) {
            console.warn(`[HMAC ERROR] Received sig: "${signature}"`);
            console.warn(`[HMAC ERROR] Expected sig: "${expectedSignature}"`);
            console.warn(`[HMAC ERROR] Payload: "${deviceId}:${timestampStr}:${nonce}:${bodyString}"`);
            throw new common_1.UnauthorizedException({
                statusCode: 401,
                code: 'INVALID_SIGNATURE',
                message: 'Chữ ký mã hóa của thiết bị không hợp lệ',
            });
        }
        req.device = device;
        return true;
    }
};
exports.HmacAuthGuard = HmacAuthGuard;
exports.HmacAuthGuard = HmacAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(crypto_service_1.CryptoService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService])
], HmacAuthGuard);
//# sourceMappingURL=hmac-auth.guard.js.map