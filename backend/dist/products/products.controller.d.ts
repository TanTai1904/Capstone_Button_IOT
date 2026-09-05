import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(req: any, storeId?: string): Promise<{
        success: boolean;
        data: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string;
            brand: string;
            sku: string;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
            status: string;
            isActive: boolean;
        }[];
    }>;
    create(req: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string;
            brand: string;
            sku: string;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
            status: string;
            isActive: boolean;
        };
    }>;
    update(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string;
            brand: string;
            sku: string;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
            status: string;
            isActive: boolean;
        };
    }>;
}
