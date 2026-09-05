export declare class RegisterDto {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    storeName?: string;
    role?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ResendVerificationDto {
    email: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
