import { DeviceTemplatesService } from './device-templates.service';
export declare class DeviceTemplatesController {
    private readonly templatesService;
    constructor(templatesService: DeviceTemplatesService);
    list(req: any): Promise<{
        success: boolean;
        data: ({
            _count: {
                devices: number;
            };
            defaultProduct: {
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
        } & {
            description: string | null;
            id: string;
            defaultQuantity: number;
            cancelWindowSeconds: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string | null;
            category: string | null;
            defaultProductId: string | null;
            singlePressAction: string;
            doublePressAction: string;
            longPressAction: string;
        })[];
    }>;
    create(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            defaultProduct: {
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
        } & {
            description: string | null;
            id: string;
            defaultQuantity: number;
            cancelWindowSeconds: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string | null;
            category: string | null;
            defaultProductId: string | null;
            singlePressAction: string;
            doublePressAction: string;
            longPressAction: string;
        };
    }>;
    getById(id: string, req: any): Promise<{
        success: boolean;
        data: {
            devices: {
                description: string | null;
                id: string;
                deviceId: string;
                customName: string | null;
                productId: string | null;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                status: string;
                serialNumber: string;
                macAddress: string | null;
                deviceSecret: string;
                claimCode: string;
                pairingCode: string | null;
                pairingToken: string | null;
                qrPayload: string;
                firmwareVersion: string;
                hardwareModel: string;
                claimStatus: string;
                provisioningStatus: string;
                ipAddress: string | null;
                uptime: number | null;
                templateId: string | null;
                location: string | null;
                customerId: string | null;
                batteryLevel: number;
                wifiRSSI: number;
                lastSeenAt: Date | null;
            }[];
            defaultProduct: {
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
        } & {
            description: string | null;
            id: string;
            defaultQuantity: number;
            cancelWindowSeconds: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string | null;
            category: string | null;
            defaultProductId: string | null;
            singlePressAction: string;
            doublePressAction: string;
            longPressAction: string;
        };
    }>;
    update(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            defaultProduct: {
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
        } & {
            description: string | null;
            id: string;
            defaultQuantity: number;
            cancelWindowSeconds: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            storeId: string | null;
            category: string | null;
            defaultProductId: string | null;
            singlePressAction: string;
            doublePressAction: string;
            longPressAction: string;
        };
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deploy(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        deployedCount: number;
        deviceIds: string[];
    }>;
}
