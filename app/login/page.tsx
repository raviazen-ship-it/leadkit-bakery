'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ShoppingBag,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'track'>('login');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Guest Tracking State
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Email atau kata sandi tidak sesuai.');
        return;
      }

      // Successful login -> go to account dashboard
      router.push('/akun');
      router.refresh();
    } catch (err) {
      setLoginError('Terjadi gangguan jaringan. Silakan coba lagi.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTrackGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackLoading(true);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTrackError(data.error || 'Pesanan tidak ditemukan atau nomor WhatsApp tidak sesuai.');
        return;
      }

      setTrackedOrder(data.order);
    } catch (err) {
      setTrackError('Gagal melacak pesanan. Periksa koneksi Anda.');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
              Portal Pelanggan Aura Bakery
            </span>
            <h1 className="font-serif text-3xl font-bold text-cocoa-800">
              {activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Lacak Pesanan Tamu'}
            </h1>
            <p className="text-xs sm:text-sm text-espresso-900/70 font-light">
              {activeTab === 'login'
                ? 'Kelola riwayat pesanan, alamat tersimpan, dan nikmati checkout lebih cepat.'
                : 'Cek status pesanan tanpa akun dengan nomor order dan nomor WhatsApp Anda.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-oat-200/80 rounded-2xl border border-oat-300">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-cocoa-900 shadow-sm'
                  : 'text-espresso-900/70 hover:text-cocoa-900'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('track');
                setTrackError('');
              }}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'track'
                  ? 'bg-white text-cocoa-900 shadow-sm'
                  : 'text-espresso-900/70 hover:text-cocoa-900'
              }`}
            >
              Lacak Pesanan Tamu
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-6">
            {activeTab === 'login' ? (
              /* TAB 1: LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center text-xs text-espresso-900/70 border-t border-oat-100">
                  Belum memiliki akun?{' '}
                  <Link
                    href="/register"
                    className="font-bold text-caramel-700 hover:text-caramel-800 underline"
                  >
                    Daftar Akun Baru Sekarang
                  </Link>
                </div>
              </form>
            ) : (
              /* TAB 2: GUEST TRACKING FORM */
              <form onSubmit={handleTrackGuestOrder} className="space-y-4">
                {trackError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{trackError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Nomor Pesanan
                  </label>
                  <div className="relative">
                    <ShoppingBag className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="Contoh: ORD-20261025-ABCD"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50 uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Pemesan
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-caramel-600 hover:bg-caramel-700 text-cream-100 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {trackLoading ? (
                    <span>Mencari Pesanan...</span>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Lacak Status Pesanan</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center text-xs text-espresso-900/60">
            <Link href="/" className="hover:text-cocoa-900 underline">
              Kembali ke Beranda Toko
            </Link>
          </div>
        </div>
      </main>

      {/* Guest order preview modal */}
      {trackedOrder && (
        <OrderConfirmationModal
          isOpen={Boolean(trackedOrder)}
          onClose={() => setTrackedOrder(null)}
          order={trackedOrder}
        />
      )}

      <Footer />
    </div>
  );
}
