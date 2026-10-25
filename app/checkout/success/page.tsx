import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, Calendar, FileText, ArrowRight, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrder, getBusinessSettings } from '@/lib/db/repository';
import { formatRupiah, formatIndonesianDateTime, formatIndonesianDate } from '@/lib/utils';

export const revalidate = 0;

interface CheckoutSuccessProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessProps) {
  const resolved = await searchParams;
  const orderNumber = resolved?.order;
  const settings = await getBusinessSettings();

  const order = orderNumber ? await getOrder(orderNumber) : null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Pesanan Diterima Dapur
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-900">
            Terima Kasih atas Pesanan Anda!
          </h1>
          <p className="text-xs sm:text-sm text-espresso-900/70 max-w-md mx-auto font-light leading-relaxed">
            Pesanan Anda telah tercatat di antrean dapur Aura Bakery. Tim artisan kami akan memproses pesanan sesuai tanggal dan slot yang Anda pilih.
          </p>

          {order ? (
            <div className="p-5 rounded-2xl bg-cream-50 border border-oat-200 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-oat-200 pb-2">
                <span className="font-mono font-bold text-cocoa-900">{order.order_number}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {order.order_status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-espresso-900/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cocoa-800 block">Jadwal</span>
                  <span>{formatIndonesianDate(order.fulfillment_date)} ({order.fulfillment_time_slot})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-cocoa-800 block">Total</span>
                  <span className="font-bold text-cocoa-900">{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-oat-100 text-xs text-cocoa-800">
              Periksa status lengkap pesanan Anda melalui menu <strong>Akun Pelanggan</strong>.
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/akun"
              className="px-6 py-3 rounded-full bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-xs transition-colors shadow-sm"
            >
              Buka Akun &amp; Lacak Pesanan
            </Link>
            <Link
              href="/produk"
              className="px-6 py-3 rounded-full border border-oat-300 hover:bg-oat-100 text-cocoa-800 font-semibold text-xs transition-colors"
            >
              Kembali ke Menu
            </Link>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
