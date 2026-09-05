import React from 'react';
import { Radio, Cpu, Wifi, Cloud, Store } from 'lucide-react';

interface NetworkSignalFlowProps {
  activeStep?: number; // 0 to 4
  interactive?: boolean;
  className?: string;
  onStepClick?: (step: number) => void;
}

export const NetworkSignalFlow: React.FC<NetworkSignalFlowProps> = ({
  activeStep = 0,
  interactive = true,
  className = '',
  onStepClick,
}) => {
  const nodes = [
    { id: 'button', label: 'Smart Button', sub: 'Nút vật lý', icon: Radio },
    { id: 'esp32', label: 'ESP32 Node', sub: 'Mã hóa HMAC', icon: Cpu },
    { id: 'wifi', label: 'Wi-Fi Edge', sub: 'Gateway 2.4GHz', icon: Wifi },
    { id: 'cloud', label: 'Cloud Broker', sub: 'Xác thực & Router', icon: Cloud },
    { id: 'store', label: 'Đại Lý Kho', sub: 'Nhận đơn Socket', icon: Store },
  ];

  return (
    <div className={`w-full py-6 select-none ${className}`}>
      {/* Visual Pipeline Container */}
      <div className="relative max-w-4xl mx-auto px-4">
        {/* Subtle Background SVG Signal Connector Line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 pointer-events-none hidden sm:block">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 2">
            {/* Base static faint line */}
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="currentColor"
              className="text-slate-200 dark:text-amber-500/20"
              strokeWidth="1.5"
            />
            {/* Animated dashed signal pulse flowing from Button to Store */}
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="url(#signalGradient)"
              strokeWidth="2"
              className="animate-signal-flow opacity-70 dark:hidden"
            />
            <line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="url(#signalGradientGold)"
              strokeWidth="2"
              className="animate-signal-flow opacity-80 hidden dark:block"
            />
            <defs>
              <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="signalGradientGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D97706" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="1" />
                <stop offset="100%" stopColor="#FDE047" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 5 Physical IoT Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isCurrent = idx === activeStep;
            const isPassed = idx <= activeStep;

            return (
              <div
                key={node.id}
                onClick={() => interactive && onStepClick?.(idx)}
                className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 ${
                  interactive ? 'cursor-pointer' : ''
                } ${
                  isCurrent
                    ? 'bg-white dark:bg-[#141416] border-2 border-blue-600 dark:border-amber-400 shadow-lg shadow-blue-500/15 dark:shadow-amber-500/25 scale-105'
                    : isPassed
                    ? 'bg-white/80 dark:bg-[#121214]/80 border border-slate-200 dark:border-amber-500/20'
                    : 'bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800 opacity-60'
                }`}
              >
                {/* Node Orb with Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-blue-600 dark:bg-gradient-to-br dark:from-amber-400 dark:to-amber-600 text-white dark:text-black shadow-md shadow-blue-500/30 dark:shadow-amber-500/30'
                      : isPassed
                      ? 'bg-blue-500/15 dark:bg-amber-500/15 text-blue-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Node Metadata */}
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                  {node.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  {node.sub}
                </span>

                {/* Status Dot */}
                <div className="mt-1.5 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCurrent
                        ? 'bg-blue-600 dark:bg-amber-400 animate-ping'
                        : isPassed
                        ? 'bg-emerald-500 dark:bg-amber-400'
                        : 'bg-slate-300 dark:bg-zinc-700'
                    }`}
                  />
                  <span className="text-[9px] font-mono uppercase text-slate-400 dark:text-zinc-500">
                    {isCurrent ? 'ACTIVE' : isPassed ? 'READY' : 'STANDBY'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
