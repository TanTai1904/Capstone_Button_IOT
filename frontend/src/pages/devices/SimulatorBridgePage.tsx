import React, { useState } from 'react';
import { Radio, Wifi, Battery, AlertCircle, CheckCircle2, Shield, RefreshCw, Cpu, Volume2, Settings, Terminal, Send, Trash2, Zap, ArrowDownCircle, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_URL } from '../../services/api';
import { Interactive3DButton } from '../../components/3d/Interactive3DButton';
import { Floating3DCard } from '../../components/3d/Floating3DCard';

export const SimulatorBridgePage: React.FC = () => {
  const [deviceId, setDeviceId] = useState('BTN-8829-WTR');
  const [deviceSecret, setDeviceSecret] = useState('sec_smart_button_8829_wtr_key_99');
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [simulateWifiFail, setSimulateWifiFail] = useState(false);

  // Hardware State
  const [hardwareState, setHardwareState] = useState<'DEEP_SLEEP' | 'CONNECTING_WIFI' | 'SENDING' | 'SUCCESS' | 'ERROR' | 'PROVISIONING'>('DEEP_SLEEP');
  const [logMessages, setLogMessages] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🚀 ESP32 Booted. Firmware v2.1.0-Release ready.`,
    `[${new Date().toLocaleTimeString()}] 💤 Hardware entered Deep Sleep (<15µA). Awaiting RTC GPIO interrupt...`,
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPacket, setLastPacket] = useState<any>(null);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 39)]);
  };

  // Web Audio Synthetic Click
  const playClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  };

  // Web Crypto HMAC-SHA256
  const computeHmac = async (secret: string, message: string) => {
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
    return Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSinglePress = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    addLog('🔘 [BẤM 1 LẦN] Kích hoạt thiết bị lên (Wakeup / Sẵn sàng)');
    setHardwareState('CONNECTING_WIFI');
    addLog('📶 ESP32 Thức dậy: Đang kết nối nhanh tới Wi-Fi...');

    await new Promise((r) => setTimeout(r, 450));

    if (simulateWifiFail) {
      addLog('❌ [Wi-Fi ERROR] Quá thời gian chờ (5000ms). LED Đỏ báo lỗi kết nối.');
      setHardwareState('ERROR');
      await new Promise((r) => setTimeout(r, 1500));
      setHardwareState('DEEP_SLEEP');
      addLog('💤 Quay lại trạng thái Deep Sleep (<15µA)');
      setIsProcessing(false);
      return;
    }

    addLog('✅ Wi-Fi kết nối thành công (RSSI: -52 dBm, IP: 192.168.1.145)');
    setHardwareState('SENDING');

    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const requestId = `sim_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const bodyObj = {
      eventType: 'WAKEUP',
      requestId,
      battery: batteryLevel,
      rssi: -52,
    };
    const bodyStr = JSON.stringify(bodyObj);

    addLog(`🔐 Đang tạo băm chữ ký HMAC-SHA256 cho Device ID: ${deviceId}`);
    const signature = await computeHmac(deviceSecret, `${deviceId}:${timestamp}:${nonce}:${bodyStr}`);

    setLastPacket({
      headers: {
        'x-device-id': deviceId,
        'x-timestamp': timestamp,
        'x-nonce': nonce,
        'x-signature': signature,
      },
      payload: bodyObj,
    });

    try {
      const res = await fetch(`${API_URL}/api/iot/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyStr,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHardwareState('SUCCESS');
        addLog('✅ [CLOUD CONFIRM] Nút bấm đã được kích hoạt lên thành công và sẵn sàng!');
      } else {
        setHardwareState('ERROR');
        addLog(`⚠️ [CLOUD REJECT] ${data.code || 'ERR'}: ${data.message || 'Lỗi xử lý Cloud'}`);
      }
    } catch (e: any) {
      setHardwareState('ERROR');
      addLog(`❌ Lỗi kết nối HTTP: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 1500));
    setHardwareState('DEEP_SLEEP');
    addLog('💤 Đã hoàn tất chu trình. ESP32 ngắt nguồn ngoại vi, quay về Deep Sleep (<15µA)');
    setIsProcessing(false);
  };

  const handleDoublePress = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    addLog('🔘🔘 [BẤM 2 LẦN] Đặt hàng (hoặc Hủy đơn nếu vừa đặt trong 60s)');
    setHardwareState('CONNECTING_WIFI');
    addLog('📶 ESP32 Thức dậy: Đang bắt tay mạng Wi-Fi và gửi chữ ký HMAC...');

    await new Promise((r) => setTimeout(r, 400));
    setHardwareState('SENDING');

    const timestamp = Date.now().toString();
    const nonce = Math.random().toString(36).substring(2);
    const requestId = `sim_req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const bodyObj = {
      eventType: 'DOUBLE_PRESS',
      requestId,
      reason: 'Bấm đúp 2 lần trên thiết bị vật lý',
      battery: batteryLevel,
      rssi: -52,
    };
    const bodyStr = JSON.stringify(bodyObj);

    const signature = await computeHmac(deviceSecret, `${deviceId}:${timestamp}:${nonce}:${bodyStr}`);

    setLastPacket({
      headers: {
        'x-device-id': deviceId,
        'x-timestamp': timestamp,
        'x-nonce': nonce,
        'x-signature': signature,
      },
      payload: bodyObj,
    });

    try {
      const res = await fetch(`${API_URL}/api/iot/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyStr,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHardwareState('SUCCESS');
        if (data.code === 'ORDER_CANCELLED') {
          addLog(`📣 [HỦY ĐƠN THÀNH CÔNG] Đã hủy đơn hàng #${data.data?.orderNumber || ''} qua 2 lần bấm nút vật lý!`);
        } else {
          addLog(`🎉 [KẾT QUẢ]: Đơn hàng mới đã được tạo thành công bằng 2 lần bấm! (Cửa sổ hủy đơn 60 giây đã bắt đầu)`);
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        }
      } else {
        setHardwareState('ERROR');
        addLog(`⚠️ [THẤT BẠI] ${data.message || 'Lỗi xử lý yêu cầu'}`);
      }
    } catch (e: any) {
      setHardwareState('ERROR');
      addLog(`❌ Lỗi kết nối HTTP: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 1800));
    setHardwareState('DEEP_SLEEP');
    setIsProcessing(false);
  };

  const handleStartProvisioning = () => {
    playClick();
    setHardwareState('PROVISIONING');
    addLog('🔘 [GESTURE] Cấu hình đổi Wi-Fi trực tiếp trên Web/App bằng Mã số PIN!');
    addLog('📡 Điều chỉnh Wi-Fi tức thì trên Web/App — Không cần mở 192.168.4.1');
    addLog('🛡️ Đèn LED chuyển sang xanh lá, bảo toàn 100% quyền sở hữu & sản phẩm.');
  };

  const handleConnectWifi = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    addLog('📲 [LỆNH 4] Nhận thông tin Wi-Fi cục bộ qua BLE: SSID "Home_WiFi_2.4G"');
    addLog('💾 Đã lưu cấu hình an toàn vào NVS Flash phân vùng bảo mật');
    setHardwareState('CONNECTING_WIFI');
    await new Promise((r) => setTimeout(r, 500));
    setHardwareState('SUCCESS');
    addLog('✅ ESP32 đã kết nối vào Home Router 2.4 GHz! IP: 192.168.1.188');
    setIsProcessing(false);
  };

  const handleBootstrapCloud = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    playClick();
    addLog(`🔒 [LỆNH 5] Gửi gói tin Outbound HMAC-SHA256 Cloud Bootstrap...`);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = `sim_boot_${Date.now()}`;
    const bodyObj = {
      deviceId,
      wifiRssi: -50,
      batteryLevel,
      ipAddress: '192.168.1.188',
      uptime: 45,
    };
    const bodyStr = JSON.stringify(bodyObj);
    const signature = await computeHmac(deviceSecret, `${deviceId}:${timestamp}:${nonce}:${bodyStr}`);

    try {
      const res = await fetch(`${API_URL}/api/devices/bootstrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
          'x-timestamp': timestamp,
          'x-nonce': nonce,
          'x-signature': signature,
        },
        body: bodyStr,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHardwareState('SUCCESS');
        addLog(`🎉 [CLOUD BOOTSTRAP THÀNH CÔNG] Thiết bị đã Online trong Cloud!`);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } else {
        setHardwareState('ERROR');
        addLog(`⚠️ [BOOTSTRAP REJECT] ${data.message}`);
      }
    } catch (e: any) {
      setHardwareState('ERROR');
      addLog(`❌ Lỗi bootstrap: ${e.message}`);
    }
    setIsProcessing(false);
  };

  const handleSimulateOffline = () => {
    playClick();
    setSimulateWifiFail((prev) => {
      const next = !prev;
      addLog(`🔌 [LỆNH 6] Mô phỏng mất mạng Wi-Fi: ${next ? 'ĐANG MẤT KẾT NỐI (OFFLINE)' : 'ĐÃ KHÔI PHỤC KẾT NỐI'}`);
      if (next) setHardwareState('ERROR');
      return next;
    });
  };

  const handleFactoryReset = async () => {
    playClick();
    addLog('⚠️ [LỆNH 7] FACTORY RESET: Giữ nút 15 giây');
    addLog('🧹 Đã xóa toàn bộ cấu hình Wi-Fi trong NVS Flash.');
    addLog(`🔒 Giữ nguyên Device ID: "${deviceId}" và Khóa bí mật HMAC.`);
    setHardwareState('PROVISIONING');
    addLog('📡 Tự động quay lại chế độ Provisioning Mode.');
  };

  const handleShowTelemetry = () => {
    playClick();
    addLog(`📊 [LỆNH 8] TELEMETRY: ID=${deviceId} | Pin=${batteryLevel}% (${batteryVoltage}V) | RSSI=-52dBm | Up=182s`);
  };

  const handleShowState = () => {
    playClick();
    addLog(`🤖 [LỆNH 9] DEVICE STATE: Current=${hardwareState} | SimulateWifiFail=${simulateWifiFail}`);
  };

  const handleLongPress = async (seconds: number = 10) => {
    playClick();
    addLog(`⏱️ [LỆNH 0] Giữ nút vật lý trong ${seconds}s...`);
    if (seconds >= 15) {
      await handleFactoryReset();
    } else {
      handleStartProvisioning();
    }
  };

  // Approximate battery voltage
  const batteryVoltage = (3.3 + (batteryLevel / 100) * 0.9).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ESP32 Hardware Simulator Bridge</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ACTIVE LAB
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mô phỏng chu trình vi điều khiển: ngắt phần cứng, RTC Wakeup, mã hóa HMAC-SHA256 và truyền gói tin IoT
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Hardware Deck & Serial Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Physical Button Cockpit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            
            {/* OLED Mini Display Screen */}
            <Floating3DCard depth={18} className="rounded-2xl mb-6">
              <div className="p-3.5 bg-black/95 rounded-2xl border border-cyan-500/40 text-cyan-400 font-mono text-xs shadow-2xl space-y-1">
                <div className="flex items-center justify-between border-b border-cyan-900/50 pb-1.5 text-[10px]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    ESP32-S3 OLED
                  </span>
                  <span className="text-emerald-400 font-bold">{batteryVoltage}V • {batteryLevel}%</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-white font-bold">{deviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">STATE:</span>
                  <span className={hardwareState === 'DEEP_SLEEP' ? 'text-slate-400' : hardwareState === 'SUCCESS' ? 'text-emerald-400 font-bold' : hardwareState === 'ERROR' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold animate-pulse'}>
                    {hardwareState}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">WIFI:</span>
                  <span className="text-cyan-300">{simulateWifiFail ? 'FAULT DISCONNECTED' : 'RSSI -52dBm (Good)'}</span>
                </div>
              </div>
            </Floating3DCard>

            {/* 3D Hardware Button Centerpiece with Tactile Physics */}
            <div className="relative flex justify-center items-center py-4">
              <Interactive3DButton
                size="md"
                overrideLedState={
                  hardwareState === 'CONNECTING_WIFI' || hardwareState === 'PROVISIONING'
                    ? 'blue'
                    : hardwareState === 'SENDING'
                    ? 'yellow'
                    : hardwareState === 'SUCCESS'
                    ? 'green'
                    : hardwareState === 'ERROR'
                    ? 'red'
                    : 'off'
                }
                overrideStatusText={`Phần Cứng: ${hardwareState}`}
                onPress={handleSinglePress}
                label={isProcessing ? 'ĐANG KẾT NỐI' : 'BẤM 1 LẦN'}
                subLabel="Kích Hoạt (Wakeup)"
                showTelemetry={false}
              />
            </div>

            {/* Quick Action Buttons for Double Press & Hold 5s */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleDoublePress}
                disabled={isProcessing}
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>[2] Bấm 2 Lần (Đặt/Hủy)</span>
              </button>
              <button
                onClick={handleStartProvisioning}
                disabled={isProcessing}
                className="py-2.5 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Wifi className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>[3] Giữ 5s (Đổi Wi-Fi)</span>
              </button>
            </div>

            {/* Complete 10-Command Suite (Section 52 Specification) */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Lệnh Thao Tác Nút Bấm & Giả Lập</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={handleSinglePress}
                  disabled={isProcessing}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-cyan-500/10 dark:bg-slate-800/80 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-cyan-500">[1]</span> Bấm 1 Lần (Wakeup)
                </button>
                <button
                  onClick={handleDoublePress}
                  disabled={isProcessing}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-500/10 dark:bg-slate-800/80 dark:hover:bg-blue-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-blue-500">[2]</span> Bấm 2 Lần (Đặt/Hủy)
                </button>
                <button
                  onClick={handleStartProvisioning}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-cyan-500/10 dark:bg-slate-800/80 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-cyan-500">[3]</span> Giữ 5s (Đổi Wi-Fi)
                </button>
                <button
                  onClick={handleConnectWifi}
                  disabled={isProcessing}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-cyan-500/10 dark:bg-slate-800/80 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-blue-500">[4]</span> Nạp Wi-Fi Mới
                </button>
                <button
                  onClick={handleBootstrapCloud}
                  disabled={isProcessing}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-cyan-500/10 dark:bg-slate-800/80 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-indigo-500">[5]</span> Bootstrap Cloud
                </button>
                <button
                  onClick={handleSimulateOffline}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800/80 dark:hover:bg-rose-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-rose-500">[6]</span> Mô phỏng Offline
                </button>
                <button
                  onClick={handleFactoryReset}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-amber-500/10 dark:bg-slate-800/80 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-amber-500">[7]</span> Factory Reset (15s)
                </button>
                <button
                  onClick={handleShowTelemetry}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-emerald-500/10 dark:bg-slate-800/80 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-emerald-500">[8]</span> Show Telemetry
                </button>
                <button
                  onClick={handleShowState}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-purple-500/10 dark:bg-slate-800/80 dark:hover:bg-purple-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-purple-500">[9]</span> Device State
                </button>
                <button
                  onClick={() => handleLongPress(5)}
                  className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-cyan-500/10 dark:bg-slate-800/80 dark:hover:bg-cyan-500/20 text-slate-700 dark:text-slate-300 font-medium text-left truncate transition-colors"
                >
                  <span className="font-bold text-cyan-500">[0]</span> Giữ Nút 5s (Đổi Wi-Fi)
                </button>
              </div>
            </div>

            {/* Hardware Controls & Fault Injection */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-500" />
                    Mức Pin LiPo
                  </span>
                  <span className="font-mono">{batteryLevel}% ({batteryVoltage}V)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={batteryLevel}
                  onChange={(e) => setBatteryLevel(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5">
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">Mô phỏng Lỗi Wi-Fi</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Gây mất kết nối khi gửi đơn</p>
                </div>
                <input
                  type="checkbox"
                  checked={simulateWifiFail}
                  onChange={(e) => setSimulateWifiFail(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High-Tech Serial Monitor & Packet Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Serial Terminal */}
          <div className="p-5 bg-black border border-slate-800 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>UART SERIAL MONITOR (115200 BAUD)</span>
              </div>
              <button
                onClick={() => setLogMessages([`[${new Date().toLocaleTimeString()}] Log cleared.`])}
                className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
                title="Xóa nhật ký"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Log Stream Window */}
            <div className="h-64 overflow-y-auto font-mono text-xs space-y-1.5 pr-2 scrollbar-thin">
              {logMessages.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    log.includes('🎉')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('❌') || log.includes('ERROR')
                      ? 'text-red-400 font-bold'
                      : log.includes('🔐') || log.includes('HMAC')
                      ? 'text-cyan-300'
                      : log.includes('💤')
                      ? 'text-slate-500'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Packet Inspector Card */}
          <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>Gói Tin Mã Hóa Gần Nhất (Hardware Packet Payload)</span>
            </div>

            {lastPacket ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 dark:bg-black/50 border border-slate-200/80 dark:border-white/5 rounded-xl">
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold mb-1">HTTP HEADERS (HMAC-SHA256):</p>
                  <pre className="text-slate-700 dark:text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(lastPacket.headers, null, 2)}
                  </pre>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-black/50 border border-slate-200/80 dark:border-white/5 rounded-xl">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">BODY PAYLOAD:</p>
                  <pre className="text-slate-700 dark:text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(lastPacket.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium py-4 text-center">
                Chưa có gói tin nào được gửi. Hãy bấm vào nút trên để kích hoạt chu trình truyền dữ liệu.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
