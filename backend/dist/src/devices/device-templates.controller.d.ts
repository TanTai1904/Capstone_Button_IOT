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
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string | null;
            description: string | null;
            category: string | null;
            defaultQuantity: number;
            cancelWindowSeconds: number;
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
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string | null;
            description: string | null;
            category: string | null;
            defaultQuantity: number;
            cancelWindowSeconds: number;
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
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string | null;
                description: string | null;
                deviceId: string;
                serialNumber: string;
                macAddress: string | null;
                customName: string | null;
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
                location: string | null;
                batteryLevel: number;
                wifiRSSI: number;
                lastSeenAt: Date | null;
                productId: string | null;
                templateId: string | null;
                customerId: string | null;
            }[];
            defaultProduct: {
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
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string | null;
            description: string | null;
            category: string | null;
            defaultQuantity: number;
            cancelWindowSeconds: number;
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
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string | null;
            description: string | null;
            category: string | null;
            defaultQuantity: number;
            cancelWindowSeconds: number;
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
