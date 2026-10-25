'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Calendar,
  Truck,
  ExternalLink,
  Save,
  Sparkles,
  ChevronRight,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import { Customer, Order } from '@/types';
import { formatRupiah, formatIndonesianDate, formatIndonesianDateTime } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { formatMoney } = useLanguage();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadAccountData() {
      try {
        setLoading(true);
        // Check session
        const sessRes = await fetch('/api/customer/session');
        const sessData = await sessRes.json();

        if (!sessRes.ok || !sessData.success || !sessData.customer) {
          router.push('/login');
          return;
        }

        setCustomer(sessData.customer);
        setName(sessData.customer.name);
        setPhone(sessData.customer.phone);
        setAddress(sessData.customer.address || '');

        // Fetch orders
        const ordersRes = await fetch('/api/customer/orders');
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        console.error('Failed to load customer profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileMessage({ type: 'error', text: data.error || 'Gagal menyimpan perubahan.' });
        return;
      }

      setCustomer(data.customer);
      setProfileMessage({ type: 'success', text: 'Profil dan alamat berhasil diperbarui.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Terjadi kendala jaringan saat menyimpan.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Baru':
      case 'Menunggu Konfirmasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Diproses':
      case 'Dikonfirmasi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Siap Diambil/Dikirim':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Selesai':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-caramel-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-cocoa-800">Memuat Akun Pelanggan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-cocoa-800 via-cocoa-900 to-espresso-950 rounded-3xl p-6 sm:p-8 text-cream-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-caramel-500 text-cream-100 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">
                  {customer.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-caramel-500/30 text-caramel-300 text-[11px] font-semibold border border-caramel-400/30">
                  <Sparkles className="w-3 h-3" />
                  <span>Artisan Member</span>
                </span>
              </div>
              <p className="text-xs text-cream-200/80 mt-1 flex items-center gap-3">
                <span>{customer.email}</span>
                <span>•</span>
                <span>+{customer.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <Link
              href="/produk"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-caramel-500 hover:bg-caramel-600 text-cream-100 text-xs font-semibold text-center transition-colors shadow-sm"
            >
              Pesan Menu Baru
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cream-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/15"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-oat-300 gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-caramel-600 text-cocoa-900'
                : 'border-transparent text-espresso-900/60 hover:text-cocoa-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesanan Saya ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-caramel-600 text-cocoa-900'
                : 'border-transparent text-espresso-900/60 hover:text-cocoa-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Alamat Pengiriman</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-oat-200 space-y-4">
                <div className="w-16 h-16 rounded-full bg-oat-100 text-caramel-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cocoa-800">
                  Belum Ada Riwayat Pesanan
                </h3>
                <p className="text-xs text-espresso-900/70 max-w-md mx-auto">
                  Pilihlah hidangan artisan fresh kami untuk hari spesial Anda atau nikmati croissant hangat setiap pagi.
                </p>
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-colors shadow-sm"
                >
                  <span>Mulai Belanja</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-oat-200 shadow-sm hover:border-caramel-400 transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-oat-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-cocoa-900">
                          {ord.order_number}
                        </span>
                        <span className="text-xs text-espresso-900/50">•</span>
                        <span className="text-xs text-espresso-900/70">
                          {formatIndonesianDateTime(ord.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                            ord.order_status
                          )}`}
                        >
                          {ord.order_status}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            ord.payment_status === 'Dibayar'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.payment_status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-espresso-900/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-cocoa-800 block">
                          Tipe Pesanan & Jadwal
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-caramel-600" />
                          <span>
                            {ord.order_type === 'delivery' ? 'Pengiriman' : 'Ambil di Toko'}{' '}
                            ({formatIndonesianDate(ord.fulfillment_date)} • {ord.fulfillment_time_slot})
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-cocoa-800 block">
                          Metode Pembayaran
                        </span>
                        <span className="mt-1 block font-medium">
                          {ord.payment_method_name}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-cocoa-800 block">
                          Total Pembayaran
                        </span>
                        <span className="mt-1 block text-base font-bold text-caramel-700">
                          {formatMoney(ord.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Items snippet */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="bg-cream-50/70 rounded-xl p-3 border border-oat-100 text-xs space-y-1.5">
                        <span className="font-bold text-cocoa-800 block">
                          Rincian Menu ({ord.items.length} item):
                        </span>
                        <div className="space-y-1">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-espresso-900/80">
                              <span>
                                {it.quantity}x {it.product_name} ({it.variant_name})
                              </span>
                              <span className="font-semibold">{formatMoney(it.total_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-xs font-bold text-caramel-700 hover:text-caramel-800 inline-flex items-center gap-1 underline"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Live Tracker & Cetak Struk</span>
                      </button>

                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo Aura Bakery, saya ingin menanyakan status pesanan saya dengan nomor: ${ord.order_number}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cocoa-800 hover:text-caramel-600 font-medium inline-flex items-center gap-1"
                      >
                        <span>Tanya via WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: PROFILE FORM */
          <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-cocoa-800">
                Informasi Pelanggan & Alamat
              </h2>
              <p className="text-xs text-espresso-900/70 mt-1">
                Data ini akan otomatis terisi saat Anda memesan produk di toko kami.
              </p>
            </div>

            {profileMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Alamat Email (Akun)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={customer.email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-200 text-sm bg-oat-100 text-espresso-900/60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp Pemesan
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Alamat Pengiriman Utama
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama jalan, nomor gedung/rumah, kelurahan, kecamatan, patokan..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="py-3 px-6 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Detail / Receipt Modal */}
      {selectedOrder && (
        <OrderConfirmationModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}

      <Footer />
    </div>
  );
}
