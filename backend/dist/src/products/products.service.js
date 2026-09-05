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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(storeId) {
        return this.prisma.product.findMany({
            where: storeId ? { storeId } : {},
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(user, body) {
        const { name, brand, sku, category, unit, price, stock, imageUrl } = body;
        if (!user.storeId) {
            throw new common_1.BadRequestException('Bạn không thuộc cửa hàng nào để tạo sản phẩm');
        }
        return this.prisma.product.create({
            data: {
                storeId: user.storeId,
                name,
                brand: brand || 'Khác',
                sku,
                category: category || 'Nhu yếu phẩm',
                unit,
                price: parseFloat(price),
                stock: parseInt(stock || '0', 10),
                imageUrl,
            },
        });
    }
    async update(id, body) {
        const { name, brand, price, stock, unit, category, imageUrl, isActive } = body;
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(name ? { name } : {}),
                ...(brand ? { brand } : {}),
                ...(price !== undefined ? { price: parseFloat(price) } : {}),
                ...(stock !== undefined ? { stock: parseInt(stock, 10) } : {}),
                ...(unit ? { unit } : {}),
                ...(category ? { category } : {}),
                ...(imageUrl ? { imageUrl } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
            },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map