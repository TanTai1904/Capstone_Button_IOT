import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../security/crypto.service';
import { EventsGateway } from '../websocket/events.gateway';
export declare class ProvisioningService {
    private readonly prisma;
    private readonly cryptoService;
    private readonly eventsGateway;
    private failedAttempts;
    constructor(prisma: PrismaService, cryptoService: CryptoService, eventsGateway: EventsGateway);
    private resolveDeviceFromInput;
    createSession(body: {
        qrPayload?: string;
        deviceId?: string;
        token?: string;
        code?: string;
    }): Promise<{
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
    claim(deviceId: string, body: any, user: any): Promise<{
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
    unclaim(deviceId: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    transfer(deviceId: string, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            qrPayload: string;
            token: string;
        };
    }>;
    factoryReset(deviceId: string, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            status: string;
        };
    }>;
    changeWifi(deviceId: string, user: any, body?: {
        ssid?: string;
        password?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            deviceId: string;
            provisioningStatus: string;
            status: string;
            ssid: string;
        };
    }>;
    private recordSecurityEvent;
    getSecurityIncidents(): {
        type: string;
        deviceId: string;
        ip?: string;
        reason: string;
        timestamp: Date;
    }[];
}
