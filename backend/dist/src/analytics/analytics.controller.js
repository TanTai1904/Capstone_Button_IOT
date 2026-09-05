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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsController = class AnalyticsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardAnalytics(req) {
        const storeId = req.user.storeId;
        const whereStore = storeId ? { storeId } : {};
        const [orders, devices, products] = await Promise.all([
            this.prisma.order.findMany({
                where: whereStore,
                include: { items: true },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.device.findMany({
                where: whereStore,
                include: { configuration: { include: { product: true } } },
            }),
            this.prisma.product.findMany({
                where: whereStore,
            }),
        ]);
        const salesByDay = {};
        orders.forEach((o) => {
            const day = new Date(o.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' });
            salesByDay[day] = (salesByDay[day] || 0) + o.totalAmount;
        });
        const chartData = Object.entries(salesByDay).map(([date, revenue]) => ({
            date,
            revenue,
        }));
        return {
            success: true,
            data: {
                totalOrders: orders.length,
                totalRevenue: orders
                    .filter((o) => o.status !== 'CANCELLED')
                    .reduce((sum, o) => sum + o.totalAmount, 0),
                activeButtons: devices.filter((d) => d.status === 'ACTIVE').length,
                chartData: chartData.length > 0 ? chartData : [
                    { date: '28/08', revenue: 450000 },
                    { date: '29/08', revenue: 890000 },
                    { date: '30/08', revenue: 620000 },
                    { date: '31/08', revenue: 1250000 },
                    { date: '01/09', revenue: 980000 },
                    { date: '02/09', revenue: 1450000 },
                ],
            },
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDashboardAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('analytics'),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map