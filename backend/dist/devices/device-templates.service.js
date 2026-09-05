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
exports.DeviceTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../websocket/events.gateway");
let DeviceTemplatesService = class DeviceTemplatesService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(dto, user) {
        const storeId = user.role === 'SUPER_ADMIN' ? (dto.storeId || null) : user.storeId;
        if (dto.defaultProductId && storeId) {
            const prod = await this.prisma.product.findFirst({
                where: { id: dto.defaultProductId, storeId },
            });
            if (!prod)
                throw new common_1.BadRequestException('Sản phẩm mặc định không tồn tại trong cửa hàng');
        }
        const template = await this.prisma.deviceTemplate.create({
            data: {
                name: dto.name.trim(),
                description: dto.description?.trim() || null,
                category: dto.category?.trim() || 'Nhu yếu phẩm',
                storeId,
                defaultProductId: dto.defaultProductId || null,
                singlePressAction: dto.singlePressAction || 'CREATE_ORDER',
                doublePressAction: dto.doublePressAction || 'CANCEL_ORDER',
                longPressAction: dto.longPressAction || 'WIFI_CONFIGURATION',
                defaultQuantity: dto.defaultQuantity || 1,
                cancelWindowSeconds: dto.cancelWindowSeconds || 60,
            },
            include: { defaultProduct: true },
        });
        return template;
    }
    async list(user) {
        let whereClause = {};
        if (['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role)) {
            whereClause = { OR: [{ storeId: user.storeId }, { storeId: null }] };
        }
        return this.prisma.deviceTemplate.findMany({
            where: whereClause,
            include: { defaultProduct: true, _count: { select: { devices: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getById(id, user) {
        const template = await this.prisma.deviceTemplate.findUnique({
            where: { id },
            include: { defaultProduct: true, devices: true },
        });
        if (!template)
            throw new common_1.NotFoundException('Không tìm thấy template mẫu');
        return template;
    }
    async update(id, dto, user) {
        const template = await this.prisma.deviceTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Không tìm thấy template');
        if (user.role !== 'SUPER_ADMIN' && template.storeId && template.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền chỉnh sửa template này');
        }
        return this.prisma.deviceTemplate.update({
            where: { id },
            data: {
                name: dto.name !== undefined ? dto.name.trim() : template.name,
                description: dto.description !== undefined ? dto.description : template.description,
                category: dto.category !== undefined ? dto.category : template.category,
                defaultProductId: dto.defaultProductId !== undefined ? dto.defaultProductId : template.defaultProductId,
                singlePressAction: dto.singlePressAction || template.singlePressAction,
                doublePressAction: dto.doublePressAction || template.doublePressAction,
                defaultQuantity: dto.defaultQuantity || template.defaultQuantity,
                cancelWindowSeconds: dto.cancelWindowSeconds || template.cancelWindowSeconds,
            },
            include: { defaultProduct: true },
        });
    }
    async delete(id, user) {
        const template = await this.prisma.deviceTemplate.findUnique({ where: { id } });
        if (!template)
            throw new common_1.NotFoundException('Không tìm thấy template');
        if (user.role !== 'SUPER_ADMIN' && template.storeId && template.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('Không có quyền xóa template này');
        }
        await this.prisma.deviceTemplate.delete({ where: { id } });
        return { success: true, message: 'Đã xóa template' };
    }
    async deploy(id, body, user) {
        const template = await this.prisma.deviceTemplate.findUnique({
            where: { id },
            include: { defaultProduct: true },
        });
        if (!template)
            throw new common_1.NotFoundException('Không tìm thấy template');
        const storeId = user.storeId || template.storeId;
        let targetDeviceIds = [];
        if (body.deviceIds && Array.isArray(body.deviceIds)) {
            targetDeviceIds = body.deviceIds;
        }
        else if (body.prefix && body.startRange !== undefined && body.endRange !== undefined) {
            const start = parseInt(body.startRange, 10);
            const end = parseInt(body.endRange, 10);
            const padLength = body.padLength || 3;
            for (let i = start; i <= end; i++) {
                targetDeviceIds.push(`${body.prefix}${i.toString().padStart(padLength, '0')}`);
            }
        }
        else {
            throw new common_1.BadRequestException('Vui lòng chỉ định danh sách deviceIds hoặc dải số prefix (startRange/endRange)');
        }
        const devices = await this.prisma.device.findMany({
            where: {
                OR: [
                    { deviceId: { in: targetDeviceIds } },
                    { customName: { in: targetDeviceIds } },
                ],
                ...(storeId ? { storeId } : {}),
            },
        });
        if (devices.length === 0) {
            throw new common_1.NotFoundException('Không tìm thấy thiết bị nào phù hợp trong cửa hàng để triển khai template');
        }
        const deployedIds = [];
        await this.prisma.$transaction(async (tx) => {
            for (const dev of devices) {
                await tx.device.update({
                    where: { id: dev.id },
                    data: {
                        templateId: template.id,
                        productId: template.defaultProductId || dev.productId,
                    },
                });
                if (template.defaultProductId) {
                    await tx.deviceConfiguration.upsert({
                        where: { deviceId: dev.id },
                        create: {
                            deviceId: dev.id,
                            customName: dev.customName || `Nút ${template.name}`,
                            productId: template.defaultProductId,
                            defaultQuantity: template.defaultQuantity,
                            cancelWindowSeconds: template.cancelWindowSeconds,
                            updatedByUserId: user.id,
                        },
                        update: {
                            productId: template.defaultProductId,
                            defaultQuantity: template.defaultQuantity,
                            cancelWindowSeconds: template.cancelWindowSeconds,
                            updatedByUserId: user.id,
                        },
                    });
                }
                deployedIds.push(dev.deviceId);
            }
            await tx.auditLog.create({
                data: {
                    userId: user.id,
                    action: 'TEMPLATE_DEPLOYED',
                    entity: 'DeviceTemplate',
                    entityId: template.id,
                    newValues: JSON.stringify({
                        templateName: template.name,
                        targetCount: deployedIds.length,
                        deployedIds,
                    }),
                },
            });
        });
        if (storeId) {
            this.eventsGateway.emitToStore(storeId, 'device:configured', {
                templateId: template.id,
                count: deployedIds.length,
            });
        }
        return {
            success: true,
            message: `Đã triển khai template "${template.name}" tới ${deployedIds.length} nút bấm thành công!`,
            deployedCount: deployedIds.length,
            deviceIds: deployedIds,
        };
    }
};
exports.DeviceTemplatesService = DeviceTemplatesService;
exports.DeviceTemplatesService = DeviceTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(events_gateway_1.EventsGateway)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], DeviceTemplatesService);
//# sourceMappingURL=device-templates.service.js.map