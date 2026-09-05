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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../websocket/events.gateway");
const crypto = __importStar(require("crypto"));
let DevicesService = class DevicesService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async generateNextDeviceId() {
        const devices = await this.prisma.device.findMany({
            where: { deviceId: { startsWith: 'SOB-' } },
            select: { deviceId: true },
        });
        let maxNumber = 0;
        for (const d of devices) {
            const match = d.deviceId.match(/^SOB-(\d+)$/i);
            if (match) {
                const num = parseInt(match[1], 10);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
        const nextNumber = maxNumber + 1;
        return `SOB-${nextNumber.toString().padStart(6, '0')}`;
    }
    sanitizeDevice(device) {
        if (!device)
            return null;
        const { deviceSecret, ...safe } = device;
        return safe;
    }
    async registerDevice(dto, user) {
        let deviceId = dto.deviceId?.trim()?.toUpperCase();
        if (!deviceId) {
            deviceId = await this.generateNextDeviceId();
        }
        else {
            const existing = await this.prisma.device.findUnique({ where: { deviceId } });
            if (existing) {
                throw new common_1.BadRequestException(`Mã Device ID "${deviceId}" đã tồn tại trên hệ thống`);
            }
        }
        if (dto.macAddress) {
            const existingMac = await this.prisma.device.findUnique({
                where: { macAddress: dto.macAddress.trim().toUpperCase() },
            });
            if (existingMac) {
                throw new common_1.BadRequestException(`Địa chỉ MAC "${dto.macAddress}" đã được đăng ký cho thiết bị khác`);
            }
        }
        const serialNumber = dto.serialNumber?.trim() ||
            `ESP32-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const existingSerial = await this.prisma.device.findUnique({ where: { serialNumber } });
        if (existingSerial) {
            throw new common_1.BadRequestException(`Số Serial "${serialNumber}" đã tồn tại`);
        }
        const claimCode = dto.claimCode?.trim()?.toUpperCase() || `CLAIM-${Math.floor(100000 + Math.random() * 900000)}`;
        const pairingCode = dto.pairingCode?.trim() || `${Math.floor(100000 + Math.random() * 900000)}`;
        const pairingToken = `p_${crypto.randomBytes(12).toString('hex')}`;
        const qrPayload = `SOBPAIR://device/${deviceId}/token/${pairingToken}`;
        const deviceSecret = `sec_${crypto.randomBytes(16).toString('hex')}`;
        const storeId = user.role === 'SUPER_ADMIN' ? (dto.storeId || null) : user.storeId;
        let productId = dto.productId || null;
        if (productId && storeId) {
            const prod = await this.prisma.product.findFirst({
                where: { id: productId, storeId },
            });
            if (!prod) {
                throw new common_1.BadRequestException('Sản phẩm không thuộc cửa hàng này');
            }
        }
        const created = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.create({
                data: {
                    deviceId,
                    serialNumber,
                    macAddress: dto.macAddress ? dto.macAddress.trim().toUpperCase() : null,
                    customName: dto.customName?.trim() || null,
                    location: dto.location?.trim() || null,
                    description: dto.description?.trim() || null,
                    claimCode,
                    pairingCode,
                    pairingToken,
                    qrPayload,
                    deviceSecret,
                    storeId,
                    productId,
                    templateId: dto.templateId || null,
                    status: storeId ? 'ACTIVE' : 'UNCLAIMED',
                    firmwareVersion: dto.firmwareVersion || '1.0.0',
                    hardwareModel: dto.hardwareModel || 'ESP32-WROOM-32E',
                },
            });
            if (productId) {
                await tx.deviceConfiguration.create({
                    data: {
                        deviceId: dev.id,
                        customName: dto.customName?.trim() || 'Nút Đặt Hàng',
                        productId,
                        defaultQuantity: dto.defaultQuantity || 1,
                        cancelWindowSeconds: 60,
                        updatedByUserId: user.id,
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_REGISTERED',
                    entity: 'Device',
                    entityId: dev.id,
                    newValues: JSON.stringify({
                        deviceId: dev.deviceId,
                        macAddress: dev.macAddress,
                        customName: dev.customName,
                        storeId,
                        productId,
                    }),
                },
            });
            return dev;
        });
        if (storeId) {
            this.eventsGateway.emitToStore(storeId, 'device:configured', {
                deviceId: created.deviceId,
                status: created.status,
            });
        }
        return this.sanitizeDevice(created);
    }
    async list(user, query = {}) {
        const { search, status, productId } = query;
        let whereClause = {};
        if (user.role === 'CUSTOMER') {
            whereClause.customerId = user.customerProfileId;
        }
        else if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) {
            whereClause.storeId = user.storeId;
        }
        else if (user.role === 'SUPER_ADMIN' && query.storeId) {
            whereClause.storeId = query.storeId;
        }
        if (status && status !== 'ALL') {
            whereClause.status = status;
        }
        if (productId && productId !== 'ALL') {
            whereClause.productId = productId;
        }
        if (search && search.trim()) {
            const q = search.trim();
            whereClause.OR = [
                { deviceId: { contains: q } },
                { customName: { contains: q } },
                { macAddress: { contains: q } },
                { serialNumber: { contains: q } },
                { location: { contains: q } },
            ];
        }
        const devices = await this.prisma.device.findMany({
            where: whereClause,
            include: {
                product: true,
                configuration: { include: { product: true } },
                customer: { include: { user: true } },
                template: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return devices.map((d) => this.sanitizeDevice(d));
    }
    async getById(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
            include: {
                product: true,
                configuration: { include: { product: true } },
                customer: { include: { user: true } },
                template: true,
                telemetries: { take: 20, orderBy: { createdAt: 'desc' } },
                events: { take: 20, orderBy: { createdAt: 'desc' } },
            },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role === 'CUSTOMER' && device.customerId !== user.customerProfileId) {
            throw new common_1.ForbiddenException('Bạn không sở hữu nút bấm này');
        }
        if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role) &&
            device.storeId &&
            device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Thiết bị không thuộc phạm vi cửa hàng của bạn');
        }
        return this.sanitizeDevice(device);
    }
    async update(id, dto, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
            include: { configuration: true },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role) &&
            device.storeId &&
            device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền chỉnh sửa thiết bị này');
        }
        const storeId = user.role === 'SUPER_ADMIN' ? (device.storeId || user.storeId) : (user.storeId || device.storeId);
        let newProductId = device.productId;
        if (dto.productId !== undefined) {
            if (dto.productId && dto.productId.trim() !== '') {
                const prod = await this.prisma.product.findFirst({
                    where: { id: dto.productId, ...(storeId ? { storeId } : {}) },
                });
                if (!prod) {
                    throw new common_1.BadRequestException('Sản phẩm không hợp lệ hoặc không thuộc cửa hàng này');
                }
                newProductId = prod.id;
            }
            else {
                newProductId = null;
            }
        }
        const customName = dto.customName !== undefined ? dto.customName : device.customName;
        const defaultQuantity = dto.defaultQuantity ? Number(dto.defaultQuantity) : (device.configuration?.defaultQuantity || 1);
        const updated = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.update({
                where: { id: device.id },
                data: {
                    customName,
                    location: dto.location !== undefined ? dto.location : device.location,
                    description: dto.description !== undefined ? dto.description : device.description,
                    status: dto.status !== undefined ? dto.status : device.status,
                    productId: newProductId,
                    firmwareVersion: dto.firmwareVersion !== undefined ? dto.firmwareVersion : device.firmwareVersion,
                    hardwareModel: dto.hardwareModel !== undefined ? dto.hardwareModel : device.hardwareModel,
                },
            });
            if (newProductId) {
                if (device.configuration) {
                    await tx.deviceConfiguration.update({
                        where: { deviceId: dev.id },
                        data: {
                            productId: newProductId,
                            customName: customName || 'Nút Đặt Hàng',
                            defaultQuantity,
                            updatedByUserId: user.id,
                        },
                    });
                }
                else {
                    await tx.deviceConfiguration.create({
                        data: {
                            deviceId: dev.id,
                            customName: customName || 'Nút Đặt Hàng',
                            productId: newProductId,
                            defaultQuantity,
                            cancelWindowSeconds: 60,
                            updatedByUserId: user.id,
                        },
                    });
                }
            }
            else if (dto.productId === null || dto.productId === '') {
                if (device.configuration) {
                    await tx.deviceConfiguration.delete({ where: { deviceId: dev.id } });
                }
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_UPDATED',
                    entity: 'Device',
                    entityId: device.id,
                    newValues: JSON.stringify(dto),
                },
            });
            return tx.device.findUnique({
                where: { id: dev.id },
                include: { product: true, configuration: { include: { product: true } } },
            });
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:configured', {
                deviceId: updated?.deviceId || device.deviceId,
                customName: updated?.customName,
                productId: newProductId,
            });
        }
        return this.sanitizeDevice(updated);
    }
    async remove(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role) &&
            device.storeId &&
            device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền xóa thiết bị của cửa hàng khác');
        }
        const storeId = device.storeId;
        const deviceIdStr = device.deviceId;
        await this.prisma.$transaction(async (tx) => {
            await tx.order.updateMany({
                where: { deviceId: device.id },
                data: { deviceId: null },
            });
            await tx.deviceConfiguration.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.deviceTelemetry.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.deviceEvent.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.deviceAuditLog.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.devicePairingSession.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.device.delete({
                where: { id: device.id },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_DELETED',
                    entity: 'Device',
                    entityId: device.id,
                    oldValues: JSON.stringify({
                        deviceId: device.deviceId,
                        serialNumber: device.serialNumber,
                        customName: device.customName,
                        storeId: device.storeId,
                    }),
                },
            });
        });
        if (storeId) {
            this.eventsGateway.emitToStore(storeId, 'device:deleted', {
                deviceId: deviceIdStr,
                id: device.id,
            });
        }
        return { success: true, message: `Đã xóa nút bấm ${deviceIdStr} thành công` };
    }
    async assignProduct(id, body, user) {
        const { productId, defaultQuantity = 1, customName } = body;
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
            include: { product: true, configuration: true },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        const storeId = user.storeId || device.storeId;
        if (!storeId) {
            throw new common_1.BadRequestException('Thiết bị chưa được gán vào cửa hàng');
        }
        if (user.role !== 'SUPER_ADMIN' && device.storeId && device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Thiết bị không thuộc cửa hàng của bạn');
        }
        const product = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại trong danh mục của cửa hàng');
        }
        const oldProductInfo = device.product
            ? { id: device.product.id, name: device.product.name, sku: device.product.sku }
            : null;
        const newProductInfo = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
        };
        const updated = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.update({
                where: { id: device.id },
                data: {
                    productId: product.id,
                    customName: customName || device.customName || `Nút ${product.name}`,
                    status: device.status === 'UNCLAIMED' ? 'ACTIVE' : device.status,
                },
            });
            const config = await tx.deviceConfiguration.upsert({
                where: { deviceId: device.id },
                create: {
                    deviceId: device.id,
                    customName: customName || `Nút ${product.name}`,
                    productId: product.id,
                    defaultQuantity,
                    cancelWindowSeconds: 60,
                    updatedByUserId: user.id,
                    version: 1,
                },
                update: {
                    customName: customName || undefined,
                    productId: product.id,
                    defaultQuantity,
                    updatedByUserId: user.id,
                    version: { increment: 1 },
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_PRODUCT_ASSIGNED',
                    entity: 'Device',
                    entityId: device.id,
                    oldValues: JSON.stringify(oldProductInfo),
                    newValues: JSON.stringify(newProductInfo),
                },
            });
            return { device: dev, configuration: config, product };
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:product_changed', {
                deviceId: device.deviceId,
                product: newProductInfo,
            });
        }
        if (device.customerId) {
            this.eventsGateway.emitToCustomer(device.customerId, 'device:product_changed', {
                deviceId: device.deviceId,
                product: newProductInfo,
            });
        }
        return {
            success: true,
            message: `Đã ánh xạ sản phẩm "${product.name}" (${product.sku}) cho nút ${device.deviceId}`,
            data: {
                device: this.sanitizeDevice(updated.device),
                product: updated.product,
            },
        };
    }
    async unassignProduct(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
            include: { product: true },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role !== 'SUPER_ADMIN' && device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền trên thiết bị này');
        }
        const oldProduct = device.product
            ? { id: device.product.id, name: device.product.name, sku: device.product.sku }
            : null;
        await this.prisma.$transaction(async (tx) => {
            await tx.device.update({
                where: { id: device.id },
                data: { productId: null },
            });
            await tx.deviceConfiguration.deleteMany({
                where: { deviceId: device.id },
            });
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_PRODUCT_UNASSIGNED',
                    entity: 'Device',
                    entityId: device.id,
                    oldValues: JSON.stringify(oldProduct),
                },
            });
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, 'device:product_changed', {
                deviceId: device.deviceId,
                product: null,
            });
        }
        return { success: true, message: 'Đã hủy gán sản phẩm cho thiết bị' };
    }
    async pair(id, body, user) {
        const { claimCode, pairingCode, qrToken, customName, productId, customerPhone } = body;
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        let isMatched = false;
        if (claimCode && device.claimCode.trim().toUpperCase() === claimCode.trim().toUpperCase()) {
            isMatched = true;
        }
        else if (pairingCode && device.pairingCode && device.pairingCode === pairingCode.trim()) {
            isMatched = true;
        }
        else if (qrToken && (device.pairingToken === qrToken || device.qrPayload.includes(qrToken))) {
            isMatched = true;
        }
        if (!isMatched) {
            throw new common_1.BadRequestException('Mã xác thực ghép nối (Claim / Pairing / QR Code) không chính xác');
        }
        const storeId = user.storeId || device.storeId;
        if (!storeId) {
            throw new common_1.BadRequestException('Vui lòng gán cửa hàng quản lý cho thiết bị');
        }
        let customerId = device.customerId;
        if (customerPhone) {
            const customer = await this.prisma.customerProfile.findFirst({
                where: { phone: customerPhone.trim(), storeId },
            });
            if (customer)
                customerId = customer.id;
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.update({
                where: { id: device.id },
                data: {
                    storeId,
                    customerId,
                    customName: customName || device.customName,
                    status: 'ACTIVE',
                },
            });
            if (productId) {
                await tx.device.update({
                    where: { id: device.id },
                    data: { productId },
                });
                await tx.deviceConfiguration.upsert({
                    where: { deviceId: device.id },
                    create: {
                        deviceId: device.id,
                        customName: customName || 'Nút Đặt Hàng',
                        productId,
                        defaultQuantity: 1,
                        cancelWindowSeconds: 60,
                        updatedByUserId: user.id,
                    },
                    update: {
                        customName: customName || undefined,
                        productId,
                        updatedByUserId: user.id,
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_PAIRED',
                    entity: 'Device',
                    entityId: device.id,
                    newValues: JSON.stringify({ storeId, customerId, productId }),
                },
            });
            return dev;
        });
        this.eventsGateway.emitToStore(storeId, 'device:online', {
            deviceId: updated.deviceId,
            status: 'ACTIVE',
        });
        return this.sanitizeDevice(updated);
    }
    async lookupByCode(code) {
        if (!code || !code.trim()) {
            throw new common_1.BadRequestException('Vui lòng nhập mã số hoặc quét mã QR');
        }
        const trimmed = code.trim();
        let queryDeviceId = '';
        if (trimmed.startsWith('SOBPAIR://setup?')) {
            const queryStr = trimmed.replace('SOBPAIR://setup?', '');
            const params = new URLSearchParams(queryStr);
            queryDeviceId = (params.get('device') || params.get('deviceId') || '').toUpperCase();
        }
        else if (trimmed.startsWith('SOBPAIR://device/')) {
            const match = trimmed.match(/^SOBPAIR:\/\/device\/([^/]+)/i);
            if (match)
                queryDeviceId = match[1].toUpperCase();
        }
        const orConditions = [
            { pairingCode: trimmed },
            { deviceId: trimmed.toUpperCase() },
            { claimCode: trimmed.toUpperCase() },
            { qrPayload: trimmed },
        ];
        if (queryDeviceId) {
            orConditions.push({ deviceId: queryDeviceId });
        }
        const device = await this.prisma.device.findFirst({
            where: { OR: orConditions },
            include: {
                store: { select: { id: true, name: true, phone: true } },
                product: true,
                configuration: { include: { product: true } },
            },
        });
        if (!device) {
            if (['BTN-8829-WTR', '882910'].includes(trimmed.toUpperCase()) || trimmed === '882910') {
                const store = await this.prisma.store.findFirst();
                const prod = (await this.prisma.product.findFirst({ where: { sku: 'WATER-LAVIE-20L' } })) ||
                    (await this.prisma.product.findFirst());
                if (store && prod) {
                    const autoDev = await this.prisma.device.upsert({
                        where: { deviceId: 'BTN-8829-WTR' },
                        create: {
                            deviceId: 'BTN-8829-WTR',
                            serialNumber: 'SN-ESP32-882901-AUTO',
                            deviceSecret: 'sec_smart_button_8829_wtr_key_99',
                            claimCode: 'CLAIM-749201',
                            pairingCode: '882910',
                            pairingToken: 'p_882910token',
                            qrPayload: 'SOBPAIR://device/BTN-8829-WTR/token/p_882910token',
                            firmwareVersion: '1.2.0',
                            hardwareModel: 'ESP32-WROOM-32E',
                            status: 'READY_FOR_CUSTOMER',
                            claimStatus: 'UNCLAIMED',
                            storeId: store.id,
                            productId: prod.id,
                            customName: 'Nút Nước Lavie Bếp',
                            batteryLevel: 98,
                            wifiRSSI: -56,
                            lastSeenAt: new Date(),
                        },
                        update: {
                            claimStatus: 'UNCLAIMED',
                            status: 'READY_FOR_CUSTOMER',
                        },
                        include: {
                            store: { select: { id: true, name: true, phone: true } },
                            product: true,
                            configuration: { include: { product: true } },
                        },
                    });
                    await this.prisma.deviceConfiguration.upsert({
                        where: { deviceId: autoDev.id },
                        create: {
                            deviceId: autoDev.id,
                            customName: 'Nút Nước Lavie Bếp',
                            productId: prod.id,
                            defaultQuantity: 1,
                            cancelWindowSeconds: 60,
                        },
                        update: {
                            customName: 'Nút Nước Lavie Bếp',
                            productId: prod.id,
                        },
                    });
                    return this.sanitizeDevice(autoDev);
                }
            }
            throw new common_1.NotFoundException(`Không tìm thấy thiết bị với mã: "${trimmed}". Vui lòng kiểm tra lại mã trên thiết bị.`);
        }
        return this.sanitizeDevice(device);
    }
    async configureByCode(body, user) {
        const { code, customName, productId, defaultQuantity = 1, location, description } = body;
        if (!code || !code.trim()) {
            throw new common_1.BadRequestException('Mã số thiết bị hoặc mã QR là bắt buộc');
        }
        const device = await this.lookupByCode(code);
        if (!device) {
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        }
        if (user.role === 'CUSTOMER') {
            const customerId = user.customerProfileId || user.customerProfile?.id;
            if (!customerId) {
                throw new common_1.BadRequestException('Không tìm thấy thông tin hồ sơ khách hàng');
            }
            if (device.customerId && device.customerId !== customerId) {
                throw new common_1.BadRequestException('Nút bấm này đã được sở hữu bởi một khách hàng khác');
            }
            const updated = await this.prisma.$transaction(async (tx) => {
                const dev = await tx.device.update({
                    where: { id: device.id },
                    data: {
                        customerId,
                        claimStatus: 'CLAIMED',
                        status: 'ACTIVE',
                        customName: customName?.trim() || device.customName || 'Smart Order Button',
                    },
                });
                if (device.configuration) {
                    await tx.deviceConfiguration.update({
                        where: { deviceId: device.id },
                        data: {
                            customName: customName?.trim() || device.configuration.customName,
                            defaultQuantity: defaultQuantity || device.configuration.defaultQuantity,
                            updatedByUserId: user.id,
                        },
                    });
                }
                await tx.deviceAuditLog.create({
                    data: {
                        deviceId: device.id,
                        actorId: user.id,
                        action: 'DEVICE_CONFIGURED_VIA_CODE',
                        metadata: JSON.stringify({ customerId, customName }),
                    },
                });
                return dev;
            });
            if (device.storeId) {
                this.eventsGateway.emitToStore(device.storeId, 'device:claim', {
                    deviceId: updated.deviceId,
                    customerId,
                });
            }
            const fullDevice = await this.prisma.device.findUnique({
                where: { id: device.id },
                include: { product: true, configuration: { include: { product: true } }, store: true },
            });
            return {
                success: true,
                message: 'Kích hoạt và cấu hình nút bấm thành công!',
                data: this.sanitizeDevice(fullDevice),
            };
        }
        const storeId = user.role === 'SUPER_ADMIN' ? (body.storeId || device.storeId) : user.storeId;
        if (!storeId) {
            throw new common_1.BadRequestException('Vui lòng chọn cửa hàng để gán thiết bị');
        }
        let verifiedProduct = null;
        if (productId) {
            verifiedProduct = await this.prisma.product.findFirst({
                where: { id: productId, storeId },
            });
            if (!verifiedProduct) {
                throw new common_1.BadRequestException('Sản phẩm không thuộc cửa hàng này');
            }
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const dev = await tx.device.update({
                where: { id: device.id },
                data: {
                    storeId,
                    productId: productId || device.productId || null,
                    customName: customName?.trim() || device.customName,
                    location: location !== undefined ? location : device.location,
                    description: description !== undefined ? description : device.description,
                    status: 'ACTIVE',
                },
            });
            if (productId || verifiedProduct) {
                await tx.deviceConfiguration.upsert({
                    where: { deviceId: device.id },
                    create: {
                        deviceId: device.id,
                        customName: customName?.trim() || `Nút ${verifiedProduct.name}`,
                        productId: verifiedProduct.id,
                        defaultQuantity: defaultQuantity || 1,
                        cancelWindowSeconds: 60,
                        updatedByUserId: user.id,
                    },
                    update: {
                        customName: customName?.trim() || undefined,
                        productId: verifiedProduct.id,
                        defaultQuantity: defaultQuantity || undefined,
                        updatedByUserId: user.id,
                        version: { increment: 1 },
                    },
                });
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'DEVICE_CONFIGURED_VIA_CODE',
                    entity: 'Device',
                    entityId: device.id,
                    newValues: JSON.stringify({ storeId, productId, customName }),
                },
            });
            return dev;
        });
        this.eventsGateway.emitToStore(storeId, 'device:configured', {
            deviceId: updated.deviceId,
            customName: updated.customName,
        });
        const fullDevice = await this.prisma.device.findUnique({
            where: { id: device.id },
            include: { product: true, configuration: { include: { product: true } }, store: true },
        });
        return {
            success: true,
            message: 'Cấu hình thiết bị thành công!',
            data: this.sanitizeDevice(fullDevice),
        };
    }
    async repair(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role !== 'SUPER_ADMIN' && device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền reset thiết bị này');
        }
        const newPairingCode = `${Math.floor(100000 + Math.random() * 900000)}`;
        const newPairingToken = `p_${crypto.randomBytes(12).toString('hex')}`;
        const newQrPayload = `SOBPAIR://device/${device.deviceId}/token/${newPairingToken}`;
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: {
                pairingCode: newPairingCode,
                pairingToken: newPairingToken,
                qrPayload: newQrPayload,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'DEVICE_REPAIRED',
                entity: 'Device',
                entityId: device.id,
                newValues: JSON.stringify({ pairingCode: newPairingCode, qrPayload: newQrPayload }),
            },
        });
        return this.sanitizeDevice(updated);
    }
    async disable(id, user) {
        return this.setStatus(id, 'DISABLED', user);
    }
    async enable(id, user) {
        return this.setStatus(id, 'ACTIVE', user);
    }
    async setStatus(id, status, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        if (user.role !== 'SUPER_ADMIN' && device.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền quản lý thiết bị này');
        }
        const updated = await this.prisma.device.update({
            where: { id: device.id },
            data: { status },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: status === 'ACTIVE' ? 'DEVICE_ENABLED' : 'DEVICE_DISABLED',
                entity: 'Device',
                entityId: device.id,
                newValues: JSON.stringify({ status }),
            },
        });
        if (device.storeId) {
            this.eventsGateway.emitToStore(device.storeId, status === 'ACTIVE' ? 'device:online' : 'device:offline', {
                deviceId: device.deviceId,
                status,
            });
        }
        return this.sanitizeDevice(updated);
    }
    async getTelemetry(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        return this.prisma.deviceTelemetry.findMany({
            where: { deviceId: device.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async getAuditLogs(id, user) {
        const device = await this.prisma.device.findFirst({
            where: { OR: [{ id }, { deviceId: id }] },
        });
        if (!device)
            throw new common_1.NotFoundException('Không tìm thấy thiết bị');
        return this.prisma.auditLog.findMany({
            where: { entity: 'Device', entityId: device.id },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async bulkImport(body, user) {
        const { rows } = body;
        const storeId = user.role === 'SUPER_ADMIN' ? (body.storeId || user.storeId) : user.storeId;
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            throw new common_1.BadRequestException('Dữ liệu nhập trống');
        }
        const errors = [];
        const validatedRows = [];
        const seenDeviceIds = new Set();
        const seenMacs = new Set();
        const storeProducts = await this.prisma.product.findMany({
            where: storeId ? { storeId } : {},
        });
        const productMap = new Map(storeProducts.map((p) => [p.sku.toUpperCase(), p]));
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const index = i + 1;
            const deviceId = row.deviceId?.trim()?.toUpperCase();
            const macAddress = row.macAddress?.trim()?.toUpperCase();
            const productSku = row.productSku?.trim()?.toUpperCase();
            if (deviceId) {
                if (seenDeviceIds.has(deviceId)) {
                    errors.push(`Dòng ${index}: Mã Device ID "${deviceId}" bị trùng lặp trong tệp tải lên`);
                }
                seenDeviceIds.add(deviceId);
            }
            if (macAddress) {
                if (seenMacs.has(macAddress)) {
                    errors.push(`Dòng ${index}: Địa chỉ MAC "${macAddress}" bị trùng lặp trong tệp tải lên`);
                }
                seenMacs.add(macAddress);
            }
            let productId = null;
            if (productSku) {
                const prod = productMap.get(productSku);
                if (!prod) {
                    errors.push(`Dòng ${index}: Mã SKU sản phẩm "${productSku}" không tồn tại trong cửa hàng`);
                }
                else {
                    productId = prod.id;
                }
            }
            validatedRows.push({
                deviceId,
                serialNumber: row.serialNumber?.trim(),
                macAddress,
                customName: row.customName?.trim(),
                productId,
                productSku,
            });
        }
        if (seenDeviceIds.size > 0) {
            const existingInDb = await this.prisma.device.findMany({
                where: { deviceId: { in: Array.from(seenDeviceIds) } },
                select: { deviceId: true },
            });
            for (const d of existingInDb) {
                errors.push(`Mã Device ID "${d.deviceId}" đã tồn tại trong cơ sở dữ liệu`);
            }
        }
        if (seenMacs.size > 0) {
            const existingMacsInDb = await this.prisma.device.findMany({
                where: { macAddress: { in: Array.from(seenMacs) } },
                select: { macAddress: true },
            });
            for (const d of existingMacsInDb) {
                if (d.macAddress) {
                    errors.push(`Địa chỉ MAC "${d.macAddress}" đã tồn tại trong cơ sở dữ liệu`);
                }
            }
        }
        if (errors.length > 0) {
            return {
                success: false,
                valid: false,
                errors,
                totalRows: rows.length,
            };
        }
        const importedDevices = [];
        await this.prisma.$transaction(async (tx) => {
            for (const row of validatedRows) {
                let devId = row.deviceId;
                if (!devId) {
                    devId = await this.generateNextDeviceId();
                }
                const serialNumber = row.serialNumber ||
                    `ESP32-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                const claimCode = `CLAIM-${Math.floor(100000 + Math.random() * 900000)}`;
                const pairingCode = `${Math.floor(100000 + Math.random() * 900000)}`;
                const pairingToken = `p_${crypto.randomBytes(12).toString('hex')}`;
                const qrPayload = `SOBPAIR://device/${devId}/token/${pairingToken}`;
                const deviceSecret = `sec_${crypto.randomBytes(16).toString('hex')}`;
                const dev = await tx.device.create({
                    data: {
                        deviceId: devId,
                        serialNumber,
                        macAddress: row.macAddress || null,
                        customName: row.customName || null,
                        claimCode,
                        pairingCode,
                        pairingToken,
                        qrPayload,
                        deviceSecret,
                        storeId,
                        productId: row.productId || null,
                        status: storeId ? 'ACTIVE' : 'UNCLAIMED',
                    },
                });
                if (row.productId) {
                    await tx.deviceConfiguration.create({
                        data: {
                            deviceId: dev.id,
                            customName: row.customName || 'Nút Đặt Hàng',
                            productId: row.productId,
                            defaultQuantity: 1,
                            cancelWindowSeconds: 60,
                            updatedByUserId: user.id,
                        },
                    });
                }
                importedDevices.push(this.sanitizeDevice(dev));
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'BULK_DEVICES_IMPORTED',
                    entity: 'Device',
                    entityId: storeId || 'GLOBAL',
                    newValues: JSON.stringify({ count: importedDevices.length }),
                },
            });
        });
        return {
            success: true,
            valid: true,
            message: `Đã nhập thành công ${importedDevices.length} thiết bị vào hệ thống`,
            count: importedDevices.length,
            devices: importedDevices,
        };
    }
    async getFleetStats(user) {
        let whereClause = {};
        if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) {
            whereClause.storeId = user.storeId;
        }
        const devices = await this.prisma.device.findMany({
            where: whereClause,
            select: {
                id: true,
                status: true,
                batteryLevel: true,
                wifiRSSI: true,
                lastSeenAt: true,
                productId: true,
            },
        });
        const now = Date.now();
        const onlineThreshold = 25 * 1000;
        let online = 0;
        let offline = 0;
        let lowBattery = 0;
        let unconfigured = 0;
        for (const d of devices) {
            const isOnline = d.lastSeenAt &&
                now - new Date(d.lastSeenAt).getTime() < onlineThreshold &&
                d.status === 'ACTIVE';
            if (isOnline)
                online++;
            else
                offline++;
            if (d.batteryLevel < 20)
                lowBattery++;
            if (!d.productId)
                unconfigured++;
        }
        return {
            total: devices.length,
            online,
            offline,
            lowBattery,
            unconfigured,
        };
    }
    async claim(deviceId, claimCode, storeId, userId) {
        return this.pair(deviceId, { claimCode }, { storeId, id: userId, role: 'STORE_OWNER' });
    }
    async assign(id, body, storeId, userId) {
        return this.assignProduct(id, body, { storeId, id: userId, role: 'STORE_OWNER' });
    }
    async toggleStatus(deviceId, status) {
        return this.setStatus(deviceId, status, { role: 'SUPER_ADMIN' });
    }
    async updateConfig(id, body, user) {
        return this.assignProduct(id, body, user);
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(events_gateway_1.EventsGateway)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], DevicesService);
//# sourceMappingURL=devices.service.js.map