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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPendingStores() {
        return this.prisma.store.findMany({
            where: { status: 'PENDING_APPROVAL' },
            include: { users: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveStore(storeId, adminUser) {
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
        if (!store)
            throw new common_1.NotFoundException('Không tìm thấy cửa hàng');
        return this.prisma.$transaction(async (tx) => {
            const s = await tx.store.update({
                where: { id: storeId },
                data: {
                    status: 'ACTIVE',
                    approvedAt: new Date(),
                },
            });
            await tx.user.updateMany({
                where: { storeId, role: 'STORE_OWNER' },
                data: { isActive: true },
            });
            await tx.auditLog.create({
                data: {
                    userId: adminUser.id,
                    action: 'STORE_APPROVED',
                    entity: 'Store',
                    entityId: storeId,
                    newValues: JSON.stringify({ approvedBy: adminUser.email }),
                },
            });
            return s;
        });
    }
    async rejectStore(storeId, reason, adminUser) {
        if (!reason)
            throw new common_1.BadRequestException('Bắt buộc phải nhập lý do từ chối');
        return this.prisma.$transaction(async (tx) => {
            const s = await tx.store.update({
                where: { id: storeId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: adminUser.id,
                    action: 'STORE_REJECTED',
                    entity: 'Store',
                    entityId: storeId,
                    newValues: JSON.stringify({ reason, rejectedBy: adminUser.email }),
                },
            });
            return s;
        });
    }
    async getSystemStats() {
        const [totalStores, totalUsers, totalDevices, totalOrders, pendingStores, orders] = await Promise.all([
            this.prisma.store.count(),
            this.prisma.user.count(),
            this.prisma.device.count(),
            this.prisma.order.count(),
            this.prisma.store.count({ where: { status: 'PENDING_APPROVAL' } }),
            this.prisma.order.findMany({ select: { totalAmount: true, status: true } }),
        ]);
        const totalRevenue = orders
            .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        const activeDevices = await this.prisma.device.count({ where: { status: 'ACTIVE' } });
        return {
            totalStores,
            totalUsers,
            totalDevices,
            activeDevices,
            totalOrders,
            pendingStores,
            totalRevenue,
        };
    }
    async listAuditLogs() {
        return this.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map