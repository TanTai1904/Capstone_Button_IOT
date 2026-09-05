import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    login(body: LoginDto, req: any): Promise<{
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
            customerProfileId: string;
            emailVerified: true;
        };
    }>;
    refresh(body: RefreshTokenDto, req: any): Promise<{
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
    logout(req: any, body: {
        refreshToken?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: any): Promise<{
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
            customerProfileId: string;
            customerProfile: {
                devices: ({
                    configuration: {
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
                    } & {
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
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
                    };
                } & {
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
                })[];
            } & {
                id: string;
                phone: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                apartment: string | null;
                building: string | null;
                floor: string | null;
                room: string | null;
                deliveryAddress: string;
                userId: string;
            };
            createdAt: Date;
        };
    }>;
    checkEmail(email: string): Promise<{
        exists: boolean;
    }>;
    checkUsername(username: string): Promise<{
        exists: boolean;
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
}
