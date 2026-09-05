import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPendingStores(): Promise<({
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
    })[]>;
    approveStore(storeId: string, adminUser: any): Promise<{
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
    }>;
    rejectStore(storeId: string, reason: string, adminUser: any): Promise<{
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
    }>;
    getSystemStats(): Promise<{
        totalStores: number;
        totalUsers: number;
        totalDevices: number;
        activeDevices: number;
        totalOrders: number;
        pendingStores: number;
        totalRevenue: number;
    }>;
    listAuditLogs(): Promise<({
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
    })[]>;
}
