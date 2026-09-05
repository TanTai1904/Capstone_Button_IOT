"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvisioningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_service_1 = require("../security/crypto.service");
const events_gateway_1 = require("../websocket/events.gateway");
const crypto = __importStar(require("crypto"));
let ProvisioningService = class ProvisioningService {
    constructor(prisma, cryptoService, eventsGateway) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
        this.eventsGateway = eventsGateway;
        this.failedAttempts = [];
    }
    async resolveDeviceFromInput(inputStr) {
        if (!inputStr)
            throw new common_1.BadRequestException('Mã thiết bị hoặc mã QR rỗng');
        const trimmed = inputStr.trim();
        if (trimmed.startsWith('SOBPAIR://setup?')) {
            const queryStr = trimmed.replace('SOBPAIR://setup?', '');
            const params = new URLSearchParams(queryStr);
            const devId = (params.get('device') || params.get('deviceId') || '').toUpperCase();
            const tok = params.get('token') || '';
            if (devId) {
                const d = await this.prisma.device.findUnique({
                    where: { deviceId: devId },
                    include: { store: true, product: true, configuration: { include: { product: true } } },
                });
                if (d)
                    return { device: d, token: tok || d.pairingToken || 'default_tok' };
            }
        }
        const match = trimmed.match(/^SOBPAIR:\/\/device\/([^/]+)\/token\/([^/?&]+)/i);
        if (match) {
            const devId = match[1].toUpperCase();
            const tok = match[2];
            const d = await this.prisma.device.findUnique({
                where: { deviceId: devId },
                include: { store: true, product: true, configuration: { include: { product: true } } },
            });
            if (d)
                return { device: d, token: tok };
        }
        const d = await this.prisma.device.findFirst({
            where: {
                OR: [
                    { pairingCode: trimmed },
                    { deviceId: trimmed.toUpperCase() },
                    { claimCode: trimmed.toUpperCase() },
                    { qrPayload: trimmed },
                ],
            },
            include: { store: true, product: true, configuration: { include: { product: true } } },
        });
        if (d) {
            return { device: d, token: d.pairingToken || 'direct_pin' };
        }
        throw new common_1.BadRequestException(`Không tìm thấy thiết bị với mã "${trimmed}". Vui lòng kiểm tra lại mã trên thiết bị.`);
    }
    async createSession(body) {
        const rawInput = body.code || body.qrPayload || body.deviceId;
        if (!rawInput) {
            throw new common_1.BadRequestException('Vui lòng cung cấp mã số thiết bị hoặc mã QR');
        }
        const { device, token } = await this.resolveDeviceFromInput(rawInput);
        const deviceId = device.deviceId;
        if (!device) {
            this.recordSecurityEvent('INVALID_DEVICE_PAIRING', deviceId, 'Device ID không tồn tại');
            throw new common_1.NotFoundException(`Không tìm thấy thiết bị: ${deviceId}`);
        }
        if (device.status === 'REVOKED' || device.status === 'DISABLED') {
            this.recordSecurityEvent('REVOKED_DEVICE_ACCESS', deviceId, `Device trạng thái ${device.status}`);
            throw new common_1.BadRequestException(`Thiết bị này đã bị vô hiệu hóa hoặc thu hồi`);
        }
        if (device.pairingToken && device.pairingToken !== token) {
            this.recordSecurityEvent('INVALID_PAIRING_TOKEN', deviceId, 'Pairing token không khớp');
            throw new common_1.UnauthorizedException('Mã Pairing Token không hợp lệ hoặc đã hết hạn');
        }
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await this.prisma.devicePairingSession.updateMany({
            where: { deviceId: device.id, status: 'ACTIVE' },
            data: { status: 'EXPIRED' },
        });
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const session = await this.prisma.devicePairingSession.create({
            data: {
                deviceId: device.id,
                tokenHash,
                expiresAt,
                status: 'ACTIVE',
            },
        });
        await this.prisma.device.update({
            where: { id: device.id },
            data: { provisioningStatus: 'PROVISIONING' },
        });
        const assignedProduct = device.product || device.configuration?.product;
        return {
            success: true,
            data: {
                sessionId: session.id,
                deviceId: device.deviceId,
                serialNumber: device.serialNumber,
                macAddress: device.macAddress,
                customName: device.customName || 'Smart Order Button',
                storeName: device.store?.name || 'Đại Lý Cung Ứng',
                product: assignedProduct
                    ? {
                        id: assignedProduct.id,
                        name: assignedProduct.name,
                        sku: assignedProduct.sku,
                        price: assignedProduct.price,
                        unit: assignedProduct.unit,
                    }
                    : null,
                expiresAt: session.expiresAt,
            },
        };
    }
    async verifySession(sessionId) {
        const session = await this.prisma.devicePairingSession.findUnique({
            where: { id: sessionId },
            include: {
                device: {
                    include: {
                        product: true,
                        configuration: { include: { product: true } },
                    },
                },
            },
        });
        if (!session || session.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Phiên ghép nối không tồn tại hoặc đã kết thúc');
        }
        if (new Date() > session.expiresAt) {
            await this.prisma.devicePairingSession.update({
                where: { id: session.id },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.UnauthorizedException('Phiên ghép nối đã hết hạn sau 10 phút. Vui lòng quét lại mã QR.');
        }
        const assignedProduct = session.device.product || session.device.configuration?.product;
        return {
            success: true,
            valid: true,
            data: {
                sessionId: session.id,
                deviceId: session.device.deviceId,
                status: session.device.status,
                provisioningStatus: session.device.provisioningStatus,
                product: assignedProduct,
            },
        };
    }
    async bootstrap(headers, body) {
        const deviceId = headers['x-device-id']?.toString()?.trim()?.toUpperCase();
        const timestamp = parseInt(headers['x-timestamp']?.toString(), 10);
        const nonce = headers['x-nonce']?.toString()?.trim();
        const signature = headers['x-signature']?.toString()?.trim();
        if (!deviceId || !timestamp || !nonce || !signature) {
            throw new common_1.BadRequestException('Thiếu các header xác thực: x-device-id, x-timestamp, x-nonce, x-signature');
        }
        const nowSec = Math.floor(Date.now() / 1000);
        if (Math.abs(nowSec - timestamp) > 300) {
            this.recordSecurityEvent('CLOCK_DRIFT_EXCEEDED', deviceId, `Drift: ${nowSec - timestamp}s`);
            throw new common_1.UnauthorizedException('Độ lệch thời gian thiết bị vượt quá 300 giây');
        }
        const device = await this.prisma.device.findUnique({ where: { deviceId } });
        if (!device) {
            this.recordSecurityEvent('UNKNOWN_DEVICE_BOOTSTRAP', deviceId, 'Device không tồn tại');
            throw new common_1.NotFoundException(`Thiết bị ID: ${deviceId} không tồn tại`);
        }
        const rawPayload = typeof body === 'string' ? body : JSON.stringify(body || {});
        const signaturePayload = `${deviceId}:${timestamp}:${nonce}:${rawPayload}`;
        const expectedSignature = crypto
            .createHmac('sha256', device.deviceSecret)
            .update(signaturePayload)
            .digest('hex');
        if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
            this.recordSecurityEvent('HMAC_AUTH_FAILED', deviceId, 'Chữ ký HMAC-SHA256 không hợp lệ');
            throw new common_1.UnauthorizedException('Xác thực thiết bị thất bại: Sai chữ ký HMAC-SHA256');
        }
        const nonceKey = `nonce_${deviceId}_${nonce}`;
        const existingNonce = await this.prisma.idempotencyRecord.findUnique({
            where: { key: nonceKey },
        });
        if (existingNonce) {
            this.recordSecurityEvent('REPLAY_ATTACK_BLOCKED', deviceId, `Nonce tái sử dụng: ${nonce}`);
            throw new common_1.ConflictException('Phát hiện tấn công Replay: Nonce đã được sử dụng');
        }
        await this.prisma.idempotencyRecord.create({
            data: {
                key: nonceKey,
                deviceId: device.id,
                expiresAt: new Date(Date.now() + 600 * 1000),
            },
        });
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                provisioningStatus: 'CLOUD_CONNECTED',
                lastSeenAt: new Date(),
                wifiRSSI: body.wifiRssi !== undefined ? body.wifiRssi : device.wifiRSSI,
                batteryLevel: body.batteryLevel !== undefined ? body.batteryLevel : device.batteryLevel,
                firmwareVersion: body.firmwareVersion || device.firmwareVersion,
                ipAddress: body.ipAddress || null,
                uptime: body.uptime || 0,
            },
        });
        await this.prisma.deviceAuditLog.create({
            data: {
                deviceId: device.id,
                action: 'BOOTSTRAP_SUCCESS',
                metadata: JSON.stringify({
                    wifiRssi: body.wifiRssi,
                    firmwareVersion: body.firmwareVersion,
                    ipAddress: body.ipAddress,
                }),
            },
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:online', {
                deviceId: device.deviceId,
                status: updated.status,
                provisioningStatus: 'CLOUD_CONNECTED',
            });
            this.eventsGateway.emitToStore(device.storeId, 'device:heartbeat', {
                deviceId: device.deviceId,
                batteryLevel: updated.batteryLevel,
                wifiRSSI: updated.wifiRSSI,
                lastSeenAt: updated.lastSeenAt,
            });
        }
        return {
            success: true,
            message: 'Bootstrap kết nối Smart Order Cloud thành công!',
            data: {
                deviceId: device.deviceId,
                status: updated.status,
                cloudTimestamp: Date.now(),
            },
        };
    }
    async claim(deviceId, body, user) {
        if (!user || user.role !== 'CUSTOMER' || !user.customerProfileId) {
            throw new common_1.UnauthorizedException('Chỉ tài khoản khách hàng mới có quyền nhận nút bấm');
        }
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id: deviceId }, { deviceId }] },
            include: { product: true, configuration: { include: { product: true } } },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (device.customerId && device.customerId !== user.customerProfileId) {
            throw new common_1.BadRequestException('Nút bấm này đã được sở hữu bởi một khách hàng khác');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.update({
                where: { id: device.id },
                data: {
                    customerId: user.customerProfileId,
                    claimStatus: 'CLAIMED',
                    status: 'ACTIVE',
                },
            });
            await tx.devicePairingSession.updateMany({
                where: { deviceId: device.id, status: 'ACTIVE' },
                data: { status: 'USED', usedAt: new Date(), customerId: user.customerProfileId },
            });
            await tx.deviceAuditLog.create({
                data: {
                    deviceId: device.id,
                    actorId: user.id,
                    action: 'DEVICE_CLAIMED',
                    metadata: JSON.stringify({
                        customerId: user.customerProfileId,
                        claimedAt: new Date(),
                    }),
                },
            });
            return dev;
        });
        this.eventsGateway.emitToCustomer(user.customerProfileId, 'device:claim', {
            deviceId: updated.deviceId,
            status: 'ACTIVE',
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:claim', {
                deviceId: updated.deviceId,
                customerId: user.customerProfileId,
            });
        }
        const assignedProduct = device.product || device.configuration?.product;
        return {
            success: true,
            message: 'Kích hoạt sở hữu nút bấm thành công! Bạn có thể bấm nút để đặt hàng ngay.',
            data: {
                deviceId: updated.deviceId,
                product: assignedProduct,
                status: updated.status,
            },
        };
    }
    async unclaim(deviceId, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id: deviceId }, { deviceId }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role === 'CUSTOMER' && device.customerId !== user.customerProfileId) {
            throw new common_1.UnauthorizedException('Bạn không sở hữu nút bấm này');
        }
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                customerId: null,
                claimStatus: 'UNCLAIMED',
                status: 'READY_FOR_CUSTOMER',
            },
        });
        await this.prisma.deviceAuditLog.create({
            data: {
                deviceId: device.id,
                actorId: user.id,
                action: 'DEVICE_UNCLAIMED',
                metadata: JSON.stringify({ unclaimTime: new Date() }),
            },
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:unclaim', {
                deviceId: device.deviceId,
            });
        }
        return { success: true, message: 'Đã hủy gán nút bấm khỏi tài khoản' };
    }
    async transfer(deviceId, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id: deviceId }, { deviceId }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role === 'CUSTOMER' && device.customerId !== user.customerProfileId) {
            throw new common_1.UnauthorizedException('Không có quyền chuyển nhượng nút bấm này');
        }
        const newPairingToken = `p_${crypto.randomBytes(12).toString('hex')}`;
        const newQrPayload = `SOBPAIR://setup?device=${device.deviceId}&token=${newPairingToken}&v=1`;
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                customerId: null,
                claimStatus: 'TRANSFERRED',
                status: 'TRANSFER_PENDING',
                pairingToken: newPairingToken,
                qrPayload: newQrPayload,
            },
        });
        await this.prisma.deviceAuditLog.create({
            data: {
                deviceId: device.id,
                actorId: user.id,
                action: 'DEVICE_TRANSFERRED',
                metadata: JSON.stringify({ fromCustomerId: user.customerProfileId }),
            },
        });
        return {
            success: true,
            message: 'Thiết bị đã chuyển sang trạng thái chờ nhận chuyển nhượng',
            data: {
                deviceId: updated.deviceId,
                qrPayload: newQrPayload,
                token: newPairingToken,
            },
        };
    }
    async factoryReset(deviceId, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id: deviceId }, { deviceId }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        const newPairingToken = `p_${crypto.randomBytes(12).toString('hex')}`;
        const newQrPayload = `SOBPAIR://setup?device=${device.deviceId}&token=${newPairingToken}&v=1`;
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                customerId: null,
                claimStatus: 'UNCLAIMED',
                provisioningStatus: 'UNPROVISIONED',
                status: 'READY_FOR_CUSTOMER',
                pairingToken: newPairingToken,
                qrPayload: newQrPayload,
            },
        });
        await this.prisma.deviceAuditLog.create({
            data: {
                deviceId: device.id,
                actorId: user?.id || null,
                action: 'FACTORY_RESET',
                metadata: JSON.stringify({ timestamp: new Date() }),
            },
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:factory_reset', {
                deviceId: device.deviceId,
            });
        }
        return {
            success: true,
            message: 'Thiết bị đã được đưa về trạng thái xuất xưởng thành công',
            data: { deviceId: updated.deviceId, status: updated.status },
        };
    }
    async changeWifi(deviceId, user, body) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id: deviceId }, { deviceId }] },
            include: { product: true, configuration: { include: { product: true } } },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role === 'CUSTOMER' && device.customerId !== user.customerProfileId) {
            throw new common_1.UnauthorizedException('Bạn không sở hữu nút bấm này');
        }
        const newSsid = body?.ssid?.trim();
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                provisioningStatus: newSsid ? 'READY' : 'PROVISIONING',
            },
        });
        await this.prisma.deviceAuditLog.create({
            data: {
                deviceId: device.id,
                actorId: user.id,
                action: 'WIFI_RECONFIG_REQUESTED',
                metadata: JSON.stringify({
                    customerId: device.customerId,
                    newSsid: newSsid || null,
                    requestedAt: new Date(),
                }),
            },
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:wifi_changed', {
                deviceId: device.deviceId,
                status: newSsid ? 'READY' : 'PROVISIONING',
                ssid: newSsid || null,
            });
        }
        if (device.customerId) {
            this.eventsGateway.emitToCustomer(device.customerId, 'device:wifi_changed', {
                deviceId: device.deviceId,
                status: newSsid ? 'READY' : 'PROVISIONING',
                ssid: newSsid || null,
            });
        }
        return {
            success: true,
            message: newSsid
                ? `Đã cập nhật cấu hình Wi-Fi "${newSsid}" cho nút ${device.deviceId}! Quyền sở hữu và sản phẩm được bảo toàn.`
                : 'Thiết bị sẵn sàng nhận cấu hình Wi-Fi mới qua BLE / SoftAP',
            data: {
                deviceId: updated.deviceId,
                provisioningStatus: updated.provisioningStatus,
                status: updated.status,
                ssid: newSsid || null,
            },
        };
    }
    recordSecurityEvent(type, deviceId, reason) {
        this.failedAttempts.unshift({
            type,
            deviceId,
            reason,
            timestamp: new Date(),
        });
        if (this.failedAttempts.length > 100)
            this.failedAttempts.pop();
    }
    getSecurityIncidents() {
        return this.failedAttempts;
    }
};
exports.ProvisioningService = ProvisioningService;
exports.ProvisioningService = ProvisioningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(crypto_service_1.CryptoService)),
    __param(2, (0, common_1.Inject)(events_gateway_1.EventsGateway)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        crypto_service_1.CryptoService,
        events_gateway_1.EventsGateway])
], ProvisioningService);
//# sourceMappingURL=provisioning.service.js.map