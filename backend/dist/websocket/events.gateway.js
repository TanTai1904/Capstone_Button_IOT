"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let EventsGateway = class EventsGateway {
    handleConnection(client) {
        console.log(`⚡ [NestJS Socket.io] Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`❌ [NestJS Socket.io] Client disconnected: ${client.id}`);
    }
    handleSubscribeStore(client, storeId) {
        if (storeId) {
            client.join(`store_${storeId}`);
            console.log(`🔌 Socket ${client.id} joined store_${storeId}`);
        }
    }
    handleSubscribeCustomer(client, customerId) {
        if (customerId) {
            client.join(`customer_${customerId}`);
            console.log(`🔌 Socket ${client.id} joined customer_${customerId}`);
        }
    }
    emitToStore(storeId, event, payload) {
        if (this.server) {
            this.server.to(`store_${storeId}`).emit(event, payload);
            console.log(`📢 [WS -> Store ${storeId}] ${event}`);
        }
    }
    emitToCustomer(customerId, event, payload) {
        if (this.server) {
            this.server.to(`customer_${customerId}`).emit(event, payload);
            console.log(`📢 [WS -> Customer ${customerId}] ${event}`);
        }
    }
    emitGlobal(event, payload) {
        if (this.server) {
            this.server.emit(event, payload);
        }
    }
    emitDeviceEvent(storeId, customerId, event, payload) {
        if (storeId) {
            this.emitToStore(storeId, event, payload);
        }
        if (customerId) {
            this.emitToCustomer(customerId, event, payload);
        }
        this.emitGlobal(event, payload);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:store'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleSubscribeStore", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:customer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleSubscribeCustomer", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map