'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  MessageCircle,
  Copy,
  Check,
  Eye,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  X,
  Loader2,
  ChefHat,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { formatRupiah, formatIndonesianDate, formatIndonesianDateTime, formatWhatsAppNumber } from '@/lib/utils';

export default function AdminPesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Live Auto Polling State
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  // Editable fields inside modal
  const [modalOrderStatus, setModalOrderStatus] = useState<OrderStatus>('Baru');
  const [modalPaymentStatus, setModalPaymentStatus] = useState<PaymentStatus>('Belum Dibayar');
  const [modalInternalNotes, setModalInternalNotes] = useState('');
  const [modalCancelReason, setModalCancelReason] = useState('');

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setLastSynced(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, startDate, endDate]);

  // Periodic Polling
  useEffect(() => {
    if (!isLiveSync) return;
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [isLiveSync, statusFilter, paymentFilter, search, startDate, endDate]);

  const handleQuickTransition = async (
    orderId: string,
    newOrderStatus?: OrderStatus,
    newPaymentStatus?: PaymentStatus
  ) => {
    try {
      const body: any = {};
      if (newOrderStatus) body.order_status = newOrderStatus;
      if (newPaymentStatus) body.payment_status = newPaymentStatus;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchOrders(true);
      }
    } catch (err) {
      console.error('Quick transition failed:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setModalOrderStatus(order.order_status);
    setModalPaymentStatus(order.payment_status);
    setModalInternalNotes(order.internal_notes || '');
    setModalCancelReason(order.cancellation_reason || '');
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: modalOrderStatus,
          payment_status: modalPaymentStatus,
          internal_notes: modalInternalNotes,
          cancellation_reason: modalCancelReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateSuccess(true);
        setSelectedOrder(data.data);
        // Refresh table list
        fetchOrders();
        setTimeout(() => setUpdateSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyWa = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'No. Pesanan',
      'Tanggal Dibuat',
      'Nama Pelanggan',
      'WhatsApp',
      'Tipe Order',
      'Alamat Pengiriman',
      'Jadwal Tanggal',
      'Slot Waktu',
      'Total Biaya',
      'Status Pesanan',
      'Status Pembayaran',
      'Catatan Pelanggan',
      'Catatan Internal',
    ];

    const rows = orders.map((o) => [
      `"${o.order_number}"`,
      `"${o.created_at}"`,
      `"${o.customer_name}"`,
      `"${o.customer_whatsapp}"`,
      `"${o.order_type}"`,
      `"${(o.delivery_address || '').replace(/"/g, '""')}"`,
      `"${o.fulfillment_date}"`,
      `"${o.fulfillment_time_slot}"`,
      `"${o.total_amount}"`,
      `"${o.order_status}"`,
      `"${o.payment_status}"`,
      `"${(o.customer_notes || '').replace(/"/g, '""')}"`,
      `"${(o.internal_notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pesanan_bakery_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Transaksi & Operasional
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-800">
            Pengelolaan Pesanan Pelanggan
          </h1>
          <p className="text-xs text-espresso-900/70 mt-1 font-light">
            Perbarui status pesanan, verifikasi pembayaran manual, dan koordinasikan dengan pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsLiveSync(!isLiveSync)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
              isLiveSync
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-oat-300 text-espresso-900/60 hover:bg-oat-100'
            }`}
            title="Sinkronisasi antrean dapur real-time"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveSync ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span>{isLiveSync ? '🟢 Live Kitchen (10s)' : '⚪ Live Kitchen (Off)'}</span>
          </button>

          <Link
            href="/admin/produksi"
            className="px-4 py-2.5 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <ChefHat className="w-4 h-4 text-caramel-400" />
            <span>Lembar Produksi Dapur</span>
          </Link>

          <button
            onClick={handleExportCSV}
            disabled={orders.length === 0}
            className="px-4 py-2.5 rounded-xl border border-oat-300 bg-white hover:bg-oat-100 text-cocoa-800 text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-caramel-600" />
            <span>Ekspor CSV ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-oat-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor pesanan, nama pemesan, atau nomor WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-xs focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-oat-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-espresso-900/70 mb-1">
              Status Pesanan:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-oat-300 bg-white font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Dikonfirmasi">Dikonfirmasi</option>
              <option value="Diproses">Diproses</option>
              <option value="Siap Diambil/Dikirim">Siap Diambil/Dikirim</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-espresso-900/70 mb-1">
              Status Pembayaran:
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-oat-300 bg-white font-medium"
            >
              <option value="all">Semua Pembayaran</option>
              <option value="Belum Dibayar">Belum Dibayar</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Dibayar">Dibayar</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-espresso-900/70 mb-1">
              Dari Tanggal:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-oat-300 bg-white text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-espresso-900/70 mb-1">
              Sampai Tanggal:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-oat-300 bg-white text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-3xl border border-oat-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-espresso-900/60 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-caramel-600" />
            <span>Memuat data pesanan...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-10 h-10 text-espresso-900/30 mx-auto" />
            <h3 className="font-serif text-base font-bold text-cocoa-800">
              Tidak Ada Pesanan Ditemukan
            </h3>
            <p className="text-xs text-espresso-900/60 max-w-sm mx-auto">
              Tidak ada catatan pesanan yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-oat-100/50 border-b border-oat-200 text-espresso-900/70 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">No. Pesanan</th>
                    <th className="py-3.5 px-4">Pelanggan</th>
                    <th className="py-3.5 px-4">Metode & Jadwal</th>
                    <th className="py-3.5 px-4">Menu & Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status Pesanan</th>
                    <th className="py-3.5 px-4">Pembayaran</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-oat-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-cocoa-900">
                        {o.order_number}
                        <span className="block text-[10px] text-espresso-900/50 font-normal">
                          {formatIndonesianDateTime(o.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-cocoa-800 block">
                          {o.customer_name}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-espresso-900/60 mt-0.5">
                          <span>{o.customer_whatsapp}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-cocoa-800 capitalize block">
                          {o.order_type === 'delivery' ? 'Pengiriman' : 'Ambil di Toko'}
                        </span>
                        <span className="text-[11px] text-espresso-900/70 block">
                          {o.fulfillment_date} ({o.fulfillment_time_slot})
                        </span>
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate text-[11px] text-espresso-900/80">
                        {o.items?.map((it) => `${it.product_name} (${it.quantity})`).join(', ') || '-'}
                      </td>
                      <td className="py-4 px-4 font-serif font-bold text-cocoa-900">
                        {formatRupiah(o.total_amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            o.order_status === 'Baru'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : o.order_status === 'Diproses'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : o.order_status === 'Siap Diambil/Dikirim'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : o.order_status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : o.order_status === 'Dibatalkan'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : 'bg-oat-200 text-cocoa-800 border-oat-300'
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            o.payment_status === 'Dibayar'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-cream-200 text-cocoa-800 border-oat-300'
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {(o.order_status === 'Baru' || o.order_status === 'Menunggu Konfirmasi') && (
                            <button
                              onClick={() => handleQuickTransition(o.id, 'Diproses')}
                              className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] transition-colors shadow-xs"
                              title="Mulai produksi di dapur"
                            >
                              🍳 Dapur
                            </button>
                          )}
                          {(o.order_status === 'Diproses' || o.order_status === 'Dikonfirmasi') && (
                            <button
                              onClick={() => handleQuickTransition(o.id, 'Siap Diambil/Dikirim')}
                              className="px-2 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[10px] transition-colors shadow-xs"
                              title="Selesai baking, siap kirim/ambil"
                            >
                              📦 Siap
                            </button>
                          )}
                          {o.order_status === 'Siap Diambil/Dikirim' && (
                            <button
                              onClick={() => handleQuickTransition(o.id, 'Selesai')}
                              className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors shadow-xs"
                              title="Tandai pesanan selesai"
                            >
                              ✅ Selesai
                            </button>
                          )}
                          {o.payment_status !== 'Dibayar' && (
                            <button
                              onClick={() => handleQuickTransition(o.id, undefined, 'Dibayar')}
                              className="px-2 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[10px] transition-colors shadow-xs"
                              title="Verifikasi lunas"
                            >
                              💳 Lunas
                            </button>
                          )}
                          <button
                            onClick={() => openDetailModal(o)}
                            className="px-2.5 py-1 rounded-md bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-[11px] transition-colors"
                          >
                            Kelola
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-oat-100">
              {orders.map((o) => (
                <div key={o.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-cocoa-900 block">
                        {o.order_number}
                      </span>
                      <span className="text-xs font-bold text-cocoa-800">
                        {o.customer_name} ({o.customer_whatsapp})
                      </span>
                    </div>
                    <span className="font-serif font-bold text-sm text-cocoa-900">
                      {formatRupiah(o.total_amount)}
                    </span>
                  </div>

                  <div className="text-xs text-espresso-900/70 flex flex-wrap gap-x-4 gap-y-1">
                    <span>{o.order_type === 'delivery' ? 'Kirim' : 'Ambil di Toko'}</span>
                    <span>•</span>
                    <span>{o.fulfillment_date}</span>
                    <span>•</span>
                    <span>{o.fulfillment_time_slot}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.order_status === 'Baru'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : o.order_status === 'Diproses'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : o.order_status === 'Siap Diambil/Dikirim'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : o.order_status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : o.order_status === 'Dibatalkan'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-oat-200 text-cocoa-800 border-oat-300'
                        }`}
                      >
                        {o.order_status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.payment_status === 'Dibayar'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-cream-200 text-cocoa-800 border-oat-300'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(o.order_status === 'Baru' || o.order_status === 'Menunggu Konfirmasi') && (
                        <button
                          onClick={() => handleQuickTransition(o.id, 'Diproses')}
                          className="px-2 py-1 rounded-md bg-blue-600 text-white font-semibold text-[10px]"
                        >
                          🍳 Dapur
                        </button>
                      )}
                      {(o.order_status === 'Diproses' || o.order_status === 'Dikonfirmasi') && (
                        <button
                          onClick={() => handleQuickTransition(o.id, 'Siap Diambil/Dikirim')}
                          className="px-2 py-1 rounded-md bg-purple-600 text-white font-semibold text-[10px]"
                        >
                          📦 Siap
                        </button>
                      )}
                      {o.order_status === 'Siap Diambil/Dikirim' && (
                        <button
                          onClick={() => handleQuickTransition(o.id, 'Selesai')}
                          className="px-2 py-1 rounded-md bg-emerald-600 text-white font-semibold text-[10px]"
                        >
                          ✅ Selesai
                        </button>
                      )}
                      <button
                        onClick={() => openDetailModal(o)}
                        className="px-3 py-1.5 rounded-lg bg-cocoa-800 text-cream-100 font-semibold text-xs"
                      >
                        Kelola Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* DETAIL & STATUS MANAGEMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-50 rounded-3xl max-w-2xl w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn my-6">
            {/* Modal Header */}
            <div className="p-5 border-b border-oat-200 flex items-center justify-between bg-cocoa-800 text-cream-100">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-caramel-300 block uppercase">
                  Detail Pesanan
                </span>
                <h2 className="font-serif text-xl font-bold">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-cream-100/70 hover:text-cream-100 hover:bg-cocoa-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {updateSuccess && (
                <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Status dan catatan pesanan berhasil diperbarui!</span>
                </div>
              )}

              {/* Customer Contact & Quick Actions */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-espresso-900/60 uppercase block">
                    Pelanggan
                  </span>
                  <span className="font-serif font-bold text-base text-cocoa-800 block">
                    {selectedOrder.customer_name}
                  </span>
                  <span className="text-xs text-espresso-900/70">
                    WhatsApp: {selectedOrder.customer_whatsapp}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* WhatsApp Quick Chat */}
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(selectedOrder.customer_whatsapp)}?text=${encodeURIComponent(
                      `Halo ${selectedOrder.customer_name}, kami dari tim Aura Bakery ingin mengonfirmasi pesanan #${selectedOrder.order_number}...`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#20BE5C] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat WhatsApp</span>
                  </a>

                  {/* Copy WhatsApp */}
                  <button
                    onClick={() => handleCopyWa(selectedOrder.customer_whatsapp)}
                    className="p-2 rounded-xl border border-oat-300 hover:bg-oat-100 text-cocoa-800 text-xs"
                    title="Salin Nomor WhatsApp"
                  >
                    {copiedWa ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Schedule & Fulfillment Details */}
              <div className="p-4 rounded-2xl bg-oat-100/70 border border-oat-200 space-y-2 text-xs text-cocoa-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
                  <span>
                    <strong>Tanggal Diinginkan:</strong> {formatIndonesianDate(selectedOrder.fulfillment_date)} ({selectedOrder.fulfillment_time_slot})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-caramel-600 shrink-0" />
                  <span>
                    <strong>Metode:</strong>{' '}
                    {selectedOrder.order_type === 'delivery'
                      ? `Pengiriman: ${selectedOrder.delivery_address}`
                      : 'Ambil di Toko (Pickup Counter)'}
                  </span>
                </div>
                {selectedOrder.customer_notes && (
                  <div className="p-2.5 rounded-xl bg-white border border-oat-200 mt-2">
                    <span className="font-bold block text-cocoa-800">Catatan dari Pelanggan:</span>
                    <span className="text-espresso-900/80">{selectedOrder.customer_notes}</span>
                  </div>
                )}
              </div>

              {/* Items List Snapshot */}
              <div className="space-y-2">
                <h4 className="font-serif text-sm font-bold text-cocoa-800">
                  Rincian Item (Snapshot Harga Saat Pesanan Dibuat)
                </h4>
                <div className="divide-y divide-oat-200 border-y border-oat-200 py-1 text-xs">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-cocoa-800">{it.product_name}</span>
                        <span className="text-espresso-900/60 block text-[11px]">
                          Varian: {it.variant_name} — {formatRupiah(it.unit_price)} x {it.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-cocoa-900">
                        {formatRupiah(it.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex justify-between text-espresso-900/70">
                    <span>Subtotal Menu</span>
                    <span>{formatRupiah(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-espresso-900/70">
                    <span>Ongkos Kirim</span>
                    <span>{formatRupiah(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between font-serif text-sm font-bold text-cocoa-800 pt-1 border-t border-oat-200">
                    <span>Total Transaksi</span>
                    <span>{formatRupiah(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Status Updater Form */}
              <form onSubmit={handleUpdateStatus} className="p-5 rounded-2xl bg-white border border-oat-200 space-y-4">
                <h4 className="font-serif text-sm font-bold text-cocoa-800">
                  Perbarui Status & Catatan Internal Toko
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-espresso-900 mb-1">
                      Status Pesanan:
                    </label>
                    <select
                      value={modalOrderStatus}
                      onChange={(e) => setModalOrderStatus(e.target.value as OrderStatus)}
                      className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50 font-semibold text-cocoa-800"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                      <option value="Dikonfirmasi">Dikonfirmasi</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Siap Diambil/Dikirim">Siap Diambil/Dikirim</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-espresso-900 mb-1">
                      Status Pembayaran:
                    </label>
                    <select
                      value={modalPaymentStatus}
                      onChange={(e) => setModalPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50 font-semibold text-cocoa-800"
                    >
                      <option value="Belum Dibayar">Belum Dibayar</option>
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Dibayar">Dibayar (Lunas Terverifikasi)</option>
                      <option value="Dikembalikan">Dikembalikan</option>
                    </select>
                  </div>
                </div>

                {modalOrderStatus === 'Dibatalkan' && (
                  <div>
                    <label className="block text-xs font-bold text-red-700 mb-1">
                      Alasan Pembatalan Pesanan:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Stok bahan habis mendadak, permintaan pelanggan..."
                      value={modalCancelReason}
                      onChange={(e) => setModalCancelReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-red-300 bg-red-50 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-espresso-900 mb-1">
                    Catatan Internal Admin (Tidak terlihat oleh pembeli):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bukti transfer BCA sudah dicek di m-banking, packaging pita emas..."
                    value={modalInternalNotes}
                    onChange={(e) => setModalInternalNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl border border-oat-300 text-xs text-cocoa-800 hover:bg-oat-100"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan Perubahan</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
