import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private resendCooldowns;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private hashToken;
    register(body: RegisterDto): Promise<{
        success: boolean;
        code: string;
        message: string;
        data: {
            userId: string;
            storeId: string;
            status: string;
            user?: undefined;
            verificationToken?: undefined;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            user: {
                id: string;
                email: string;
                username: string;
                fullName: string;
                role: string;
                customerProfileId: string;
                emailVerified: boolean;
            };
            verificationToken: string;
            userId?: undefined;
            storeId?: undefined;
            status?: undefined;
        };
        code?: undefined;
    }>;
    login(body: LoginDto, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        token: string;
        refreshToken: string;
        expiresIn: number;
        data: {
            token: string;
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                username: string;
                fullName: string;
                role: string;
                storeId: string;
                store: {
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
                customerProfileId: string;
                emailVerified: true;
            };
        };
        user: {
            id: string;
            email: string;
            username: string;
            fullName: string;
            role: string;
            storeId: string;
            store: {
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
            customerProfileId: string;
            emailVerified: true;
        };
    }>;
    checkEmail(email: string): Promise<{
        exists: boolean;
    }>;
    checkUsername(username: string): Promise<{
        exists: boolean;
    }>;
    refresh(refreshToken: string, ip?: string, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        token: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            username: string;
            fullName: string;
            role: string;
            storeId: string;
            customerProfileId: string;
        };
        data: {
            accessToken: string;
            token: string;
            refreshToken: string;
            expiresIn: number;
            user: {
                id: string;
                email: string;
                username: string;
                fullName: string;
                role: string;
                storeId: string;
                customerProfileId: string;
            };
        };
    }>;
    logout(userId?: string, refreshToken?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyEmail(body: VerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerification(body: ResendVerificationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            username: string;
            fullName: string;
            phone: string;
            role: string;
            isActive: boolean;
            emailVerified: boolean;
            storeId: string;
            store: {
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
            customerProfileId: string;
            customerProfile: {
                devices: ({
                    configuration: {
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
                    } & {
                        id: string;
                        deviceId: string;
                        customName: string;
                        productId: string;
                        defaultQuantity: number;
                        allowCustomerQuantity: boolean;
                        allowCustomerProduct: boolean;
                        quickOrderDirect: boolean;
                        cancelWindowSeconds: number;
                        soundEnabled: boolean;
                        ledEnabled: boolean;
                        version: number;
                        updatedByUserId: string | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
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
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                userId: string;
                apartment: string | null;
                building: string | null;
                floor: string | null;
                room: string | null;
                deliveryAddress: string;
                phone: string;
            };
            createdAt: Date;
        };
    }>;
}
