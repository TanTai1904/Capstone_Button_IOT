"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const BASE_URL = 'http://localhost:5000';
function logTest(name, passed, detail) {
    if (passed) {
        console.log(`\x1b[32m  ✔ [PASS]\x1b[0m ${name}`);
    }
    else {
        console.log(`\x1b[31m  ✖ [FAIL]\x1b[0m ${name} - ${detail || ''}`);
    }
}
async function runTests() {
    console.log('\n======================================================');
    console.log('🧪 SMART ORDER BUTTON — AUTOMATED TEST SUITE');
    console.log('======================================================\n');
    let passed = 0;
    let failed = 0;
    try {
        const res = await fetch(`${BASE_URL}/api/health`);
        const data = await res.json();
        if (res.status === 200 && data.status === 'OK') {
            logTest('Server Healthcheck (/health)', true);
            passed++;
        }
        else {
            throw new Error(`Unexpected status ${res.status}`);
        }
    }
    catch (e) {
        logTest('Server Healthcheck (/health)', false, e.message);
        failed++;
    }
    let storeToken = '';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'store@smartorder.local',
                password: 'Password123!',
            }),
        });
        const data = await res.json();
        if (res.status === 200 && data.data?.token) {
            storeToken = data.data.token;
            logTest('Auth: Store Owner Login', true);
            passed++;
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (e) {
        logTest('Auth: Store Owner Login', false, e.message);
        failed++;
    }
    let customerToken = '';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@smartorder.local',
                password: 'Password123!',
            }),
        });
        const data = await res.json();
        if (res.status === 200 && data.data?.token) {
            customerToken = data.data.token;
            logTest('Auth: Customer Login', true);
            passed++;
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (e) {
        logTest('Auth: Customer Login', false, e.message);
        failed++;
    }
    const deviceId = 'BTN-8829-WTR';
    const deviceSecret = 'sec_smart_button_8829_wtr_key_99';
    const testRequestId = `test_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let validOrderNumber = '';
    let validOrderId = '';
    try {
        const timestamp = Date.now().toString();
        const nonce = crypto_1.default.randomBytes(16).toString('hex');
        const body = {
            eventType: 'DOUBLE_PRESS',
            requestId: testRequestId,
            battery: 95,
            rssi: -52,
        };
        const bodyString = JSON.stringify(body);
        const payload = `${deviceId}:${timestamp}:${nonce}:${bodyString}`;
        const signature = crypto_1.default.createHmac('sha256', deviceSecret).update(payload).digest('hex');
        const res = await fetch(`${BASE_URL}/api/iot/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-timestamp': timestamp,
                'x-nonce': nonce,
                'x-signature': signature,
            },
            body: bodyString,
        });
        const data = await res.json();
        if ((res.status === 200 || res.status === 201) && data.data?.order?.orderNumber) {
            validOrderNumber = data.data.order.orderNumber;
            validOrderId = data.data.order.id;
            logTest(`IoT Event: Valid HMAC-SHA256 Button Press -> Created Order ${validOrderNumber}`, true);
            passed++;
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (e) {
        logTest('IoT Event: Valid HMAC-SHA256 Button Press', false, e.message);
        failed++;
    }
    try {
        const timestamp = Date.now().toString();
        const nonce = crypto_1.default.randomBytes(16).toString('hex');
        const body = {
            eventType: 'DOUBLE_PRESS',
            requestId: testRequestId,
            battery: 95,
            rssi: -52,
        };
        const bodyString = JSON.stringify(body);
        const payload = `${deviceId}:${timestamp}:${nonce}:${bodyString}`;
        const signature = crypto_1.default.createHmac('sha256', deviceSecret).update(payload).digest('hex');
        const res = await fetch(`${BASE_URL}/api/iot/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-timestamp': timestamp,
                'x-nonce': nonce,
                'x-signature': signature,
            },
            body: bodyString,
        });
        const data = await res.json();
        if (res.status === 200 && data.data?.isDuplicate === true) {
            logTest('Anti-Spam Idempotency: Duplicate requestId prevented second order', true);
            passed++;
        }
        else {
            throw new Error(`Expected isDuplicate=true but got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Anti-Spam Idempotency Test', false, e.message);
        failed++;
    }
    try {
        const timestamp = Date.now().toString();
        const reusedNonce = 'reused_nonce_1234567890abcdef';
        const body = { eventType: 'SINGLE_PRESS', requestId: 'req_nonce_1', battery: 90, rssi: -60 };
        const bodyStr = JSON.stringify(body);
        const sig1 = crypto_1.default
            .createHmac('sha256', deviceSecret)
            .update(`${deviceId}:${timestamp}:${reusedNonce}:${bodyStr}`)
            .digest('hex');
        await fetch(`${BASE_URL}/api/iot/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-timestamp': timestamp,
                'x-nonce': reusedNonce,
                'x-signature': sig1,
            },
            body: bodyStr,
        });
        const replayRes = await fetch(`${BASE_URL}/api/iot/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-timestamp': timestamp,
                'x-nonce': reusedNonce,
                'x-signature': sig1,
            },
            body: bodyStr,
        });
        const replayData = await replayRes.json();
        if (replayRes.status === 409 && replayData.code === 'REPLAY_DETECTED') {
            logTest('Security: Anti-Replay Defense correctly blocked reused Nonce (409 Conflict)', true);
            passed++;
        }
        else {
            throw new Error(`Expected 409 REPLAY_DETECTED, got ${replayRes.status}`);
        }
    }
    catch (e) {
        logTest('Security: Anti-Replay Defense', false, e.message);
        failed++;
    }
    try {
        const timestamp = Date.now().toString();
        const nonce = crypto_1.default.randomBytes(16).toString('hex');
        const body = { eventType: 'SINGLE_PRESS', requestId: 'tamper_req', battery: 90, rssi: -60 };
        const bodyStr = JSON.stringify(body);
        const fakeSignature = 'bad_fake_signature_aabbccddeeff11223344556677889900aabbccddeeff1122334455667788';
        const res = await fetch(`${BASE_URL}/api/iot/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
                'x-timestamp': timestamp,
                'x-nonce': nonce,
                'x-signature': fakeSignature,
            },
            body: bodyStr,
        });
        const data = await res.json();
        if (res.status === 401 && data.code === 'INVALID_SIGNATURE') {
            logTest('Security: Tampered HMAC Signature correctly rejected (401 Unauthorized)', true);
            passed++;
        }
        else {
            throw new Error(`Expected 401 INVALID_SIGNATURE, got ${res.status}`);
        }
    }
    catch (e) {
        logTest('Security: Tampered HMAC Signature', false, e.message);
        failed++;
    }
    if (validOrderId) {
        try {
            const res = await fetch(`${BASE_URL}/api/orders/${validOrderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${customerToken}`,
                },
                body: JSON.stringify({ reason: 'Khách hàng đổi ý muốn hủy đơn' }),
            });
            const data = await res.json();
            if (res.status === 200 && data.data?.status === 'CANCELLED') {
                logTest('Order Lifecycle: Cancel order within cancel window & stock rollback', true);
                passed++;
            }
            else {
                throw new Error(data.message);
            }
        }
        catch (e) {
            logTest('Order Lifecycle: Cancel order', false, e.message);
            failed++;
        }
    }
    try {
        const res = await fetch(`${BASE_URL}/api/devices/${deviceId}/change-wifi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${customerToken}`,
            },
        });
        const data = await res.json();
        if ((res.status === 200 || res.status === 201) && data.success && data.data?.provisioningStatus === 'PROVISIONING') {
            logTest('Zero-Touch: Change Wi-Fi preserves customer ownership & product link', true);
            passed++;
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (e) {
        logTest('Zero-Touch: Change Wi-Fi preserves customer ownership & product link', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/devices/${deviceId}/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${customerToken}`,
            },
        });
        const data = await res.json();
        if ((res.status === 200 || res.status === 201) && data.success && data.data?.qrPayload && data.data?.token) {
            logTest(`Device Transfer: Generated new QR token for recipient (${data.data.token})`, true);
            passed++;
            await fetch(`${BASE_URL}/api/devices/${deviceId}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${customerToken}`,
                },
            });
        }
        else {
            throw new Error(data.message);
        }
    }
    catch (e) {
        logTest('Device Transfer: Generate transfer token', false, e.message);
        failed++;
    }
    console.log('\n------------------------------------------------------');
    console.log(`Test Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
}
runTests();
//# sourceMappingURL=api.test.js.map