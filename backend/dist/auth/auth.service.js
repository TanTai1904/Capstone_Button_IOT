"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.resendCooldowns = new Map();
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async register(body) {
        const email = body.email?.trim().toLowerCase();
        const username = body.username?.trim().toLowerCase();
        const { password, fullName, phone, role = 'CUSTOMER', storeName, address } = body;
        if (!email || !password || !fullName || !username) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'MISSING_FIELDS',
                message: 'Vui lòng điền đầy đủ họ tên, tên đăng nhập, email và mật khẩu',
            });
        }
        const existingEmail = await this.prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            throw new common_1.ConflictException({
                success: false,
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'Email này đã được sử dụng.',
            });
        }
        const existingUsername = await this.prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            throw new common_1.ConflictException({
                success: false,
                code: 'USERNAME_ALREADY_EXISTS',
                message: 'Username này đã được sử dụng.',
            });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        if (role === 'STORE_OWNER') {
            if (!storeName || !address) {
                throw new common_1.BadRequestException({
                    success: false,
                    code: 'MISSING_STORE_INFO',
                    message: 'Vui lòng cung cấp tên cửa hàng và địa chỉ kinh doanh',
                });
            }
            const storeCode = `STORE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const newStore = await this.prisma.store.create({
                data: {
                    name: storeName,
                    code: storeCode,
                    ownerName: fullName,
                    phone: phone || '',
                    email,
                    address,
                    status: 'PENDING_APPROVAL',
                },
            });
            const user = await this.prisma.user.create({
                data: {
                    email,
                    username,
                    passwordHash,
                    fullName,
                    phone,
                    role: 'STORE_OWNER',
                    storeId: newStore.id,
                    isActive: false,
                    emailVerified: true,
                },
            });
            return {
                success: true,
                code: 'STORE_REGISTRATION_PENDING',
                message: 'Đăng ký thành công! Hồ sơ cửa hàng của bạn đang chờ Super Admin phê duyệt.',
                data: {
                    userId: user.id,
                    storeId: newStore.id,
                    status: 'PENDING_APPROVAL',
                },
            };
        }
        const targetStore = await this.prisma.store.findFirst({ where: { status: 'ACTIVE' } });
        const newUser = await this.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                fullName,
                phone,
                role: 'CUSTOMER',
                storeId: targetStore?.id,
                emailVerified: false,
                emailVerificationToken: rawVerificationToken,
                emailVerificationExpires: verificationExpires,
            },
        });
        const customerProfile = await this.prisma.customerProfile.create({
            data: {
                userId: newUser.id,
                storeId: targetStore?.id || '',
                deliveryAddress: address || 'Chưa thiết lập địa chỉ giao hàng',
                phone: phone || '',
            },
        });
        console.log(`📧 [Email Service Mock] Link xác minh email cho ${newUser.email}: http://localhost:5173/verify-email?token=${rawVerificationToken}`);
        return {
            success: true,
            message: 'Tạo tài khoản thành công! Chúng tôi đã gửi email xác minh đến địa chỉ email của bạn.',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    fullName: newUser.fullName,
                    role: newUser.role,
                    customerProfileId: customerProfile.id,
                    emailVerified: newUser.emailVerified,
                },
                verificationToken: rawVerificationToken,
            },
        };
    }
    async login(body, ip, userAgent) {
        const rawIdentifier = body.email?.trim().toLowerCase();
        const { password, rememberMe } = body;
        if (!rawIdentifier || !password) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu',
            });
        }
        if (!password.trim()) {
            throw new common_1.UnauthorizedException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Email hoặc mật khẩu không chính xác.',
            });
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: rawIdentifier }, { username: rawIdentifier }],
            },
            include: {
                store: true,
                customerProfile: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Email hoặc mật khẩu không chính xác.',
            });
        }
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            const remainingMinutes = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000));
            throw new common_1.ForbiddenException({
                success: false,
                code: 'ACCOUNT_LOCKED',
                message: `Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
            });
        }
        if (user.role === 'STORE_OWNER' && user.store?.status === 'PENDING_APPROVAL') {
            throw new common_1.ForbiddenException({
                success: false,
                code: 'ACCOUNT_PENDING_APPROVAL',
                message: 'Tài khoản cửa hàng đang chờ Super Admin xét duyệt. Vui lòng kiểm tra lại sau.',
            });
        }
        if (!user.isActive) {
            throw new common_1.ForbiddenException({
                success: false,
                code: 'ACCOUNT_DISABLED',
                message: 'Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ quản trị viên.',
            });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const lockoutTime = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: attempts,
                    lockedUntil: lockoutTime,
                },
            });
            if (attempts >= 5) {
                throw new common_1.ForbiddenException({
                    success: false,
                    code: 'ACCOUNT_LOCKED',
                    message: 'Bạn đã thử đăng nhập quá nhiều lần. Tài khoản bị tạm khóa 15 phút.',
                });
            }
            throw new common_1.UnauthorizedException({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Email hoặc mật khẩu không chính xác.',
            });
        }
        if (!user.emailVerified) {
            throw new common_1.ForbiddenException({
                success: false,
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Vui lòng xác minh email trước khi đăng nhập.',
            });
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
        const accessToken = this.jwtService.sign({
            userId: user.id,
            role: user.role,
            storeId: user.storeId,
            email: user.email,
            username: user.username,
        }, { expiresIn: '15m' });
        const rawRefreshToken = crypto.randomBytes(40).toString('hex');
        const refreshExpires = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.prisma.refreshSession.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: refreshExpires,
                ipAddress: ip || null,
                userAgent: userAgent || null,
            },
        });
        const userPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            storeId: user.storeId,
            store: user.store,
            customerProfileId: user.customerProfile?.id,
            emailVerified: user.emailVerified,
        };
        return {
            success: true,
            message: 'Đăng nhập thành công',
            accessToken,
            token: accessToken,
            refreshToken: rawRefreshToken,
            expiresIn: 900,
            data: {
                token: accessToken,
                accessToken,
                refreshToken: rawRefreshToken,
                expiresIn: 900,
                user: userPayload,
            },
            user: userPayload,
        };
    }
    async checkEmail(email) {
        const normalized = email?.trim().toLowerCase();
        if (!normalized)
            return { exists: false };
        const count = await this.prisma.user.count({
            where: { email: normalized },
        });
        return { exists: count > 0 };
    }
    async checkUsername(username) {
        const normalized = username?.trim().toLowerCase();
        if (!normalized)
            return { exists: false };
        const count = await this.prisma.user.count({
            where: { username: normalized },
        });
        return { exists: count > 0 };
    }
    async refresh(refreshToken, ip, userAgent) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Thiếu refresh token',
            });
        }
        const tokenHash = this.hashToken(refreshToken);
        const session = await this.prisma.refreshSession.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    include: {
                        store: true,
                        customerProfile: true,
                    },
                },
            },
        });
        if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
            throw new common_1.UnauthorizedException({
                success: false,
                code: 'TOKEN_EXPIRED',
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            });
        }
        if (!session.user.isActive) {
            throw new common_1.ForbiddenException({
                success: false,
                code: 'ACCOUNT_DISABLED',
                message: 'Tài khoản của bạn đã bị khóa hoặc tạm ngưng.',
            });
        }
        await this.prisma.refreshSession.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });
        const newRawRefreshToken = crypto.randomBytes(40).toString('hex');
        const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const newTokenHash = this.hashToken(newRawRefreshToken);
        await this.prisma.refreshSession.create({
            data: {
                userId: session.userId,
                tokenHash: newTokenHash,
                expiresAt: newExpires,
                ipAddress: ip || session.ipAddress,
                userAgent: userAgent || session.userAgent,
            },
        });
        const newAccessToken = this.jwtService.sign({
            userId: session.user.id,
            role: session.user.role,
            storeId: session.user.storeId,
            email: session.user.email,
            username: session.user.username,
        }, { expiresIn: '15m' });
        const userPayload = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.username,
            fullName: session.user.fullName,
            role: session.user.role,
            storeId: session.user.storeId,
            customerProfileId: session.user.customerProfile?.id,
        };
        return {
            success: true,
            message: 'Làm mới token thành công',
            accessToken: newAccessToken,
            token: newAccessToken,
            refreshToken: newRawRefreshToken,
            expiresIn: 900,
            user: userPayload,
            data: {
                accessToken: newAccessToken,
                token: newAccessToken,
                refreshToken: newRawRefreshToken,
                expiresIn: 900,
                user: userPayload,
            },
        };
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            const tokenHash = this.hashToken(refreshToken);
            await this.prisma.refreshSession.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        else if (userId) {
            await this.prisma.refreshSession.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        return {
            success: true,
            message: 'Đăng xuất thành công.',
        };
    }
    async forgotPassword(body) {
        const email = body.email?.trim().toLowerCase();
        if (!email) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_EMAIL',
                message: 'Vui lòng nhập địa chỉ email hợp lệ',
            });
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = this.hashToken(rawToken);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetTokenHash: tokenHash,
                    passwordResetExpires: expiresAt,
                },
            });
            console.log(`🔑 [Email Service Mock] Link đặt lại mật khẩu cho ${user.email}: http://localhost:5173/reset-password?token=${rawToken}`);
        }
        return {
            success: true,
            message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
        };
    }
    async resetPassword(body) {
        const { token, newPassword } = body;
        if (!token || !newPassword) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'MISSING_FIELDS',
                message: 'Thiếu mã xác nhận hoặc mật khẩu mới',
            });
        }
        const tokenHash = this.hashToken(token);
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetTokenHash: tokenHash,
                passwordResetExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
            });
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: newPasswordHash,
                passwordResetTokenHash: null,
                passwordResetExpires: null,
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
        await this.prisma.refreshSession.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return {
            success: true,
            message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.',
        };
    }
    async verifyEmail(body) {
        const { token } = body;
        if (!token) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Thiếu mã xác minh email',
            });
        }
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_TOKEN',
                message: 'Mã xác minh không hợp lệ hoặc đã hết hạn.',
            });
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
        return {
            success: true,
            message: 'Xác minh email thành công! Bạn có thể đăng nhập ngay bây giờ.',
        };
    }
    async resendVerification(body) {
        const email = body.email?.trim().toLowerCase();
        if (!email) {
            throw new common_1.BadRequestException({
                success: false,
                code: 'INVALID_EMAIL',
                message: 'Vui lòng nhập địa chỉ email hợp lệ',
            });
        }
        const now = Date.now();
        const lastSent = this.resendCooldowns.get(email);
        if (lastSent && now - lastSent < 60 * 1000) {
            const waitSecs = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);
            throw new common_1.HttpException({
                success: false,
                code: 'RATE_LIMITED',
                message: `Vui lòng đợi ${waitSecs} giây trước khi yêu cầu gửi lại email xác minh.`,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && !user.emailVerified) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerificationToken: rawToken,
                    emailVerificationExpires: expiresAt,
                },
            });
            this.resendCooldowns.set(email, now);
            console.log(`📧 [Email Service Mock] Link xác minh mới cho ${user.email}: http://localhost:5173/verify-email?token=${rawToken}`);
        }
        return {
            success: true,
            message: 'Nếu tài khoản chưa xác minh, chúng tôi đã gửi lại email xác nhận mới.',
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                store: true,
                customerProfile: {
                    include: {
                        devices: {
                            include: {
                                configuration: {
                                    include: { product: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            return { success: false, data: null };
        }
        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                storeId: user.storeId,
                store: user.store,
                customerProfileId: user.customerProfile?.id || null,
                customerProfile: user.customerProfile,
                createdAt: user.createdAt,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(jwt_1.JwtService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map