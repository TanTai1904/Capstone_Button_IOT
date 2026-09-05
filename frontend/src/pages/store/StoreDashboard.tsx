import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeToStore, getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/OrderSoundContext';
import { AnalyticsChart } from '../../components/AnalyticsChart';
import { Order } from '../../types';
import { ShoppingBag, Clock, CheckCircle2, Truck, AlertCircle, Phone, MapPin, Radio, DollarSign, Calendar, ChevronRight, TrendingUp, X, Activity } from 'lucide-react';
import { Floating3DCard } from '../../components/3d/Floating3DCard';

export const StoreDashboard: React.FC = () => {
  const { user } = useAuth();
  const { playOrderChime } = useSound();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const [orderRes, analyticsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/analytics/dashboard').catch(() => ({ data: { success: false } })),
      ]);
      if (orderRes.data.success) {
        setOrders(orderRes.data.data);
      }
      if (analyticsRes.data?.success && analyticsRes.data.data?.chartData) {
        setChartData(analyticsRes.data.data.chartData);
      }
    } catch (e) {
      console.error('Failed to fetch store orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (user?.storeId) {
      subscribeToStore(user.storeId);
    }

    const socket = getSocket();

    const handleOrderCreated = (payload: any) => {
      console.log('⚡ [Store Live Feed] Order Created:', payload);
      playOrderChime();
      setNewOrderAlert({
        type: 'CREATE',
        orderNumber: payload.order?.orderNumber,
        customerName: payload.customerName || payload.order?.customerName,
        productName: payload.productName,
        quantity: payload.quantity,
        totalAmount: payload.order?.totalAmount,
        deliveryAddress: payload.order?.deliveryAddress,
        orderId: payload.order?.id,
      });
      fetchOrders();
    };

    const handleOrderCancelled = (payload: any) => {
      console.log('❌ [Store Live Feed] Order Cancelled:', payload);
      setNewOrderAlert({
        type: 'CANCEL',
        orderNumber: payload.order?.orderNumber,
        reason: payload.reason || 'Khách bấm nút hủy đơn trên ESP32',
      });
      fetchOrders();
      setTimeout(() => {
        setNewOrderAlert(null);
      }, 8000);
    };

    const handleOrderUpdated = () => {
      fetchOrders();
    };

    socket.on('ORDER_CREATED', handleOrderCreated);
    socket.on('ORDER_STATUS_CHANGED', handleOrderUpdated);
    socket.on('ORDER_CANCELLED', handleOrderCancelled);

    return () => {
      socket.off('ORDER_CREATED', handleOrderCreated);
      socket.off('ORDER_STATUS_CHANGED', handleOrderUpdated);
      socket.off('ORDER_CANCELLED', handleOrderCancelled);
    };
  }, [user]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
        );
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const inProgressCount = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">CHỜ XÁC NHẬN</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">ĐÃ TIẾP NHẬN</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">ĐANG CHUẨN BỊ</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">ĐANG GIAO HÀNG</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">HOÀN THÀNH</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">ĐÃ HỦY</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Fidelity Realtime Alert Banner */}
      {newOrderAlert && (
        <div
          className={`p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            newOrderAlert.type === 'CREATE'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white shadow-red-500/20'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 bg-white/20 rounded-full">
                  {newOrderAlert.type === 'CREATE' ? 'Đơn Mới Từ Nút ESP32' : 'Đơn Đã Hủy Qua ESP32'}
                </span>
                <span className="font-mono font-bold text-xs">#{newOrderAlert.orderNumber}</span>
              </div>
              <p className="text-sm font-bold">
                {newOrderAlert.type === 'CREATE'
                  ? `Khách ${newOrderAlert.customerName} vừa đặt ${newOrderAlert.quantity}x ${newOrderAlert.productName} (${newOrderAlert.totalAmount?.toLocaleString()} ₫)`
                  : `Đơn hàng #${newOrderAlert.orderNumber} đã bị hủy bởi khách hàng qua nút bấm (Đã tự động hoàn kho)`}
              </p>
              {newOrderAlert.deliveryAddress && (
                <p className="text-xs text-white/85 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{newOrderAlert.deliveryAddress}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {newOrderAlert.type === 'CREATE' && (
              <button
                onClick={() => {
                  if (newOrderAlert.orderId) {
                    handleUpdateStatus(newOrderAlert.orderId, 'CONFIRMED');
                  }
                  setNewOrderAlert(null);
                }}
                className="px-3.5 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow hover:bg-slate-100 transition-all btn-press"
              >
                Tiếp Nhận Đơn
              </button>
            )}
            <button
              onClick={() => setNewOrderAlert(null)}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Đơn Hàng Trực Tiếp (Live Orders)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30">
              REALTIME
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dòng sự kiện thời gian thực từ các Smart Order Button trong mạng lưới khách hàng
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/90 border border-slate-200 dark:border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">WebSocket Live Feed</span>
        </div>
      </div>

      {/* Stat Cards Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Floating3DCard depth={18} className="rounded-2xl">
          <div className="p-4 bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl shadow-md h-full flex flex-col justify-between hover:dark:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-semibold">Chờ Xử Lý</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Cần xác nhận đơn ngay</p>
          </div>
        </Floating3DCard>

        <Floating3DCard depth={18} className="rounded-2xl">
          <div className="p-4 bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl shadow-md h-full flex flex-col justify-between hover:dark:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-semibold">Đang Tiến Hành</span>
              <Truck className="w-4 h-4 text-blue-500 dark:text-red-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{inProgressCount}</p>
            <p className="text-[11px] text-blue-600 dark:text-red-400 font-medium mt-1">Đang chuẩn bị & giao</p>
          </div>
        </Floating3DCard>

        <Floating3DCard depth={18} className="rounded-2xl">
          <div className="p-4 bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl shadow-md h-full flex flex-col justify-between hover:dark:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-semibold">Đã Hoàn Thành</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{completedCount}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Giao thành công</p>
          </div>
        </Floating3DCard>

        <Floating3DCard depth={18} className="rounded-2xl">
          <div className="p-4 bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl shadow-md h-full flex flex-col justify-between hover:dark:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-xs font-semibold">Doanh Số Tạm Tính</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalRevenue.toLocaleString()} ₫</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Đã chốt thành công</p>
          </div>
        </Floating3DCard>
      </div>

      {/* Revenue Analytics Chart (Recharts) */}
      <div className="bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Biểu Đồ Doanh Thu Theo Ngày (Telemetry Analytics)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Xu hướng đặt hàng định kỳ từ mạng lưới Smart Button</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200 dark:text-red-400 dark:bg-red-500/15 dark:border-red-500/30 px-2.5 py-1 rounded-full">
            7 Ngày Gần Nhất
          </span>
        </div>
        <AnalyticsChart data={chartData} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-red-500/20 pb-2 overflow-x-auto scrollbar-thin">
        {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-blue-600 dark:bg-red-600 text-white shadow-md shadow-blue-500/20 dark:shadow-red-600/35 border border-transparent dark:border-red-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-red-950/30'
            }`}
          >
            {st === 'ALL' && 'Tất Cả'}
            {st === 'PENDING' && `Chờ Tiếp Nhận (${pendingCount})`}
            {st === 'CONFIRMED' && 'Đã Nhận'}
            {st === 'PREPARING' && 'Chuẩn Bị'}
            {st === 'OUT_FOR_DELIVERY' && 'Đang Giao'}
            {st === 'COMPLETED' && 'Hoàn Thành'}
            {st === 'CANCELLED' && 'Đã Hủy'}
          </button>
        ))}
      </div>

      {/* Orders List / Live Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm font-mono">Đang tải danh sách đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Khi khách hàng bấm Smart Order Button, đơn hàng sẽ lập tức hiển thị tại đây kèm chuông báo động.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-[#101014] border border-slate-200/80 dark:border-red-500/20 rounded-2xl p-5 shadow-sm hover:border-blue-400 dark:hover:border-red-500/50 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-red-500/20">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.status)}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    Khách: {order.customerName}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-mono">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 max-w-md truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Ordered Items Preview */}
                <div className="pt-1 flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300 text-xs font-semibold"
                    >
                      {item.quantity}x {item.productName} ({item.totalPrice.toLocaleString()} ₫)
                    </span>
                  ))}
                  {order.device && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1 border border-slate-200 dark:border-red-500/20">
                      <Radio className="w-3 h-3 text-emerald-500" />
                      {order.device.configuration?.customName || order.device.deviceId}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action Buttons: Advance Workflow */}
              <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 dark:shadow-red-600/30 transition-all flex items-center gap-1.5 btn-press"
                  >
                    <span>Tiếp Nhận Đơn</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 btn-press"
                  >
                    <span>Chuẩn Bị Hàng</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 btn-press"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Xuất Kho Đi Giao</span>
                  </button>
                )}

                {order.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 btn-press"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hoàn Thành & Đã Thu Tiền</span>
                  </button>
                )}

                {order.status === 'COMPLETED' && (
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" /> ĐÃ GIAO XONG
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
