import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
export declare class IotService {
    private readonly prisma;
    private readonly ordersService;
    constructor(prisma: PrismaService, ordersService: OrdersService);
    handleEvent(device: any, body: any): Promise<{
        success: boolean;
        code: string;
        message: string;
        data: {
            deviceId: any;
            status: string;
            order?: undefined;
            isDuplicate?: undefined;
            cancelWindowSeconds?: undefined;
        };
    } | {
        success: boolean;
        code: string;
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
            deviceId?: undefined;
            status?: undefined;
        };
    } | {
        success: boolean;
        code: string;
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
            deviceId?: undefined;
            status?: undefined;
            isDuplicate?: undefined;
            cancelWindowSeconds?: undefined;
        };
    }>;
    handleTelemetry(device: any, body: any): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    getConfig(device: any): Promise<{
        success: boolean;
        data: {
            deviceId: any;
            customName: string;
            productName: string;
            cancelWindowSeconds: number;
            soundEnabled: boolean;
            ledEnabled: boolean;
            version: number;
        };
    }>;
}
