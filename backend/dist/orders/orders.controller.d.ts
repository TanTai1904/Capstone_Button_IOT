import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(req: any, status?: string): Promise<{
        success: boolean;
        data: ({
            device: {
                configuration: {
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
            };
            customer: {
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
            items: ({
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
                productId: string;
                orderId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            })[];
        } & {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            customerId: string;
            deliveryAddress: string;
            orderNumber: string;
            totalAmount: number;
            customerPhone: string;
            customerName: string;
            cancelExpiresAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
        })[];
    }>;
    getById(id: string): Promise<{
        success: boolean;
        data: {
            device: {
                configuration: {
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
            };
            customer: {
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
            items: ({
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
                productId: string;
                orderId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            })[];
        } & {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            customerId: string;
            deliveryAddress: string;
            orderNumber: string;
            totalAmount: number;
            customerPhone: string;
            customerName: string;
            cancelExpiresAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
        };
    }>;
    quickReorder(req: any, deviceId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            order: {
                items: {
                    id: string;
                    productId: string;
                    orderId: string;
                    productName: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                }[];
            } & {
                id: string;
                deviceId: string | null;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                customerId: string;
                deliveryAddress: string;
                orderNumber: string;
                totalAmount: number;
                customerPhone: string;
                customerName: string;
                cancelExpiresAt: Date | null;
                cancelledAt: Date | null;
                cancellationReason: string | null;
            };
            isDuplicate: boolean;
            cancelWindowSeconds: number;
        };
    }>;
    updateStatus(id: string, status: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                productId: string;
                orderId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            customerId: string;
            deliveryAddress: string;
            orderNumber: string;
            totalAmount: number;
            customerPhone: string;
            customerName: string;
            cancelExpiresAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
        };
    }>;
    cancel(id: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            items: {
                id: string;
                productId: string;
                orderId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            }[];
        } & {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            customerId: string;
            deliveryAddress: string;
            orderNumber: string;
            totalAmount: number;
            customerPhone: string;
            customerName: string;
            cancelExpiresAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
        };
    }>;
}
