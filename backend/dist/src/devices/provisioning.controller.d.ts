import { ProvisioningService } from './provisioning.service';
export declare class ProvisioningController {
    private readonly provisioningService;
    constructor(provisioningService: ProvisioningService);
    createSession(body: any): Promise<{
        success: boolean;
        data: {
            sessionId: string;
            deviceId: any;
            serialNumber: any;
            macAddress: any;
            customName: any;
            storeName: any;
            product: {
                id: any;
                name: any;
                sku: any;
                price: any;
                unit: any;
            };
            expiresAt: Date;
        };
    }>;
    verifySession(sessionId: string): Promise<{
        success: boolean;
        valid: boolean;
        data: {
            sessionId: string;
            deviceId: string;
            status: string;
            provisioningStatus: string;
            product: {
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
        };
    }>;
    bootstrap(headers: any, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            status: string;
            cloudTimestamp: number;
        };
    }>;
    claim(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            product: {
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
            status: string;
        };
    }>;
    unclaim(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    transfer(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            qrPayload: string;
            token: string;
        };
    }>;
    factoryReset(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            status: string;
        };
    }>;
    changeWifi(id: string, body: {
        ssid?: string;
        password?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            provisioningStatus: string;
            status: string;
            ssid: string;
        };
    }>;
    getSecurityIncidents(): Promise<{
        success: boolean;
        data: {
            type: string;
            deviceId: string;
            ip?: string;
            reason: string;
            timestamp: Date;
        }[];
    }>;
}
