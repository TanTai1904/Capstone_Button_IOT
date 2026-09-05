import { PrismaService } from './prisma/prisma.service';
import { OrdersService } from './orders/orders.service';
import { EventsGateway } from './websocket/events.gateway';
export declare class AppController {
    private readonly prisma;
    private readonly ordersService;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, ordersService: OrdersService, eventsGateway: EventsGateway);
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
    };
    handleSimpleEvent(body: any): Promise<{
        success: boolean;
        message: string;
        code?: undefined;
        orderNumber?: undefined;
        blink?: undefined;
        isDuplicate?: undefined;
        totalAmount?: undefined;
    } | {
        success: boolean;
        code: string;
        message: string;
        orderNumber: string;
        blink: boolean;
        isDuplicate?: undefined;
        totalAmount?: undefined;
    } | {
        success: boolean;
        code: string;
        message: any;
        blink: boolean;
        orderNumber?: undefined;
        isDuplicate?: undefined;
        totalAmount?: undefined;
    } | {
        success: boolean;
        isDuplicate: boolean;
        message: string;
        orderNumber: string;
        blink: boolean;
        code?: undefined;
        totalAmount?: undefined;
    } | {
        success: boolean;
        isDuplicate: boolean;
        message: string;
        orderNumber: string;
        totalAmount: number;
        blink: boolean;
        code?: undefined;
    } | {
        success: boolean;
        message: any;
        blink: boolean;
        code?: undefined;
        orderNumber?: undefined;
        isDuplicate?: undefined;
        totalAmount?: undefined;
    }>;
    handleSimpleHeartbeat(body: any): Promise<{
        status: string;
        timestamp: number;
        message: string;
        blink: boolean;
    }>;
}
