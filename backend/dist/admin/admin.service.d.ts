import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPendingStores(): Promise<({
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
    })[]>;
    approveStore(storeId: string, adminUser: any): Promise<{
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
    }>;
    rejectStore(storeId: string, reason: string, adminUser: any): Promise<{
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
}
