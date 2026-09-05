import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Store, AuditLog } from '../../types';
import { Shield, CheckCircle2, XCircle, Clock, Store as StoreIcon, Cpu, ShoppingBag, DollarSign, AlertCircle, Terminal, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [pendingStores, setPendingStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectingStoreId, setRejectingStoreId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAdminData = async () => {
    try {
      const [pendingRes, statsRes, logsRes] = await Promise.all([
        api.get('/admin/stores/pending'),
        api.get('/admin/stats'),
        api.get('/admin/audit-logs'),
      ]);

      if (pendingRes.data.success) setPendingStores(pendingRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (logsRes.data.success) setAuditLogs(logsRes.data.data);
    } catch (e) {
      console.error('Failed to load admin portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (storeId: string) => {
    try {
      const res = await api.post(`/admin/stores/${storeId}/approve`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể phê duyệt');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingStoreId || !rejectReason.trim()) return;

    try {
      const res = await api.post(`/admin/stores/${rejectingStoreId}/reject`, {
        reason: rejectReason,
      });
      if (res.data.success) {
        setRejectingStoreId(null);
        setRejectReason('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể từ chối');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Cổng Giám Sát & Quản Trị Hệ Thống</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Giám sát toàn bộ hạ tầng IoT, xét duyệt đại lý thương mại và theo dõi nhật ký kiểm toán vi điều khiển
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">SYSTEM HEALTH: 99.98%</span>
        </div>
      </div>

      {/* System Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng Trạm Cửa Hàng</div>
            <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">{stats.totalStores}</p>
            <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold mt-1">{stats.pendingStores} đang chờ duyệt</p>
          </div>

          <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Smart Buttons Hoạt Động</div>
            <p className="text-3xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 mt-1">{stats.activeDevices}</p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">/ {stats.totalDevices} thiết bị toàn mạng</p>
          </div>

          <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng Lượt Đặt Hàng</div>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{stats.totalOrders}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Xử lý tự động qua nút ESP32</p>
          </div>

          <div className="p-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Doanh Thu Toàn Mạng</div>
            <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5">{stats.totalRevenue?.toLocaleString()} ₫</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Khớp lệnh Realtime</p>
          </div>
        </div>
      )}

      {/* Pending Store Approvals */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Đơn Đăng Ký Đại Lý Chờ Xét Duyệt ({pendingStores.length})</span>
          </h2>
        </div>

        {pendingStores.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-mono">Không có cửa hàng nào đang chờ xét duyệt.</p>
        ) : (
          <div className="space-y-3">
            {pendingStores.map((store) => (
              <div
                key={store.id}
                className="p-4 border border-slate-200/80 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{store.name}</span>
                    <span className="font-mono text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">{store.code}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">Chủ đại lý: <strong>{store.ownerName}</strong> • {store.phone} • {store.email}</p>
                  <p className="text-slate-500 dark:text-slate-500">Địa chỉ kho: {store.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(store.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all btn-press"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phê Duyệt Mở Trạm</span>
                  </button>
                  <button
                    onClick={() => setRejectingStoreId(store.id)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ Chối</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Audit Logs */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Nhật Ký Kiểm Toán Toàn Hệ Thống (Audit Logs)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase font-mono tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4">Hành Động</th>
                <th className="py-3 px-4">Đối Tượng</th>
                <th className="py-3 px-4">Chi Tiết Gói Tin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.entity} #{log.entityId.substring(0, 8)}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">{log.newValues || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingStoreId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Từ Chối Phê Duyệt Cửa Hàng</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bắt buộc phải nhập lý do từ chối để hệ thống gửi thông báo cho chủ cơ sở.
            </p>

            <form onSubmit={handleReject} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lý do từ chối</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="VD: Không cung cấp được giấy phép kinh doanh hoặc địa chỉ không xác thực được..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-black/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingStoreId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-500/20 transition-all"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
