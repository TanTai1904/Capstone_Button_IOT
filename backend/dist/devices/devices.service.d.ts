import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
export declare class DevicesService {
    private readonly prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    generateNextDeviceId(): Promise<string>;
    private sanitizeDevice;
    registerDevice(dto: any, user: any): Promise<any>;
    list(user: any, query?: any): Promise<any[]>;
    getById(id: string, user: any): Promise<any>;
    update(id: string, dto: any, user: any): Promise<any>;
    remove(id: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    assignProduct(id: string, body: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            device: any;
            product: {
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
        };
    }>;
    unassignProduct(id: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    pair(id: string, body: any, user: any): Promise<any>;
    lookupByCode(code: string): Promise<any>;
    configureByCode(body: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    repair(id: string, user: any): Promise<any>;
    disable(id: string, user: any): Promise<any>;
    enable(id: string, user: any): Promise<any>;
    private setStatus;
    getTelemetry(id: string, user: any): Promise<{
        id: string;
        deviceId: string;
        createdAt: Date;
        firmwareVersion: string;
        batteryLevel: number;
        wifiRSSI: number;
        voltageMv: number;
        bootReason: string;
        wakeDurationMs: number;
    }[]>;
    getAuditLogs(id: string, user: any): Promise<({
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string | null;
            isActive: boolean;
            phone: string | null;
            email: string;
            username: string | null;
            passwordHash: string;
            fullName: string;
            role: string;
            emailVerified: boolean;
            emailVerificationToken: string | null;
            emailVerificationExpires: Date | null;
            passwordResetTokenHash: string | null;
            passwordResetExpires: Date | null;
            failedLoginAttempts: number;
            lockedUntil: Date | null;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        ipAddress: string | null;
        userId: string | null;
        action: string;
        entity: string;
        entityId: string;
        oldValues: string | null;
        newValues: string | null;
    })[]>;
    bulkImport(body: {
        rows: any[];
        storeId?: string;
    }, user: any): Promise<{
        success: boolean;
        valid: boolean;
        errors: string[];
        totalRows: number;
        message?: undefined;
        count?: undefined;
        devices?: undefined;
    } | {
        success: boolean;
        valid: boolean;
        message: string;
        count: number;
        devices: any[];
        errors?: undefined;
        totalRows?: undefined;
    }>;
    getFleetStats(user: any): Promise<{
        total: number;
        online: number;
        offline: number;
        lowBattery: number;
        unconfigured: number;
    }>;
    claim(deviceId: string, claimCode: string, storeId: string, userId: string): Promise<any>;
    assign(id: string, body: any, storeId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            device: any;
            product: {
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
        };
    }>;
    toggleStatus(deviceId: string, status: string): Promise<any>;
    updateConfig(id: string, body: any, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            device: any;
            product: {
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
        };
    }>;
}
