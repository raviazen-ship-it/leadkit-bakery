'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
  Package,
  ShieldCheck,
  MessageCircle,
  ChefHat,
  ArrowRight,
  Loader2,
  Gift,
  HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatRupiah, formatIndonesianDate, formatIndonesianDateTime } from '@/lib/utils';
import { Order } from '@/types';

export default function PublicOrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [isRedacted, setIsRedacted] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFoundOrder(null);

    const cleanOrderNumber = orderNumber.trim();
    const cleanPhone = phoneSuffix.trim();

    if (!cleanOrderNumber) {
      setErrorMsg('Harap masukkan nomor pesanan Anda (contoh: ORD-20261027-001).');
      return;
    }

    if (cleanPhone.length < 4) {
      setErrorMsg('Harap masukkan minimal 4 digit terakhir nomor WhatsApp pemesan.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: cleanOrderNumber,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pesanan tidak ditemukan. Periksa kembali nomor pesanan dan nomor telepon Anda.');
      }

      setFoundOrder(data.order);
      setIsRedacted(Boolean(data.is_redacted));
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'Baru':
      case 'Menunggu Konfirmasi':
        return 1;
      case 'Dikonfirmasi':
        return 2;
      case 'Diproses':
        return 3;
      case 'Siap Diambil/Dikirim':
        return 4;
      case 'Selesai':
        return 5;
      case 'Dibatalkan':
        return -1;
      default:
        return 1;
    }
  };

  const steps = [
    { title: 'Pesanan Diterima', desc: 'Menunggu antrean oven' },
    { title: 'Dikonfirmasi', desc: 'Bahan disiapkan' },
    { title: 'Diproses Dapur', desc: 'Slow fermentation & baking' },
    { title: 'Siap / Dikirim', desc: 'Packing higienis & kurir' },
    { title: 'Selesai', desc: 'Telah diterima' },
  ];

  const currentStep = foundOrder ? getStepProgress(foundOrder.order_status) : 1;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Layanan Pelacakan Mandiri
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-900">
            Lacak Pesanan Aura Bakery
          </h1>
          <p className="text-xs sm:text-sm text-espresso-900/70 font-light leading-relaxed">
            Pantau status persiapan adonan, pemanggangan artisan, dan estimasi waktu pengiriman pesanan Anda secara transparan.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-300 shadow-sm max-w-xl mx-auto">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-espresso-900 mb-1.5">
                Nomor Pesanan *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: ORD-20261027-001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 uppercase"
                />
                <Package className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3" />
              </div>
              <span className="text-[11px] text-espresso-900/60 block mt-1">
                Tercantum di tanda terima WhatsApp atau struk pemesanan Anda.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-espresso-900 mb-1.5">
                4 Digit Terakhir Nomor WhatsApp *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Contoh: 7890"
                value={phoneSuffix}
                onChange={(e) => setPhoneSuffix(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-oat-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
              />
              <span className="text-[11px] text-espresso-900/60 block mt-1">
                Untuk melindungi privasi data pesanan Anda dari akses pihak lain.
              </span>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Antrean Dapur...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lacak Pesanan Saya</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {foundOrder && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-300 shadow-md space-y-6 animate-fadeIn">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-oat-200">
              <div>
                <span className="text-[10px] font-bold text-caramel-600 uppercase tracking-widest block">
                  Detail Status Pesanan
                </span>
                <h2 className="font-mono text-xl font-bold text-cocoa-900 flex items-center gap-2">
                  <span>{foundOrder.order_number}</span>
                  {foundOrder.order_type === 'delivery' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-sans font-bold flex items-center gap-1 border border-blue-200">
                      <Truck className="w-3 h-3" /> Delivery
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-sans font-bold flex items-center gap-1 border border-amber-200">
                      <ChefHat className="w-3 h-3" /> Self Pick-up
                    </span>
                  )}
                </h2>
                <span className="text-xs text-espresso-900/60 block mt-0.5">
                  Dipesan pada {formatIndonesianDateTime(foundOrder.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-cream-100 border border-oat-300 text-cocoa-900 text-xs font-bold">
                  Status: {foundOrder.order_status}
                </span>
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    foundOrder.payment_status === 'Dibayar'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {foundOrder.payment_status}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {currentStep > 0 ? (
              <div className="py-4">
                <div className="grid grid-cols-5 gap-2 relative">
                  {steps.map((st, i) => {
                    const stepNum = i + 1;
                    const isPassed = stepNum <= currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                      <div key={i} className="text-center space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-caramel-600 text-white ring-4 ring-caramel-200 scale-110 shadow-sm'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-oat-200 text-espresso-900/40'
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                        </div>
                        <span className="text-[11px] font-bold text-cocoa-900 block leading-tight">
                          {st.title}
                        </span>
                        <span className="text-[9px] text-espresso-900/60 block hidden sm:block">
                          {st.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold block">Pesanan Dibatalkan</span>
                  <span className="text-[11px] text-red-700">
                    Alasan: {foundOrder.cancellation_reason || 'Dibatalkan atas permintaan pemesan atau slot kedaluwarsa.'}
                  </span>
                </div>
              </div>
            )}

            {/* Schedule & Delivery Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream-50 border border-oat-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-700 block">
                  Jadwal Pengambilan / Tiba
                </span>
                <div className="flex items-center gap-2 text-cocoa-900 font-semibold">
                  <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
                  <span>{formatIndonesianDate(foundOrder.fulfillment_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-espresso-900/80">
                  <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                  <span>Slot Waktu: {foundOrder.fulfillment_time_slot} WIB</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-oat-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-700 block">
                  Penerima &amp; Lokasi
                </span>
                <div className="text-cocoa-900 font-semibold">
                  Pemesan: {foundOrder.customer_name} ({foundOrder.customer_whatsapp})
                </div>
                {foundOrder.order_type === 'delivery' && (
                  <div className="flex items-start gap-1.5 text-espresso-900/80">
                    <MapPin className="w-3.5 h-3.5 text-caramel-600 shrink-0 mt-0.5" />
                    <span>{foundOrder.delivery_address}</span>
                  </div>
                )}
                {isRedacted && (
                  <span className="text-[10px] text-espresso-900/60 block italic">
                    * Sebagian nomor telepon dan detail pribadi disamarkan untuk perlindungan privasi publik.
                  </span>
                )}
              </div>
            </div>

            {/* Items Summary */}
            <div className="border border-oat-200 rounded-2xl p-4 bg-white space-y-3">
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-cocoa-900 border-b border-oat-200 pb-2">
                Daftar Hidangan yang Dipesan
              </h3>
              <div className="divide-y divide-oat-100 text-xs">
                {foundOrder.items?.map((it) => (
                  <div key={it.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-cocoa-900 block">{it.product_name}</span>
                      <span className="text-[11px] text-espresso-900/60">
                        {it.variant_name} x {it.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-cocoa-900">
                      {formatRupiah(it.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-oat-200 space-y-1 text-xs">
                <div className="flex justify-between text-espresso-900/70">
                  <span>Subtotal Menu</span>
                  <span>{formatRupiah(foundOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-espresso-900/70">
                  <span>Ongkos Kirim</span>
                  <span>{formatRupiah(foundOrder.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-serif text-sm font-bold text-cocoa-900 pt-1 border-t border-oat-200">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(foundOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/6281234567890?text=Halo%20Aura%20Bakery,%20saya%20ingin%20menanyakan%20status%20pesanan%20${foundOrder.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bantuan Customer Service via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl border border-oat-300 hover:bg-oat-100 text-cocoa-800 font-semibold text-xs transition-colors"
              >
                Cetak Bukti Pesanan
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}