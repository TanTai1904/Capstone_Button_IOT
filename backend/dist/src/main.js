"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    }));
    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, x-device-id, x-timestamp, x-nonce, x-signature',
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`=======================================================`);
    console.log(`🚀 SMART ORDER BUTTON — NESTJS CLOUD & REALTIME CORE`);
    console.log(`📡 NestJS Server running on http://localhost:${port}/api`);
    console.log(`🔒 Security: HMAC-SHA256 Edge Gate & Multi-tenant RBAC`);
    console.log(`⚡ WebSocket: Socket.io Room Gateway Active`);
    console.log(`=======================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map