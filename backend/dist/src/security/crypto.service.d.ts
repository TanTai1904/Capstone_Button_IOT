export declare class CryptoService {
    calculateDeviceSignature(deviceSecret: string, deviceId: string, timestamp: string | number, nonce: string, bodyString: string): string;
    safeCompare(sig1: string, sig2: string): boolean;
    generateNonce(): string;
    generateOrderNumber(): string;
}
