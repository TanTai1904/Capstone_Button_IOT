import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowRight, Shield, Zap, Battery, CheckCircle2, ShoppingBag, Smartphone, Cpu, Sparkles, Activity, Layers, Lock, Wifi, RefreshCw, Droplets, Flame, Wheat, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Interactive3DButton } from '../components/3d/Interactive3DButton';
import { Floating3DCard } from '../components/3d/Floating3DCard';
import { NetworkSignalFlow } from '../components/3d/NetworkSignalFlow';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const [buttonPressed, setButtonPressed] = useState(false);
  const [ledState, setLedState] = useState<'off' | 'blue' | 'yellow' | 'green'>('off');
  const [telemetryStage, setTelemetryStage] = useState<string>('ESP32 Deep Sleep (<15µA)');
  const [activeFlowStep, setActiveFlowStep] = useState<number>(0);

  // Web Audio synthetic click & chime (100% native, no external mp3 required)
  const playTactileClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  const playSuccessChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch {}
  };

  const handleTestPress = () => {
    if (buttonPressed) return;
    setButtonPressed(true);
    playTactileClick();
    setLedState('blue');
    setTelemetryStage('RTC Wake (8ms) → Bắt tay mạng Wi-Fi...');

    setTimeout(() => {
      setLedState('yellow');
      setTelemetryStage('Tạo băm HMAC-SHA256 & Đẩy gói tin đến Edge Broker...');
    }, 600);

    setTimeout(() => {
      setLedState('green');
      setTelemetryStage('Đơn hàng xác nhận thành công! Báo động Realtime POS.');
      playSuccessChime();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
      });
    }, 1400);

    setTimeout(() => {
      setLedState('off');
      setButtonPressed(false);
      setTelemetryStage('Hoàn tất chu trình → Quay về Deep Sleep (<15µA)');
    }, 4200);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 telemetry-grid transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-200/80 dark:border-red-500/20">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-600/5 dark:from-red-600/20 dark:via-rose-600/10 dark:to-transparent blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Tech Hero Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-500/35 text-xs font-mono font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-red-500 animate-ping"></span>
                <span>NỀN TẢNG IoT THƯƠNG MẠI THẾ HỆ MỚI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Một nút bấm vật lý. <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-red-500 dark:via-rose-400 dark:to-red-600 bg-clip-text text-transparent">
                  Đặt đúng thứ cần,
                </span>{' '}
                chuẩn xác tức thì.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                Giải pháp nút bấm IoT vật lý tiết kiệm pin thông minh kết nối khách hàng trực tiếp với đại lý nước uống 20L, gas, gạo và nhu yếu phẩm. Loại bỏ hoàn toàn phiền toái mở app, tìm kiếm hay gọi điện thoại mỗi lần hết đồ.
              </p>

              {/* Action Buttons - Unified Brand Color Palette */}
              <div className="flex flex-wrap gap-3.5 pt-2">
                <Link
                  to="/quick-setup"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white dark:from-red-600 dark:via-red-500 dark:to-rose-600 dark:hover:from-red-500 dark:hover:to-rose-500 dark:text-white dark:shadow-red-600/35 font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center space-x-2.5 transition-all btn-press"
                >
                  <Wifi className="w-4 h-4 text-cyan-200 dark:text-white" />
                  <span>Cài Wi-Fi Nút Bấm 1-Chạm</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  to="/simulator"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50/70 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200/90 dark:border-red-500/30 text-slate-800 hover:text-blue-600 dark:text-red-400 font-bold text-sm shadow-sm transition-all flex items-center space-x-2.5 btn-press"
                >
                  <Cpu className="w-4 h-4 text-blue-600 dark:text-red-400" />
                  <span>ESP32 Simulator</span>
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-sm border border-slate-200 dark:border-red-500/20 shadow-sm transition-all"
                >
                  Đăng Ký Đại Lý
                </Link>
              </div>

              {/* Hardware Highlights Cards */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 dark:border-red-500/20">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-red-500/20">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-600 dark:text-red-400 font-bold">
                    <Battery className="w-3.5 h-3.5" />
                    <span>&lt; 15µA</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">Dòng Deep Sleep tiết kiệm pin 12-18 tháng</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-red-500/20">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-blue-600 dark:text-rose-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>&lt; 1.8s</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">Bắt tay Wi-Fi & gửi đơn đến Cloud Broker</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-red-500/20">
                  <div className="flex items-center space-x-1.5 text-xs font-mono text-indigo-600 dark:text-red-400 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    <span>HMAC-SHA256</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">Bảo mật phần cứng chống gian lận & spam đơn</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Hardware Smart Button */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* 3D Floating Hardware Showcase */}
              <Floating3DCard
                maxTilt={12}
                className="w-full max-w-md bg-white/90 dark:bg-[#0E0E12]/95 backdrop-blur-2xl border border-blue-100 dark:border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-3d-card text-center relative z-10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 dark:bg-red-500/15 dark:border-red-500/30 text-[10px] font-mono font-bold text-blue-600 dark:text-red-400">
                    <img
                      src={theme === 'dark' ? '/assets/logo-red.png' : '/assets/logo.png'}
                      alt="Logo"
                      className="w-3.5 h-3.5 rounded object-cover transition-all duration-300 dark:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                    />
                    <span>ESP32-3D HARDWARE</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:bg-red-500/15 dark:border-red-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-red-500 animate-ping"></span>
                    <span>ONLINE • 98% PIN</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500">Mã Thiết Bị: SOB-8829-WTR</p>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">Nút Nước Khoáng Lavie 20L (3D Model)</h3>
                </div>

                {/* The 3D Interactive Physical Button Component (36.4 & 36.7) */}
                <div className="py-2">
                  <Interactive3DButton size="lg" showTelemetry={true} showCircularHalo={true} />
                </div>

                {/* Hardware Gestures Micro-Legend */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-red-500/20 text-[10px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                  <span><strong className="text-blue-600 dark:text-red-400 font-mono">1 Click:</strong> Bật nguồn</span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span><strong className="text-blue-600 dark:text-rose-400 font-mono">2 Clicks:</strong> Đặt / Hủy đơn</span>
                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                  <span><strong className="text-indigo-600 dark:text-red-400 font-mono">Giữ 5s:</strong> Đổi Wi-Fi</span>
                </div>
              </Floating3DCard>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Hardware & Edge Steps with 36.3 & 36.8 Network Signal Animation */}
      <section className="py-20 border-b border-slate-200/80 dark:border-red-500/20 relative overflow-hidden">
        {/* Soft technical grid background for Section 36.8 */}
        <div className="absolute inset-0 dot-matrix-bg opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-mono font-bold text-blue-600 dark:text-red-400 uppercase tracking-widest">Quy Trình Tự Động Hóa</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Từ Cú Nhấn Cơ Học Đến Màn Hình Đại Lý</p>
            <p className="text-slate-600 dark:text-zinc-400 mt-2 text-sm leading-relaxed">
              Toàn bộ hạ tầng mạng phức tạp được đóng gói trong vi điều khiển, khách hàng chỉ cần duy nhất một thao tác.
            </p>
          </div>

          {/* Section 36.3 & 36.8: Network Signal Pipeline linking 5 IoT Nodes */}
          <NetworkSignalFlow
            activeStep={activeFlowStep}
            onStepClick={(s) => setActiveFlowStep(s)}
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Floating3DCard maxTilt={8} className="h-full">
              <div
                onMouseEnter={() => setActiveFlowStep(0)}
                className={`p-6 h-full bg-white/90 dark:bg-[#121216]/90 border rounded-3xl shadow-3d-card transition-all group ${
                  activeFlowStep === 0
                    ? 'border-blue-500 dark:border-red-400 shadow-blue-500/15 dark:shadow-red-500/20 ring-2 ring-blue-400/20 dark:ring-red-400/20'
                    : 'border-slate-200/80 dark:border-red-500/20 hover:border-blue-500/40 dark:hover:border-red-400/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-red-500/15 text-blue-600 dark:text-red-400 flex items-center justify-center font-mono font-bold text-sm mb-4 border border-blue-500/20 dark:border-red-500/30 group-hover:scale-110 transition-transform">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Ngắt RTC Thức Dậy</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Ngắt GPIO vật lý đánh thức ESP32 trong 8ms. Đèn LED sáng xanh báo hiệu hệ thống đã tiếp nhận lệnh ngay lập tức.
                </p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={8} className="h-full">
              <div
                onMouseEnter={() => setActiveFlowStep(1)}
                className={`p-6 h-full bg-white/90 dark:bg-[#121216]/90 border rounded-3xl shadow-3d-card transition-all group ${
                  activeFlowStep === 1
                    ? 'border-cyan-500 dark:border-rose-400 shadow-cyan-500/15 dark:shadow-rose-500/20 ring-2 ring-cyan-400/20 dark:ring-rose-400/20'
                    : 'border-slate-200/80 dark:border-red-500/20 hover:border-cyan-500/40 dark:hover:border-rose-400/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-rose-500/15 text-cyan-600 dark:text-rose-400 flex items-center justify-center font-mono font-bold text-sm mb-4 border border-cyan-500/20 dark:border-rose-500/30 group-hover:scale-110 transition-transform">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Mã Hóa HMAC-SHA256</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Thiết bị tự sinh Nonce và Timestamp ngẫu nhiên, ký gói tin bằng Secret Key độc bản trên chip chống giả mạo tuyệt đối.
                </p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={8} className="h-full">
              <div
                onMouseEnter={() => setActiveFlowStep(2)}
                className={`p-6 h-full bg-white/90 dark:bg-[#121216]/90 border rounded-3xl shadow-3d-card transition-all group ${
                  activeFlowStep === 2
                    ? 'border-emerald-500 dark:border-red-400 shadow-emerald-500/15 dark:shadow-red-500/20 ring-2 ring-emerald-400/20 dark:ring-red-400/20'
                    : 'border-slate-200/80 dark:border-red-500/20 hover:border-emerald-500/40 dark:hover:border-red-400/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-red-500/15 text-emerald-600 dark:text-red-400 flex items-center justify-center font-mono font-bold text-sm mb-4 border border-emerald-500/20 dark:border-red-500/30 group-hover:scale-110 transition-transform">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Đồng Bộ Cloud Realtime</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Cloud Broker kiểm tra chống spam lặp, tạo đơn hàng, kích hoạt cửa sổ hủy 60s và phát WebSocket tới đại lý.
                </p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={8} className="h-full">
              <div
                onMouseEnter={() => setActiveFlowStep(4)}
                className={`p-6 h-full bg-white/90 dark:bg-[#121216]/90 border rounded-3xl shadow-3d-card transition-all group ${
                  activeFlowStep === 4
                    ? 'border-indigo-500 dark:border-rose-400 shadow-indigo-500/15 dark:shadow-rose-500/20 ring-2 ring-indigo-400/20 dark:ring-rose-400/20'
                    : 'border-slate-200/80 dark:border-red-500/20 hover:border-indigo-500/40 dark:hover:border-rose-400/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-rose-500/15 text-indigo-600 dark:text-rose-400 flex items-center justify-center font-mono font-bold text-sm mb-4 border border-indigo-500/20 dark:border-rose-500/30 group-hover:scale-110 transition-transform">
                  04
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Xuất Kho & Giao Nhanh</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Màn hình trạm điều hành reo chuông báo và tự động điều hướng đơn tới nhân viên giao hàng gần nhất.
                </p>
              </div>
            </Floating3DCard>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 border-b border-slate-200/80 dark:border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold text-blue-600 dark:text-red-400 uppercase tracking-widest">Danh Mục Ứng Dụng</h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Tối Ưu Cho Mọi Nhu Yếu Phẩm Tiêu Dùng</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Floating3DCard maxTilt={10}>
              <div className="p-6 h-full bg-white/90 dark:bg-[#121216]/90 border border-slate-200/90 dark:border-red-500/25 rounded-3xl text-center shadow-3d-card hover:border-blue-500/40 dark:hover:border-red-500/40 transition-all">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 dark:bg-red-500/15 text-blue-600 dark:text-red-400 flex items-center justify-center mb-3">
                  <Droplets className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Bình Nước 20L</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Lavie, Vĩnh Hảo, Miru</p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={10}>
              <div className="p-6 h-full bg-white/90 dark:bg-[#121216]/90 border border-slate-200/90 dark:border-red-500/25 rounded-3xl text-center shadow-3d-card hover:border-red-500/40 dark:hover:border-rose-400/40 transition-all">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Bình Gas 12kg</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Petrolimex, Saigon Petro</p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={10}>
              <div className="p-6 h-full bg-white/90 dark:bg-[#121216]/90 border border-slate-200/90 dark:border-red-500/25 rounded-3xl text-center shadow-3d-card hover:border-emerald-500/40 dark:hover:border-red-400/40 transition-all">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 dark:bg-red-500/15 text-emerald-600 dark:text-red-300 flex items-center justify-center mb-3">
                  <Wheat className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Gạo Đặc Sản</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Gạo ST25 Ông Cua 5-10kg</p>
              </div>
            </Floating3DCard>

            <Floating3DCard maxTilt={10}>
              <div className="p-6 h-full bg-white/90 dark:bg-[#121216]/90 border border-slate-200/90 dark:border-red-500/25 rounded-3xl text-center shadow-3d-card hover:border-indigo-500/40 dark:hover:border-rose-400/40 transition-all">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 dark:bg-rose-500/15 text-indigo-600 dark:text-rose-400 flex items-center justify-center mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Thùng Sữa Tươi</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">TH True MILK, Vinamilk 48 hộp</p>
              </div>
            </Floating3DCard>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-14 bg-slate-50/90 dark:bg-[#070709] text-slate-900 dark:text-white border-t border-slate-200/90 dark:border-red-500/20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-red-500/15 text-blue-700 dark:text-red-400 border border-blue-200 dark:border-red-500/30 text-xs font-mono font-bold shadow-sm">
            <img
              src={theme === 'dark' ? '/assets/logo-red.png' : '/assets/logo.png'}
              alt="Smart Order"
              className="w-3.5 h-3.5 rounded object-cover transition-all duration-300 dark:drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
            />
            <span>SMART ORDER BUTTON PLATFORM</span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hiện đại hóa chuỗi cung ứng hàng thiết yếu với công nghệ IoT</p>
          <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Hệ thống phần cứng mở tương thích ESP32, ESP8266, RP2040 với giao thức mã hóa HMAC chống gian lận thương mại.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/simulator"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-rose-600 dark:hover:from-red-500 dark:hover:to-rose-500 dark:text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 dark:shadow-red-600/30 btn-press"
            >
              Mở ESP32 Simulator
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-red-400 text-xs font-bold border border-slate-300/90 dark:border-red-500/30 shadow-sm transition-all"
            >
              Đăng Nhập Trạm
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
