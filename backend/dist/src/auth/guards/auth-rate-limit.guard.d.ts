import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AuthRateLimitGuard implements CanActivate {
    private static limits;
    canActivate(context: ExecutionContext): boolean;
}
