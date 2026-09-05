import readline from 'readline';
import qrcode from 'qrcode-terminal';
import { MockESP32 } from './mock_esp32.js';

const defaultDeviceConfig = {
  deviceId: 'BTN-8829-WTR',
  pairingCode: '882910',
  deviceSecret: 'sec_smart_button_8829_wtr_key_99',
  backendUrl: 'http://localhost:5000',
  firmwareVersion: '1.2.0',
};

const esp32 = new MockESP32(defaultDeviceConfig);

function printBanner() {
  console.clear();
  console.log(`\x1b[36m============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[32m  🔘 SMART ORDER BUTTON — ESP32 HARDWARE RUNTIME\x1b[0m`);
  console.log(`\x1b[36m============================================================\x1b[0m`);
  console.log(`📌 MÃ THIẾT BỊ (DEVICE ID):  \x1b[1m\x1b[33m${esp32.config.deviceId}\x1b[0m`);
  console.log(`🔑 MÃ SỐ KẾT NỐI (PIN 6 SỐ): \x1b[1m\x1b[32m${(esp32.config as any).pairingCode || '882910'}\x1b[0m  <-- Nhập mã này trên Web/App`);
  console.log(`🔋 Dung lượng Pin:           ${esp32.batteryLevel}% (${esp32.batteryVoltageMv}mV)`);
  console.log(`📶 Mạng Wi-Fi:               ${esp32.config.ssid ? `Đã kết nối: ${esp32.config.ssid}` : '\x1b[33mCHƯA CẤU HÌNH (SẴN SÀNG GHÉP NỐI)\x1b[0m'}`);
  console.log(`🌐 Trạng thái Cloud:         ${esp32.isCloudConnected ? '\x1b[32mĐÃ KẾT NỐI CLOUD (ONLINE)\x1b[0m' : '\x1b[31mCHƯA BOOTSTRAP\x1b[0m'}`);
  console.log(`💡 Đèn LED trạng thái:       ${esp32.getLedColor()}`);
  console.log(`\x1b[36m------------------------------------------------------------\x1b[0m`);
  console.log(`\x1b[1m📱 QUÉT MÃ QR DƯỚI ĐÂY BẰNG ĐIỆN THOẠI ĐỂ CẤU HÌNH:\x1b[0m`);
  
  const qrPayload = `SOBPAIR://setup?device=${esp32.config.deviceId}&token=${(esp32.config as any).pairingCode || '882910'}&v=1`;
  qrcode.generate(qrPayload, { small: true }, (qr) => {
    console.log(qr);
  });

  console.log(`\x1b[36m------------------------------------------------------------\x1b[0m`);
  console.log(`\x1b[1mLỆNH THAO TÁC THIẾT BỊ CỨNG:\x1b[0m`);
  console.log(` [1] Bấm 1 lần (Single Press) -> Kích hoạt thiết bị lên (Wakeup / Sẵn sàng)`);
  console.log(` [2] Bấm 2 lần (Double Press) -> Đặt hàng (hoặc Hủy đơn nếu vừa đặt trong 60s)`);
  console.log(` [3] Giữ nút 5s (Đổi Wi-Fi)   -> Bật SoftAP SMARTORDER_SETUP_0001 (hoặc [p])`);
  console.log(` [4] Nhập Tên Wi-Fi & Mật khẩu-> Tự động kết nối mạng mới (hoặc [w])`);
  console.log(` [5] Gửi Bootstrap Cloud      -> Báo danh tính lên Cloud Core (hoặc [b])`);
  console.log(` [6] Mô phỏng mất mạng        -> Offline test`);
  console.log(` [7] Khôi phục xuất xưởng     -> Reset Wi-Fi (hoặc [f])`);
  console.log(` [8] Xem Telemetry Pin/Sóng   -> Hiển thị điện áp, RSSI`);
  console.log(` [c] Làm mới màn hình         | [q] Thoát`);
  console.log(`\x1b[36m============================================================\x1b[0m`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

printBanner();
process.stdout.write('\x1b[1m\x1b[33mESP32-CLI>\x1b[0m ');

rl.on('line', async (line) => {
  const cmd = line.trim().toLowerCase();

  switch (cmd) {
    case '1':
      await esp32.handleSinglePress();
      break;
    case '2':
      await esp32.handleDoublePress();
      break;
    case '3':
    case 'p':
      await esp32.enterProvisioningMode();
      break;
    case '4':
    case 'w':
      await esp32.configureWiFi('Home_WiFi_2.4G', 'SecurePass2026!');
      break;
    case '5':
    case 'b':
      await esp32.bootstrapCloud();
      break;
    case '6':
      await esp32.simulateOffline();
      break;
    case '7':
    case 'f':
      await esp32.factoryReset();
      break;
    case '8':
      await esp32.showTelemetry();
      break;
    case '9':
      await esp32.showDeviceState();
      break;
    case '0':
      await esp32.handleLongPress(10);
      break;
    case 'c':
      printBanner();
      break;
    case 'q':
      console.log('Tạm biệt!');
      process.exit(0);
      break;
    default:
      console.log(`Lệnh không hợp lệ: "${cmd}". Gõ [c] để xem danh sách lệnh.`);
      break;
  }

  process.stdout.write('\x1b[1m\x1b[33mESP32-CLI>\x1b[0m ');
});
