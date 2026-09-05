import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(req: any, storeId?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            storeId: string;
            brand: string;
            sku: string;
            description: string | null;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
        }[];
    }>;
    create(req: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            storeId: string;
            brand: string;
            sku: string;
            description: string | null;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
        };
    }>;
    update(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            storeId: string;
            brand: string;
            sku: string;
            description: string | null;
            category: string;
            unit: string;
            price: number;
            stock: number;
            reservedStock: number;
            minStockAlert: number;
            imageUrl: string | null;
        };
    }>;
}
