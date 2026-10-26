import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
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
  Gift,
  HelpCircle,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrder, getBusinessSettings } from '@/lib/db/repository';
import { formatRupiah, formatIndonesianDate, formatIndonesianDateTime } from '@/lib/utils';

export const revalidate = 0;

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

export default async function DirectOrderTrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const settings = await getBusinessSettings();

  // Retrieve order by public 128-bit random token or ID
  const order = await getOrder(token);

  if (!order) {
    notFound();
  }

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
    { title: 'Selesai', desc: 'Telah diserahkan' },
  ];

  const currentStep = getStepProgress(order.order_status);
  const waTarget = settings.whatsapp_number.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/pesanan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cocoa-800 hover:text-caramel-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cari Pesanan Lain</span>
          </Link>
        </div>

        {/* Tracking Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-300 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-oat-200">
            <div>
              <span className="text-[10px] font-bold text-caramel-600 uppercase tracking-widest block">
                Pelacakan Pesanan Resmi Aura Bakery
              </span>
              <h1 className="font-mono text-2xl font-bold text-cocoa-900 flex items-center gap-2">
                <span>{order.order_number}</span>
                {order.order_type === 'delivery' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-sans font-bold flex items-center gap-1 border border-blue-200">
                    <Truck className="w-3 h-3" /> Delivery
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-sans font-bold flex items-center gap-1 border border-amber-200">
                    <ChefHat className="w-3 h-3" /> Self Pick-up
                  </span>
                )}
              </h1>
              <span className="text-xs text-espresso-900/60 block mt-0.5">
                Dibuat pada {formatIndonesianDateTime(order.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-cream-100 border border-oat-300 text-cocoa-900 text-xs font-bold">
                Status: {order.order_status}
              </span>
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  order.payment_status === 'Dibayar'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
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
                        className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
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
                  Alasan: {order.cancellation_reason || 'Dibatalkan atas permintaan pemesan atau slot kedaluwarsa.'}
                </span>
              </div>
            </div>
          )}

          {/* Schedule & Fulfillment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-cream-50 border border-oat-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-700 block">
                Jadwal Pengambilan / Tiba
              </span>
              <div className="flex items-center gap-2 text-cocoa-900 font-semibold">
                <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
                <span>{formatIndonesianDate(order.fulfillment_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-espresso-900/80">
                <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                <span>Slot Waktu: {order.fulfillment_time_slot} WIB</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cream-50 border border-oat-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-caramel-700 block">
                Informasi Pemesan &amp; Tujuan
              </span>
              <div className="text-cocoa-900 font-semibold">
                {order.customer_name} ({order.customer_whatsapp})
              </div>
              {order.order_type === 'delivery' ? (
                <div className="flex items-start gap-1.5 text-espresso-900/80">
                  <MapPin className="w-3.5 h-3.5 text-caramel-600 shrink-0 mt-0.5" />
                  <span>{order.delivery_address}</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-espresso-900/80">
                  <MapPin className="w-3.5 h-3.5 text-caramel-600 shrink-0 mt-0.5" />
                  <span>Ambil di Counter Toko: {settings.address}, {settings.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <div className="border border-oat-200 rounded-2xl p-4 bg-white space-y-3">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-cocoa-900 border-b border-oat-200 pb-2">
              Rincian Hidangan
            </h3>
            <div className="divide-y divide-oat-100 text-xs">
              {order.items?.map((it) => (
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
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-900/70">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-serif text-sm font-bold text-cocoa-900 pt-1 border-t border-oat-200">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Actions (ACC-06, ACC-07, ACC-12) */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-oat-200 space-y-3">
            <h4 className="text-xs font-bold text-cocoa-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-caramel-600" />
              <span>Butuh Bantuan atau Perubahan Pesanan?</span>
            </h4>
            <p className="text-xs text-espresso-900/70 leading-relaxed">
              Anda dapat mengajukan perubahan jadwal/alamat pengiriman sebelum pesanan diproses di dapur, atau mengonfirmasi penerimaan hidangan Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href={`https://wa.me/${waTarget}?text=Halo%20Aura%20Bakery,%20saya%20ingin%20mengajukan%20perubahan%20pada%20pesanan%20${order.order_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-caramel-400 hover:bg-caramel-50 text-cocoa-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Ajukan Perubahan Jadwal / Alamat</span>
              </a>

              <a
                href={`https://wa.me/${waTarget}?text=Halo%20Aura%20Bakery,%20pesanan%20${order.order_number}%20telah%20saya%20terima%20dengan%20baik!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-emerald-400 hover:bg-emerald-50 text-emerald-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Konfirmasi Pesanan Diterima</span>
              </a>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${waTarget}?text=Halo%20Aura%20Bakery,%20saya%20ingin%20menanyakan%20status%20pesanan%20${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi CS Toko via WhatsApp</span>
            </a>

            <Link
              href="/produk"
              className="px-6 py-3 rounded-xl border border-oat-300 hover:bg-oat-100 text-cocoa-800 font-semibold text-xs transition-colors text-center"
            >
              Pesan Menu Lainnya
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}