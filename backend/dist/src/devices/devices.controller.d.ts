import { DevicesService } from './devices.service';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    getFleetStats(req: any): Promise<{
        success: boolean;
        data: {
            total: number;
            online: number;
            offline: number;
            lowBattery: number;
            unconfigured: number;
        };
    }>;
    list(req: any, query: any): Promise<{
        success: boolean;
        data: any[];
    }>;
    register(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    bulkImport(body: {
        rows: any[];
        storeId?: string;
    }, req: any): Promise<{
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
    lookupCode(body: {
        code: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
    configureByCode(body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getById(id: string, req: any): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    pair(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    repair(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    assignProduct(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            device: any;
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
    unassignProduct(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    disable(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    enable(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getTelemetry(id: string, req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            deviceId: string;
            firmwareVersion: string;
            batteryLevel: number;
            wifiRSSI: number;
            voltageMv: number;
            bootReason: string;
            wakeDurationMs: number;
        }[];
    }>;
    getAuditLogs(id: string, req: any): Promise<{
        success: boolean;
        data: ({
            user: {
                id: string;
                phone: string | null;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                username: string | null;
                passwordHash: string;
                fullName: string;
                role: string;
                isActive: boolean;
                emailVerified: boolean;
                emailVerificationToken: string | null;
                emailVerificationExpires: Date | null;
                passwordResetTokenHash: string | null;
                passwordResetExpires: Date | null;
                failedLoginAttempts: number;
                lockedUntil: Date | null;
                lastLoginAt: Date | null;
                storeId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string | null;
            ipAddress: string | null;
            action: string;
            entity: string;
            entityId: string;
            oldValues: string | null;
            newValues: string | null;
        })[];
    }>;
    claim(req: any, body: {
        deviceId: string;
        claimCode: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    assign(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            message: string;
            data: {
                device: any;
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
        };
    }>;
    updateConfig(id: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            success: boolean;
            message: string;
            data: {
                device: any;
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
        };
    }>;
    toggleStatus(id: string, status: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
