import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listPendingStores(): Promise<{
        success: boolean;
        data: ({
            users: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            phone: string;
            code: string;
            ownerName: string;
            email: string;
            address: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
        })[];
    }>;
    approveStore(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            phone: string;
            code: string;
            ownerName: string;
            email: string;
            address: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
        };
    }>;
    rejectStore(id: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            phone: string;
            code: string;
            ownerName: string;
            email: string;
            address: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
        };
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            totalStores: number;
            totalUsers: number;
            totalDevices: number;
            activeDevices: number;
            totalOrders: number;
            pendingStores: number;
            totalRevenue: number;
        };
    }>;
    listAuditLogs(): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
}
