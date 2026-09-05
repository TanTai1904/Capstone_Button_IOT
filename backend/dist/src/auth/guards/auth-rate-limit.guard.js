"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthRateLimitGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let AuthRateLimitGuard = AuthRateLimitGuard_1 = class AuthRateLimitGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.headers['x-forwarded-for']?.toString()?.split(',')[0]?.trim() ||
            request.ip ||
            request.connection?.remoteAddress ||
            '127.0.0.1';
        const path = request.route?.path || request.url;
        const now = Date.now();
        let windowMs = 60 * 1000;
        let maxRequests = 30;
        if (path.includes('login')) {
            maxRequests = 10;
            windowMs = 60 * 1000;
        }
        else if (path.includes('register')) {
            maxRequests = 10;
            windowMs = 60 * 1000;
        }
        else if (path.includes('forgot-password') || path.includes('reset-password')) {
            maxRequests = 6;
            windowMs = 15 * 60 * 1000;
        }
        else if (path.includes('check-email') || path.includes('check-username')) {
            maxRequests = 100;
            windowMs = 60 * 1000;
        }
        const key = `${ip}:${path}`;
        const record = AuthRateLimitGuard_1.limits.get(key);
        if (!record || now > record.resetTime) {
            AuthRateLimitGuard_1.limits.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return true;
        }
        if (record.count >= maxRequests) {
            throw new common_1.HttpException({
                success: false,
                code: 'RATE_LIMITED',
                message: 'Bạn đã thử thao tác quá nhiều lần. Vui lòng thử lại sau.',
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        record.count++;
        return true;
    }
};
exports.AuthRateLimitGuard = AuthRateLimitGuard;
AuthRateLimitGuard.limits = new Map();
exports.AuthRateLimitGuard = AuthRateLimitGuard = AuthRateLimitGuard_1 = __decorate([
    (0, common_1.Injectable)()
], AuthRateLimitGuard);
//# sourceMappingURL=auth-rate-limit.guard.js.map