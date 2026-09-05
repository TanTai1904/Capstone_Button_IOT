import crypto from 'crypto';

export type DeviceState =
  | 'DEEP_SLEEP'
  | 'BOOT'
  | 'BLE_PROVISIONING'
  | 'CONNECTING_WIFI'
  | 'WIFI_CONNECTED'
  | 'CLOUD_BOOTSTRAP'
  | 'SENDING_EVENT'
  | 'SUCCESS'
  | 'ERROR';

export interface DeviceConfig {
  deviceId: string;
  deviceSecret: string;
  backendUrl: string;
  firmwareVersion: string;
  ssid?: string;
  wifiPassword?: string;
}

export class MockESP32 {
  public state: DeviceState = 'DEEP_SLEEP';
  public batteryLevel: number = 94; // %
  public batteryVoltageMv: number = 3850; // mV
  public wifiRSSI: number = -55; // dBm
  public simulateWiFiFail: boolean = false;
  public simulateCloudFail: boolean = false;
  public isProvisioned: boolean = true;
  public isCloudConnected: boolean = false;

  constructor(public config: DeviceConfig) {}

  public getLedColor(): string {
    switch (this.state) {
      case 'BLE_PROVISIONING':
        return '\x1b[35m[● PURPLE: BLE & SoftAP PROVISIONING MODE]\x1b[0m';
      case 'CONNECTING_WIFI':
        return '\x1b[34m[● BLUE: CONNECTING WI-FI]\x1b[0m';
      case 'WIFI_CONNECTED':
        return '\x1b[36m[● CYAN: WI-FI CONNECTED - ONLINE]\x1b[0m';
      case 'CLOUD_BOOTSTRAP':
        return '\x1b[35m[● PURPLE: CLOUD BOOTSTRAP HANDSHAKE]\x1b[0m';
      case 'SENDING_EVENT':
        return '\x1b[33m[● YELLOW: SENDING ORDER PACKET]\x1b[0m';
      case 'SUCCESS':
        return '\x1b[32m[● GREEN: SUCCESS - ORDER CONFIRMED]\x1b[0m';
      case 'ERROR':
        return '\x1b[31m[● RED: ERROR / FAILED]\x1b[0m';
      case 'DEEP_SLEEP':
      default:
        return '\x1b[90m[○ OFF: DEEP SLEEP (LOW POWER ~15uA)]\x1b[0m';
    }
  }

  private playBuzzer(pattern: string) {
    console.log(`\x1b[36m🔊 [BUZZER] ${pattern}\x1b[0m`);
  }

  private generateSignature(timestamp: string, nonce: string, bodyJson: string): string {
    const payload = `${this.config.deviceId}:${timestamp}:${nonce}:${bodyJson}`;
    return crypto.createHmac('sha256', this.config.deviceSecret).update(payload).digest('hex');
  }

  /**
   * Action 0: Enter BLE & SoftAP Provisioning Mode (Hold 5s)
   */
  public async enterProvisioningMode(): Promise<void> {
    console.log('\n======================================================');
    console.log(`🔘 [GESTURE] Giữ nút vật lý 5 giây -> Đèn LED nháy màu xanh dương!`);
    this.state = 'BLE_PROVISIONING';
    this.isProvisioned = false;
    this.isCloudConnected = false;
    console.log(`📡 Đèn LED: [🔵 NHÁY XANH DƯƠNG - SẴN SÀNG ĐỔI WI-FI]`);
    console.log(`📡 Dùng điện thoại kết nối vào Wi-Fi: "SMARTORDER_SETUP_0001"`);
    console.log(`📡 Trang cấu hình tự mở tại 192.168.4.1 (Chỉ cần ghi Tên & Mật khẩu Wi-Fi)`);
    console.log(`🛡️ Bảo toàn 100% quyền sở hữu và sản phẩm đã gán.`);
    this.playBuzzer('2 High Pitch Beeps (BLE Ready)');
  }

  /**
   * Action: Configure Wi-Fi Credentials locally from Mobile App
   */
  public async configureWiFi(ssid: string, password?: string): Promise<void> {
    console.log('\n======================================================');
    console.log(`📲 [LOCAL PROVISIONING] Nhận thông tin mạng từ Smartphone`);
    console.log(`   SSID: "${ssid}" (Mật khẩu được truyền bảo mật qua BLE/SoftAP)`);
    this.config.ssid = ssid;
    this.config.wifiPassword = password;
    this.isProvisioned = true;
    console.log(`💾 Đã lưu cấu hình vào NVS Flash phân vùng an toàn.`);

    // Connect to Home Wi-Fi
    this.state = 'CONNECTING_WIFI';
    console.log(`📶 Đang kết nối tới Access Point "${ssid}"...`);
    await new Promise((r) => setTimeout(r, 600));

    if (this.simulateWiFiFail) {
      console.log(`❌ [Wi-Fi ERROR] Sai mật khẩu hoặc không tìm thấy SSID`);
      this.state = 'ERROR';
      return;
    }

    this.state = 'WIFI_CONNECTED';
    console.log(`✅ Kết nối Wi-Fi thành công! IP cấp phát: 192.168.1.188`);

    // Perform Cloud Bootstrap
    await this.bootstrapCloud();
  }

  /**
   * Action: Cloud Bootstrap via HMAC-SHA256 Outbound Connection
   */
  public async bootstrapCloud(): Promise<any> {
    this.state = 'CLOUD_BOOTSTRAP';
    console.log(`🔒 [CLOUD BOOTSTRAP] Gửi gói tin xác thực danh tính ban đầu tới Cloud`);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = `boot_${crypto.randomBytes(6).toString('hex')}`;
    const body = {
      deviceId: this.config.deviceId,
      firmwareVersion: this.config.firmwareVersion,
      wifiRssi: this.wifiRSSI,
      batteryLevel: this.batteryLevel,
      uptime: 12,
    };
    const bodyJson = JSON.stringify(body);
    const signature = this.generateSignature(timestamp, nonce, bodyJson);

    try {
      const res = await fetch(`${this.config.backendUrl}/api/devices/bootstrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.config.deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyJson,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.isCloudConnected = true;
        this.state = 'SUCCESS';
        console.log(`🎉 [BOOTSTRAP THÀNH CÔNG] Cloud đã xác thực chữ ký HMAC và ghi nhận nút Online!`);
        this.playBuzzer('Ascending Chime (Online)');
        await new Promise((r) => setTimeout(r, 1000));
        this.state = 'DEEP_SLEEP';
        console.log(`💤 ${this.getLedColor()}`);
        return data;
      } else {
        throw new Error(data.message || 'Bootstrap thất bại');
      }
    } catch (e: any) {
      console.log(`❌ [BOOTSTRAP ERROR] ${e.message}`);
      this.state = 'ERROR';
      return null;
    }
  }

  /**
   * Action: Bấm 1 lần -> Kích hoạt thiết bị lên (WAKEUP / Activate)
   */
  public async handleSinglePress(): Promise<any> {
    console.log('\n======================================================');
    console.log(`🔘 [BẤM 1 LẦN] Kích hoạt thiết bị lên (Wakeup / Sẵn sàng)`);
    this.state = 'BOOT';
    this.playBuzzer('1 Short Beep (Wake)');

    this.state = 'CONNECTING_WIFI';
    console.log(`📶 Đang kết nối nhanh tới Wi-Fi...`);
    await new Promise((r) => setTimeout(r, 300));

    if (this.simulateWiFiFail) {
      console.log(`❌ [Wi-Fi ERROR] Mất kết nối Wi-Fi.`);
      this.state = 'ERROR';
      this.playBuzzer('3 Short Beeps (Network Fail)');
      return;
    }

    this.state = 'SENDING_EVENT';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = `press_${crypto.randomBytes(6).toString('hex')}`;
    const requestId = `req_wake_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const body = {
      eventType: 'WAKEUP',
      requestId,
      battery: this.batteryLevel,
      rssi: this.wifiRSSI,
    };
    const bodyJson = JSON.stringify(body);
    const signature = this.generateSignature(timestamp, nonce, bodyJson);

    try {
      const res = await fetch(`${this.config.backendUrl}/api/iot/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.config.deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyJson,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.state = 'SUCCESS';
        console.log(`✅ [CLOUD CONFIRM] Nút bấm đã được kích hoạt lên thành công và sẵn sàng!`);
        this.playBuzzer('1 Chime (Wakeup Success)');
        await new Promise((r) => setTimeout(r, 600));
        this.state = 'DEEP_SLEEP';
        console.log(`💤 Trở lại chế độ Deep Sleep (~15µA)`);
        return data;
      } else {
        throw new Error(data.message || 'Lỗi kích hoạt');
      }
    } catch (e: any) {
      console.log(`❌ [EVENT ERROR] ${e.message}`);
      this.state = 'ERROR';
      return null;
    }
  }

  /**
   * Action: Bấm 2 lần -> Đặt hàng (hoặc Hủy đơn nếu vừa đặt trong 60s)
   */
  public async handleDoublePress(): Promise<any> {
    console.log('\n======================================================');
    console.log(`🔘🔘 [BẤM 2 LẦN] Đặt hàng (hoặc Hủy đơn nếu vừa đặt trong 60s)`);
    this.state = 'SENDING_EVENT';

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = `dbl_${crypto.randomBytes(6).toString('hex')}`;
    const requestId = `req_dbl_${Date.now()}`;
    const body = {
      eventType: 'DOUBLE_PRESS',
      requestId,
      battery: this.batteryLevel,
      rssi: this.wifiRSSI,
    };
    const bodyJson = JSON.stringify(body);
    const signature = this.generateSignature(timestamp, nonce, bodyJson);

    try {
      const res = await fetch(`${this.config.backendUrl}/api/iot/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.config.deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyJson,
      });
      const data = await res.json();
      if (data.code === 'ORDER_CANCELLED_BY_BUTTON') {
        console.log(`📣 [KẾT QUẢ]: ${data.message} (Đã hủy đơn hàng vừa đặt)`);
        this.playBuzzer('Descending Chime (Cancelled)');
      } else if (data.code === 'ORDER_CREATED') {
        console.log(`🎉 [KẾT QUẢ]: ${data.message} (Cửa sổ hủy đơn 60 giây đã bắt đầu)`);
        this.playBuzzer('2 Chimes (Order Success)');
      } else {
        console.log(`📣 [KẾT QUẢ]: ${data.message}`);
      }
      this.state = 'DEEP_SLEEP';
      return data;
    } catch (e: any) {
      console.log(`❌ [EVENT ERROR]: ${e.message}`);
      this.state = 'ERROR';
      return null;
    }
  }

  /**
   * Action: Factory Reset (Keeps hardware identity & HMAC Secret)
   */
  public async factoryReset(): Promise<void> {
    console.log('\n======================================================');
    console.log(`⚠️ [FACTORY RESET] Giữ nút 15s: Xóa cấu hình Wi-Fi & Quyền sở hữu`);
    this.config.ssid = undefined;
    this.config.wifiPassword = undefined;
    this.isProvisioned = false;
    this.isCloudConnected = false;
    console.log(`🧹 Đã xóa thông tin Wi-Fi trong NVS Flash.`);
    console.log(`🔒 Giữ nguyên Device ID "${this.config.deviceId}" và Khóa HMAC bí mật.`);
    this.playBuzzer('Long Warning Beep');
    await this.enterProvisioningMode();
  }

  /**
   * Action 6: Simulate Offline (Network disconnect)
   */
  public async simulateOffline(): Promise<void> {
    console.log('\n======================================================');
    console.log(`🔌 [MẠNG] Mô phỏng mất kết nối Internet / Home Router...`);
    this.isCloudConnected = false;
    this.state = 'ERROR';
    console.log(`❌ Thiết bị chuyển sang trạng thái OFFLINE`);
    this.playBuzzer('3 Short Beeps (Disconnected)');
  }

  /**
   * Action 8: Show Telemetry
   */
  public async showTelemetry(): Promise<void> {
    console.log('\n======================================================');
    console.log(`📊 [TELEMETRY] THÔNG SỐ PHẦN CỨNG THỰC TẾ:`);
    console.log(`   Device ID:        ${this.config.deviceId}`);
    console.log(`   Firmware:         ${this.config.firmwareVersion}`);
    console.log(`   Pin LiPo:         ${this.batteryLevel}% (${this.batteryVoltageMv} mV)`);
    console.log(`   Sóng Wi-Fi:       ${this.wifiRSSI} dBm`);
    console.log(`   Trạng thái NVS:   ${this.config.ssid ? `Đã lưu SSID "${this.config.ssid}"` : 'Trống (Chưa có Wi-Fi)'}`);
    console.log(`   HMAC Status:      ACTIVE (Khóa bí mật được bảo vệ an toàn)`);
  }

  /**
   * Action 9: Show Device State
   */
  public async showDeviceState(): Promise<void> {
    console.log('\n======================================================');
    console.log(`🤖 [FIRMWARE STATE MACHINE]:`);
    console.log(`   Current State:    ${this.state}`);
    console.log(`   LED Halo:         ${this.getLedColor()}`);
    console.log(`   Is Provisioned:   ${this.isProvisioned ? 'YES' : 'NO'}`);
    console.log(`   Cloud Connected:  ${this.isCloudConnected ? 'ONLINE' : 'OFFLINE'}`);
  }

  /**
   * Action 0: Long Press (Hold Button)
   */
  public async handleLongPress(durationSeconds: number = 10): Promise<void> {
    console.log('\n======================================================');
    console.log(`⏱️ [GESTURE] Giữ nút vật lý trong ${durationSeconds} giây...`);
    if (durationSeconds >= 15) {
      console.log(`⚠️ Giữ >= 15s -> Kích hoạt FACTORY RESET!`);
      await this.factoryReset();
    } else {
      console.log(`📡 Giữ >= 10s -> Kích hoạt ZERO-TOUCH PROVISIONING!`);
      await this.enterProvisioningMode();
    }
  }
}
