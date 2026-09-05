import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeStore(client: Socket, storeId: string): void;
    handleSubscribeCustomer(client: Socket, customerId: string): void;
    emitToStore(storeId: string, event: string, payload: any): void;
    emitToCustomer(customerId: string, event: string, payload: any): void;
    emitGlobal(event: string, payload: any): void;
    emitDeviceEvent(storeId: string | null, customerId: string | null, event: string, payload: any): void;
}
