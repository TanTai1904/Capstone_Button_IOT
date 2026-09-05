"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BASE_URL = 'http://localhost:5000';
function logTest(name, passed, detail) {
    if (passed) {
        console.log(`\x1b[32m  ✔ [PASS]\x1b[0m ${name}`);
    }
    else {
        console.log(`\x1b[31m  ✖ [FAIL]\x1b[0m ${name} - ${detail || ''}`);
    }
}
async function runAuthTests() {
    console.log('\n======================================================');
    console.log('🛡️ AUTHENTICATION SYSTEM — PRODUCTION VERIFICATION');
    console.log('======================================================\n');
    let passed = 0;
    let failed = 0;
    const testId = Date.now().toString().substring(6);
    const testEmail = `user_${testId}@smartorder.test`;
    const testUsername = `testuser_${testId}`;
    const testPassword = 'Password123!@#';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/check-email?email=${testEmail}`);
        const data = await res.json();
        if (res.status === 200 && data.exists === false) {
            logTest('Check Email: Available Email', true);
            passed++;
        }
        else {
            throw new Error(`Expected exists: false, got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Check Email: Available Email', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/check-username?username=${testUsername}`);
        const data = await res.json();
        if (res.status === 200 && data.exists === false) {
            logTest('Check Username: Available Username', true);
            passed++;
        }
        else {
            throw new Error(`Expected exists: false, got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Check Username: Available Username', false, e.message);
        failed++;
    }
    let verificationToken = '';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Nguyễn Văn Test',
                username: testUsername,
                email: testEmail,
                password: testPassword,
                phone: '0901234567',
                address: '123 Đường Test, Quận 1',
            }),
        });
        const data = await res.json();
        if (res.status === 201 && data.success && data.data?.verificationToken) {
            verificationToken = data.data.verificationToken;
            logTest('Register: Success with Valid Credentials', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Register: Success with Valid Credentials', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Người Trùng Email',
                username: `other_${testId}`,
                email: testEmail,
                password: testPassword,
            }),
        });
        const data = await res.json();
        if (res.status === 409 && (data.code === 'EMAIL_ALREADY_EXISTS' || data.message?.includes('Email này đã được sử dụng'))) {
            logTest('Register: Block Duplicate Email (409 Conflict)', true);
            passed++;
        }
        else {
            throw new Error(`Expected 409, got ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Register: Block Duplicate Email (409 Conflict)', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Người Trùng Username',
                username: testUsername,
                email: `unique_${testId}@smartorder.test`,
                password: testPassword,
            }),
        });
        const data = await res.json();
        if (res.status === 409 && (data.code === 'USERNAME_ALREADY_EXISTS' || data.message?.includes('Username này đã được sử dụng'))) {
            logTest('Register: Block Duplicate Username (409 Conflict)', true);
            passed++;
        }
        else {
            throw new Error(`Expected 409, got ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Register: Block Duplicate Username (409 Conflict)', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/check-email?email=${testEmail}`);
        const data = await res.json();
        if (res.status === 200 && data.exists === true) {
            logTest('Check Email: Correctly Detects Registered Email', true);
            passed++;
        }
        else {
            throw new Error(`Expected exists: true, got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Check Email: Correctly Detects Registered Email', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: verificationToken }),
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            logTest('Verify Email: Successfully Verified with Token', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Verify Email: Successfully Verified with Token', false, e.message);
        failed++;
    }
    let accessToken = '';
    let refreshToken = '';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        const data = await res.json();
        if (res.status === 200 && data.accessToken && data.refreshToken) {
            accessToken = data.accessToken;
            refreshToken = data.refreshToken;
            logTest('Login: Success with Email & Password', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Login: Success with Email & Password', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUsername,
                password: testPassword,
            }),
        });
        const data = await res.json();
        if (res.status === 200 && data.accessToken) {
            logTest('Login: Success with Username Identifier', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Login: Success with Username Identifier', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'WrongPassword999!',
            }),
        });
        const data = await res.json();
        if (res.status === 401 && data.message === 'Email hoặc mật khẩu không chính xác.') {
            logTest('Login Security: Generic Error on Wrong Password', true);
            passed++;
        }
        else {
            throw new Error(`Expected generic error, got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Login Security: Generic Error on Wrong Password', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'does_not_exist_998877@nowhere.com',
                password: 'Password123!',
            }),
        });
        const data = await res.json();
        if (res.status === 401 && data.message === 'Email hoặc mật khẩu không chính xác.') {
            logTest('Login Security: Generic Error on Unknown Email (Anti-Enumeration)', true);
            passed++;
        }
        else {
            throw new Error(`Expected generic error, got ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Login Security: Generic Error on Unknown Email (Anti-Enumeration)', false, e.message);
        failed++;
    }
    let newAccessToken = '';
    let newRefreshToken = '';
    try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        const data = await res.json();
        if (res.status === 200 && data.accessToken && data.refreshToken) {
            newAccessToken = data.accessToken;
            newRefreshToken = data.refreshToken;
            logTest('Session: Token Refresh Rotation (New Access & Refresh Issued)', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Session: Token Refresh Rotation (New Access & Refresh Issued)', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        const data = await res.json();
        if (res.status === 401) {
            logTest('Security: Reused Old Refresh Token Correctly Rejected', true);
            passed++;
        }
        else {
            throw new Error(`Expected 401 for revoked token, got ${res.status}`);
        }
    }
    catch (e) {
        logTest('Security: Reused Old Refresh Token Correctly Rejected', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${newAccessToken}` },
        });
        const data = await res.json();
        if (res.status === 200 && data.data?.email === testEmail) {
            logTest('Protected: GET /api/auth/me Validated Authenticated User', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Protected: GET /api/auth/me Validated Authenticated User', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail }),
        });
        const data = await res.json();
        if (res.status === 200 && data.message?.includes('Nếu email tồn tại trong hệ thống')) {
            logTest('Forgot Password: Anti-Enumeration Generic Response', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Forgot Password: Anti-Enumeration Generic Response', false, e.message);
        failed++;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify({ refreshToken: newRefreshToken }),
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
            logTest('Logout: Session Revoked Successfully', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Logout: Session Revoked Successfully', false, e.message);
        failed++;
    }
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
            logTest('Compatibility: Seeded Demo Accounts (customer@smartorder.local) Work Flawlessly', true);
            passed++;
        }
        else {
            throw new Error(`Status ${res.status}: ${JSON.stringify(data)}`);
        }
    }
    catch (e) {
        logTest('Compatibility: Seeded Demo Accounts (customer@smartorder.local) Work Flawlessly', false, e.message);
        failed++;
    }
    console.log('\n------------------------------------------------------');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
    if (failed > 0) {
        process.exit(1);
    }
}
runAuthTests();
//# sourceMappingURL=auth-production.test.js.map