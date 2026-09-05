import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Radio, LogOut, Shield, Store, Smartphone, Cpu, Sun, Moon, Activity, Wifi } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#08080A]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-red-500/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blue-500/20 dark:shadow-red-600/40 border border-blue-500/30 dark:border-red-500/50 group-hover:scale-105 transition-all bg-slate-950 flex items-center justify-center p-0.5">
              <img
                src={theme === 'dark' ? '/assets/logo-red.png' : '/assets/logo.png'}
                alt="Smart Order"
                className="w-full h-full object-cover rounded-[9px] transition-all duration-300 dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-red-400 transition-colors">
                  SMART ORDER
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-red-500/15 text-blue-700 dark:text-red-400 border border-blue-200 dark:border-red-500/30">
                  IoT v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-red-500 animate-pulse"></span>
                Một nút bấm vật lý — Tự động hóa chuỗi cung ứng
              </p>
            </div>
          </Link>
        </div>

        {/* Action Center & Role View */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Node Pulse Badge (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-red-500/20 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>CLOUD EDGE: <strong className="text-emerald-600 dark:text-emerald-400">LIVE</strong></span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-500 dark:text-slate-400">&lt;18ms</span>
          </div>

          {/* Quick Wi-Fi Setup Shortcut */}
          <Link
            to="/quick-setup"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-red-600 dark:via-red-500 dark:to-rose-600 dark:hover:from-red-500 dark:hover:to-rose-500 rounded-xl shadow-sm shadow-blue-500/20 dark:shadow-red-600/30 transition-all btn-press"
            title="Cài đặt Wi-Fi cho nút bấm không cần đăng nhập"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Cài Wi-Fi Nút Bấm</span>
          </Link>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 border border-transparent hover:border-slate-200 dark:hover:border-red-500/20 transition-all"
            title={theme === 'dark' ? 'Chuyển sang chế độ Sáng (Xanh-Trắng)' : 'Chuyển sang chế độ Tối (Đỏ-Đen)'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-red-400 rotate-0 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform" />
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Navigation links based on role - Unified Brand Styling */}
              {['STORE_OWNER', 'STORE_MANAGER', 'STORE_STAFF'].includes(user.role) && (
                <Link
                  to="/store/dashboard"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl shadow-sm shadow-blue-500/20 dark:shadow-red-600/30 transition-all btn-press"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cửa Hàng</span>
                </Link>
              )}

              {user.role === 'CUSTOMER' && (
                <Link
                  to="/customer/home"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl shadow-sm shadow-blue-500/20 dark:shadow-red-600/30 transition-all btn-press"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Nút Của Tôi</span>
                </Link>
              )}

              {user.role === 'SUPER_ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl shadow-sm shadow-blue-500/20 dark:shadow-red-600/30 transition-all btn-press"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </Link>
              )}

              {/* User Dropdown / Info - Synchronized Badge */}
              <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/10 space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center justify-end gap-1.5">
                    <span>{user.fullName}</span>
                    {user.emailVerified ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/20" title="Email đã xác thực">✓ ĐÃ XÁC THỰC</span>
                    ) : (
                      <Link to="/verify-email" className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-500/20 hover:underline" title="Chưa kích hoạt email - Bấm để kích hoạt">CHƯA XÁC THỰC</Link>
                    )}
                  </p>
                  <p className="text-[10px] font-mono text-blue-600 dark:text-red-400 font-semibold mt-0.5">
                    {user.username ? `@${user.username}` : user.role}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-amber-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/90 transition-all border border-transparent hover:border-slate-200 dark:hover:border-amber-500/20"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white dark:text-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 dark:from-amber-500 dark:via-yellow-400 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-yellow-300 rounded-xl shadow-md shadow-blue-500/20 dark:shadow-amber-500/25 hover:shadow-blue-500/30 transition-all btn-press"
              >
                Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
