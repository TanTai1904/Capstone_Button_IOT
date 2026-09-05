import React, { useState, useRef } from 'react';
import { Wifi, Battery, ShieldCheck, Zap, Radio, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SmartButtonLightField, ButtonLightState } from './SmartButtonLightField';

interface Interactive3DButtonProps {
  onPress?: () => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTelemetry?: boolean;
  showCircularHalo?: boolean;
  label?: string;
  subLabel?: string;
  hideFeedbackFooter?: boolean;
  overrideLedState?: 'off' | 'blue' | 'yellow' | 'green' | 'red';
  overrideStatusText?: string;
}

export const Interactive3DButton: React.FC<Interactive3DButtonProps> = ({
  onPress,
  interactive = true,
  size = 'lg',
  showTelemetry = true,
  showCircularHalo = false,
  label,
  subLabel,
  hideFeedbackFooter = false,
  overrideLedState,
  overrideStatusText,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [internalLedState, setInternalLedState] = useState<'off' | 'blue' | 'yellow' | 'green' | 'red'>('off');
  const [internalStatusText, setInternalStatusText] = useState('Sẵn sàng • Deep Sleep (<15µA)');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const activeLedState = overrideLedState !== undefined ? overrideLedState : internalLedState;
  const activeStatusText = overrideStatusText !== undefined ? overrideStatusText : internalStatusText;

  // Web Audio synthetic click
  const playTactileClick = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
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
        gain.gain.setValueAtTime(0.18, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.28);
      });
    } catch {}
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateY = (x / (rect.width / 2)) * 18;
    const rotateX = -(y / (rect.height / 2)) * 18;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handlePress = () => {
    if (isPressed || !interactive) return;
    setIsPressed(true);
    playTactileClick();
    setInternalLedState('blue');
    setInternalStatusText('RTC Wake (8ms) → Kết nối Wi-Fi...');
    onPress?.();

    setTimeout(() => {
      setInternalLedState('yellow');
      setInternalStatusText('Ký băm HMAC-SHA256 & Đẩy gói tin Cloud...');
    }, 650);

    setTimeout(() => {
      setInternalLedState('green');
      setInternalStatusText('Đơn Hàng Xác Nhận Thành Công! (60s hủy)');
      playSuccessChime();
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#06B6D4', '#10B981', '#F59E0B'],
        });
      } catch {}
    }, 1400);

    setTimeout(() => {
      setInternalLedState('off');
      setIsPressed(false);
      setInternalStatusText('Hoàn tất → Quay về Deep Sleep (<15µA)');
    }, 4200);
  };

  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-72 h-72 sm:w-80 sm:h-80',
  }[size];

  const buttonCapSize = {
    sm: 'w-28 h-28',
    md: 'w-40 h-40',
    lg: 'w-48 h-48 sm:w-52 sm:h-52',
  }[size];

  // Dynamic light field state mapped to 36.4 specification
  const lightState: ButtonLightState =
    activeLedState === 'green'
      ? 'success'
      : activeLedState === 'yellow' || activeLedState === 'blue'
      ? 'connecting'
      : activeLedState === 'red'
      ? 'error'
      : isPressed
      ? 'press'
      : 'idle';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center select-none"
      style={{ perspective: '1200px' }}
    >
      {/* 36.4 Smart Button Light Field positioned directly behind button */}
      <SmartButtonLightField state={lightState} size={size} />

      {/* 3D Rotatable Hardware Assembly with 36.5 Counter-Parallax */}
      <div
        className={`relative ${sizeClasses} transition-transform duration-200 ease-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translate3d(${
            -tilt.y * 0.4
          }px, ${tilt.x * 0.4}px, 0) scale3d(${isHovered ? 1.03 : 1}, ${
            isHovered ? 1.03 : 1
          }, 1)`,
        }}
      >
        {/* Section 36.7: Circular Light Halo */}
        {showCircularHalo && (
          <div
            className="absolute -inset-10 rounded-full border border-cyan-400/25 dark:border-amber-400/40 animate-halo-slow pointer-events-none shadow-[0_0_45px_rgba(6,182,212,0.15)] dark:shadow-[0_0_45px_rgba(245,158,11,0.25)]"
            style={{
              transform: 'translateZ(-50px)',
            }}
          />
        )}

        {/* Layer 1: Base Drop Shadow in 3D */}
        <div
          className="absolute inset-4 rounded-full blur-2xl transition-all duration-300 pointer-events-none"
          style={{
            transform: 'translateZ(-40px)',
            background:
              activeLedState === 'green'
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)'
                : activeLedState === 'yellow'
                ? 'radial-gradient(circle, rgba(245, 158, 11, 0.6) 0%, transparent 70%)'
                : activeLedState === 'blue'
                ? 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 70%)'
                : activeLedState === 'red'
                ? 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Layer 2: Outer Chamfered Hardware Bezel */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 dark:from-amber-600/30 dark:via-zinc-800 dark:to-zinc-950 p-[3px] shadow-2xl transition-all"
          style={{
            transform: 'translateZ(0px)',
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Inner Recessed Bezel Housing */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#18181b] dark:to-[#09090b] p-3 flex items-center justify-center relative overflow-hidden">
            {/* Ambient Metallic Sheen Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 dark:via-amber-400/5 to-transparent pointer-events-none" />

            {/* Layer 3: RGB Halo Ring */}
            <div
              className={`absolute inset-2.5 rounded-full border-2 transition-all duration-300 pointer-events-none ${
                activeLedState === 'green'
                  ? 'border-emerald-400 shadow-[0_0_30px_#10b981]'
                  : activeLedState === 'yellow'
                  ? 'border-amber-400 shadow-[0_0_30px_#f59e0b]'
                  : activeLedState === 'blue'
                  ? 'border-cyan-400 shadow-[0_0_30px_#06b6d4]'
                  : activeLedState === 'red'
                  ? 'border-rose-500 shadow-[0_0_30px_#ef4444]'
                  : 'border-slate-300/60 dark:border-amber-400/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              }`}
            />

            {/* Expanding 3D Wireless Signal Wave when pressed */}
            {isPressed && (
              <div
                className="absolute inset-0 rounded-full border border-cyan-400 dark:border-amber-400 animate-ring-pulse pointer-events-none"
                style={{ transform: 'translateZ(25px)' }}
              />
            )}

            {/* Layer 4: 3D Tactile Actuation Dome / Button Cap */}
            <button
              type="button"
              onClick={handlePress}
              aria-label="Nhấn nút đặt hàng thông minh"
              className={`relative ${buttonCapSize} rounded-full transition-all duration-150 cursor-pointer flex flex-col items-center justify-center group outline-none ${
                activeLedState === 'off' ? 'btn-cap-idle' : ''
              } ${
                isPressed ? 'scale-95' : 'hover:scale-[1.015]'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isPressed ? 'translateZ(6px)' : 'translateZ(24px)',
                background:
                  activeLedState === 'green'
                    ? 'radial-gradient(circle at 35% 35%, #34d399 0%, #059669 65%, #064e3b 100%)'
                    : activeLedState === 'yellow'
                    ? 'radial-gradient(circle at 35% 35%, #fbbf24 0%, #d97706 65%, #78350f 100%)'
                    : activeLedState === 'blue'
                    ? 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0284c7 65%, #082f49 100%)'
                    : activeLedState === 'red'
                    ? 'radial-gradient(circle at 35% 35%, #f87171 0%, #dc2626 65%, #7f1d1d 100%)'
                    : undefined,
                boxShadow: isPressed
                  ? 'inset 0 4px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)'
                  : '0 15px 30px -5px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.45)',
              }}
            >
              {/* Cap Gloss Highlight */}
              <div className="absolute top-2 w-3/4 h-1/3 rounded-full bg-gradient-to-b from-white/35 dark:from-white/15 to-transparent pointer-events-none" />

              {/* Central Glowing Icon & Prompt */}
              <div
                className="relative flex flex-col items-center justify-center text-white dark:text-amber-300 pointer-events-none px-2 text-center"
                style={{ transform: 'translateZ(10px)' }}
              >
                <Radio
                  className={`${size === 'sm' ? 'w-6 h-6' : 'w-10 h-10 sm:w-12 sm:h-12'} drop-shadow-md text-white dark:text-amber-400 transition-transform ${
                    isPressed ? 'scale-90' : 'group-hover:scale-110'
                  }`}
                />
                <span className={`${size === 'sm' ? 'text-[9px]' : 'text-[11px] sm:text-xs'} font-mono font-black tracking-widest uppercase mt-1 drop-shadow`}>
                  {label ? label : isPressed ? 'TRANSMITTING' : 'PRESS TO ORDER'}
                </span>
                {subLabel && (
                  <span className="text-[8px] font-sans text-blue-200/90 dark:text-amber-300/80 font-medium">
                    {subLabel}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Floating 3D Parallax Telemetry Chips */}
        {showTelemetry && (
          <>
            <div
              className="absolute -top-3 -right-2 px-3 py-1 rounded-xl bg-white/95 dark:bg-[#121214]/95 border border-slate-200/90 dark:border-amber-500/30 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 backdrop-blur-md shadow-md dark:shadow-xl flex items-center gap-1.5 transition-transform duration-200"
              style={{ transform: 'translateZ(45px)' }}
            >
              <Battery className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-700 dark:text-zinc-200">3.6V • 98%</span>
            </div>

            <div
              className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl bg-white/95 dark:bg-[#121214]/95 border border-slate-200/90 dark:border-amber-500/30 text-[10px] font-mono font-bold text-blue-600 dark:text-amber-400 backdrop-blur-md shadow-md dark:shadow-xl flex items-center gap-1.5 transition-transform duration-200"
              style={{ transform: 'translateZ(45px)' }}
            >
              <Wifi className="w-3.5 h-3.5 text-blue-500 dark:text-amber-400" />
              <span className="text-slate-700 dark:text-zinc-200">RSSI -52dBm</span>
            </div>

            <div
              className="absolute top-1/2 -right-8 -translate-y-1/2 hidden sm:flex px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[#121214]/95 border border-slate-200/90 dark:border-amber-500/30 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 backdrop-blur-md shadow-md dark:shadow-xl items-center gap-1.5 transition-transform duration-200"
              style={{ transform: 'translateZ(50px)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-700 dark:text-zinc-200">HMAC-SHA256</span>
            </div>
          </>
        )}
      </div>

      {/* Realtime Status Feedback Pill below the 3D button */}
      {!hideFeedbackFooter && (
        <div className="mt-6 flex flex-col items-center space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-amber-500/25 text-xs font-mono font-semibold shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                activeLedState === 'green'
                  ? 'bg-emerald-500 animate-ping'
                  : activeLedState === 'yellow'
                  ? 'bg-amber-500 animate-pulse'
                  : activeLedState === 'blue'
                  ? 'bg-blue-600 dark:bg-amber-400 animate-pulse'
                  : activeLedState === 'red'
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-blue-500 dark:bg-amber-400'
              }`}
            />
            <span className="text-slate-800 dark:text-zinc-200">{activeStatusText}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center">
            Nhấp chuột để mô phỏng lần bấm nút thật hoặc rê chuột để xoay 3D
          </p>
        </div>
      )}
    </div>
  );
};
