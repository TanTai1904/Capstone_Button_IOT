import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../security/crypto.service';
export declare class HmacAuthGuard implements CanActivate {
    private readonly prisma;
    private readonly crypto;
    constructor(prisma: PrismaService, crypto: CryptoService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
