'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { formatMoney } = useLanguage();

  const freeDeliveryThreshold = 350000;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb */}
        <div className="text-xs text-espresso-900/60 flex items-center gap-1.5">
          <Link href="/" className="hover:text-cocoa-900 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/produk" className="hover:text-cocoa-900 transition-colors">
            Menu
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-cocoa-900">Keranjang Belanja</span>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Pemesanan Anda
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-900">
            Keranjang Belanja ({itemCount} item)
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-oat-200 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-oat-100 text-caramel-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-cocoa-800">
              Keranjang Masih Kosong
            </h2>
            <p className="text-xs text-espresso-900/70 max-w-sm mx-auto">
              Anda belum menambahkan menu artisan ke keranjang. Jelajahi katalog kue, roti, dan hidangan katering kami.
            </p>
            <Link
              href="/produk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-colors shadow-sm"
            >
              <span>Jelajahi Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 cols: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free delivery bar */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cocoa-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-caramel-600" />
                    <span>
                      {isFreeDelivery
                        ? 'Selamat! Pesanan Anda memenuhi syarat Gratis Ongkir (Jabodetabek).'
                        : `Tambah ${formatMoney(freeDeliveryThreshold - subtotal)} lagi untuk Gratis Ongkir!`}
                    </span>
                  </span>
                  <span className="font-bold text-caramel-700">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-oat-200 overflow-hidden">
                  <div
                    className="h-full bg-caramel-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-3xl border border-oat-200 shadow-sm divide-y divide-oat-100 overflow-hidden">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}_${item.selectedVariant.id}_${idx}`} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-oat-100 overflow-hidden shrink-0 border border-oat-200">
                        {item.product.main_image && (
                          <img
                            src={item.product.main_image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <Link
                          href={`/produk/${item.product.slug}`}
                          className="font-serif text-base font-bold text-cocoa-900 hover:text-caramel-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-xs text-caramel-700 block font-medium">
                          Varian: {item.selectedVariant.name}
                        </span>
                        <span className="text-xs text-espresso-900/60 block font-mono">
                          {formatMoney(item.selectedVariant.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-oat-300 rounded-full p-1 bg-cream-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center text-xs font-bold text-cocoa-800"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-cocoa-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.selectedVariant.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center text-xs font-bold text-cocoa-800"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-serif text-sm font-bold text-cocoa-900 min-w-24 text-right">
                        {formatMoney(item.selectedVariant.price * item.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id, item.selectedVariant.id)}
                        className="p-2 text-espresso-900/40 hover:text-red-600 transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 4 cols: Summary & Checkout Button */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-5">
              <h3 className="font-serif text-lg font-bold text-cocoa-900 border-b border-oat-200 pb-3">
                Ringkasan Belanja
              </h3>

              <div className="space-y-2.5 text-xs text-espresso-900/80">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-bold text-cocoa-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimasi Pengiriman</span>
                  <span className="font-bold text-cocoa-900">
                    {isFreeDelivery ? 'GRATIS' : 'Dihitung di checkout'}
                  </span>
                </div>
                <div className="flex justify-between font-serif text-base font-bold text-cocoa-900 pt-3 border-t border-oat-200">
                  <span>Total Sementara</span>
                  <span className="text-caramel-700">{formatMoney(subtotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 px-6 rounded-full bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-xs sm:text-sm text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 text-[11px] text-espresso-900/60 space-y-1.5 border-t border-oat-100">
                <div className="flex items-center gap-1.5 text-sage-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Transaksi Aman &amp; Terverifikasi</span>
                </div>
                <p>Mendukung QRIS, Transfer Bank BCA &amp; Mandiri, serta Gateway Kartu.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
