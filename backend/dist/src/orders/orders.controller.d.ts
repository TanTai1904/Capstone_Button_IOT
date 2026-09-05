import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(req: any, status?: string): Promise<{
        success: boolean;
        data: ({
            customer: {
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
            device: {
                configuration: {
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
            };
            items: ({
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
                productId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            })[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            deliveryAddress: string;
            deviceId: string | null;
            customerId: string;
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
            customer: {
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
            device: {
                configuration: {
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
            };
            items: ({
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
                productId: string;
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            })[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            deliveryAddress: string;
            deviceId: string | null;
            customerId: string;
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
                    productName: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                    orderId: string;
                }[];
            } & {
                id: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                deliveryAddress: string;
                deviceId: string | null;
                customerId: string;
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
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            }[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            deliveryAddress: string;
            deviceId: string | null;
            customerId: string;
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
                productName: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
                orderId: string;
            }[];
        } & {
            id: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            deliveryAddress: string;
            deviceId: string | null;
            customerId: string;
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
