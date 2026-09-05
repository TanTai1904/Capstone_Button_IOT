import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    listPendingStores(): Promise<{
        success: boolean;
        data: ({
            users: {
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
            }[];
        } & {
            id: string;
            name: string;
            code: string;
            ownerName: string;
            phone: string;
            email: string;
            address: string;
            status: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    approveStore(id: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            code: string;
            ownerName: string;
            phone: string;
            email: string;
            address: string;
            status: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    rejectStore(id: string, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            code: string;
            ownerName: string;
            phone: string;
            email: string;
            address: string;
            status: string;
            rejectionReason: string | null;
            approvedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
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
}
