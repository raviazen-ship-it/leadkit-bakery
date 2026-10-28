'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Store,
  Truck,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentGatewayModal from '@/components/PaymentGatewayModal';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Order } from '@/types';

export default function StandaloneCheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, setCompletedOrder, completedOrder } = useCart();
  const { formatMoney } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('10.00 - 12.00');
  const [paymentMethodId, setPaymentMethodId] = useState('gateway_stripe');

  // Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate earliest eligible date
  const maxPreorderDays = Math.max(1, ...items.map((i) => i.product.min_preorder_days || 0));
  const calculateMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + maxPreorderDays);
    return d.toISOString().split('T')[0];
  };

  const [fulfillmentDate, setFulfillmentDate] = useState(calculateMinDate());

  // Auto-fill logged in customer
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/customer/session');
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomerName((prev) => prev || data.customer.name || '');
          setCustomerWhatsapp((prev) => prev || data.customer.phone || '');
          setDeliveryAddress((prev) => prev || data.customer.address || '');
        }
      } catch {
        // Guest user continues
      }
    }
    loadSession();
  }, []);

  const deliveryFeeBase = 20000;
  const freeThreshold = 350000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const calculatedDeliveryFee = orderType === 'delivery' ? (isFreeDelivery ? 0 : deliveryFeeBase) : 0;
  const totalAmount = subtotal + calculatedDeliveryFee;

  const timeSlots = [
    '09.00 - 11.00',
    '11.00 - 13.00',
    '13.00 - 15.00',
    '15.00 - 17.00',
    '17.00 - 19.00',
  ];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerWhatsapp.trim()) {
      setErrorMsg('Nama dan nomor WhatsApp wajib diisi.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi untuk opsi Delivery.');
      return;
    }

    // If online payment gateway is chosen, open gateway modal
    if (paymentMethodId.startsWith('gateway_')) {
      setIsGatewayOpen(true);
      return;
    }

    // Direct manual transfer
    await processFinalOrder('Belum Dibayar');
  };

  const processFinalOrder = async (
    paymentStatus: 'Belum Dibayar' | 'Dibayar' = 'Belum Dibayar',
    transactionMeta?: any
  ) => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const itemCustomNotes = items
        .filter((i) => i.customNote)
        .map((i) => `[Ucapan ${i.product.name}: "${i.customNote}"]`)
        .join(' ');
      const mergedNotes = [customerNotes?.trim(), itemCustomNotes].filter(Boolean).join(' ');

      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        fulfillment_date: fulfillmentDate,
        fulfillment_time_slot: timeSlot,
        customer_notes: transactionMeta
          ? `${mergedNotes} [SIMULASI_TXN_${transactionMeta.method}_${transactionMeta.ref}]`.trim()
          : mergedNotes,
        payment_method_id: paymentMethodId,
        payment_status: paymentStatus,
        items: items.map((i) => ({
          product_id: i.product.id,
          variant_id: i.selectedVariant.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan.');
      }

      clearCart();
      setIsGatewayOpen(false);
      setCompletedOrder(data.order);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewaySuccess = async (transactionRef: string, methodDetails: string) => {
    await processFinalOrder('Dibayar', { ref: transactionRef, method: methodDetails });
  };

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-100">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-cocoa-900">
            Keranjang Masih Kosong
          </h1>
          <p className="text-xs text-espresso-900/70">
            Silakan pilih menu favorit Anda di katalog sebelum melanjutkan ke checkout.
          </p>
          <Link
            href="/produk"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 shadow-sm"
          >
            <span>Buka Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Simulation Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Demo - data dan transaksi bersifat simulasi.</strong> Jangan memasukkan data pembayaran sensitif atau melakukan transfer nyata.
          </span>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs text-espresso-900/60 flex items-center gap-1.5">
          <Link href="/" className="hover:text-cocoa-900 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/cart" className="hover:text-cocoa-900 transition-colors">
            Keranjang
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-cocoa-900">Checkout &amp; Pembayaran</span>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Tahap Akhir Pemesanan
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-900">
            Checkout Pesanan Artisan
          </h1>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 cols: Form Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-cocoa-900 flex items-center gap-2 border-b border-oat-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center text-xs">
                  1
                </span>
                <span>Informasi Pemesan</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full px-4 py-2.5 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Fulfillment & Schedule */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-cocoa-900 flex items-center gap-2 border-b border-oat-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Metode &amp; Jadwal Pemenuhan</span>
              </h2>

              {/* Pickup vs Delivery radio cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    orderType === 'pickup'
                      ? 'bg-cocoa-800 text-cream-100 border-cocoa-800 shadow-sm'
                      : 'bg-white hover:bg-cream-50 text-cocoa-900 border-oat-300'
                  }`}
                >
                  <Store className="w-5 h-5 mb-2 text-caramel-400" />
                  <span className="font-bold text-xs block">Ambil di Toko</span>
                  <span className="text-[11px] opacity-80 block mt-0.5">Senopati, Jaksel (Gratis)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    orderType === 'delivery'
                      ? 'bg-cocoa-800 text-cream-100 border-cocoa-800 shadow-sm'
                      : 'bg-white hover:bg-cream-50 text-cocoa-900 border-oat-300'
                  }`}
                >
                  <Truck className="w-5 h-5 mb-2 text-caramel-400" />
                  <span className="font-bold text-xs block">Kurir Pengiriman</span>
                  <span className="text-[11px] opacity-80 block mt-0.5">
                    {isFreeDelivery ? 'Gratis Ongkir' : 'Rp 20.000'}
                  </span>
                </button>
              </div>

              {/* Delivery Address if delivery */}
              {orderType === 'delivery' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider">
                    Alamat Lengkap Pengantaran *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah/kantor, lantai/patokan, kelurahan, kecamatan..."
                    className="w-full p-3 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>
              )}

              {/* Date & Time selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Tanggal Diambil / Dikirim *
                  </label>
                  <input
                    type="date"
                    required
                    min={calculateMinDate()}
                    value={fulfillmentDate}
                    onChange={(e) => setFulfillmentDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <span className="text-[10px] text-espresso-900/60 block mt-1">
                    *Min. pre-order {maxPreorderDays} hari sebelumnya
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                    Slot Waktu *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts} WIB
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan untuk Dapur (Opsional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Contoh: Titip di satpam / Lilin angka 25 / Jangan pakai pisau plastik"
                  className="w-full px-4 py-2.5 rounded-xl border border-oat-300 text-xs sm:text-sm bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-cocoa-900 flex items-center gap-2 border-b border-oat-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Pilih Metode Pembayaran</span>
              </h2>

              <div className="space-y-3">
                {/* Gateway option */}
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-oat-300 hover:border-caramel-500 cursor-pointer bg-cream-50/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="gateway_stripe"
                    checked={paymentMethodId === 'gateway_stripe'}
                    onChange={() => setPaymentMethodId('gateway_stripe')}
                    className="mt-1 text-caramel-600 focus:ring-caramel-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-cocoa-900 block">
                      ⚡ Payment Gateway Digital (QRIS, Kartu, Apple Pay, Klarna)
                    </span>
                    <span className="text-xs text-espresso-900/70 block mt-0.5">
                      Verifikasi instan otomatis, aman terenkripsi 256-bit TLS.
                    </span>
                  </div>
                </label>

                {/* Manual transfer options */}
                <label className="flex items-start gap-3 p-4 rounded-2xl border border-oat-300 hover:border-caramel-500 cursor-pointer bg-cream-50/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_bca"
                    checked={paymentMethodId === 'bank_bca'}
                    onChange={() => setPaymentMethodId('bank_bca')}
                    className="mt-1 text-caramel-600 focus:ring-caramel-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-cocoa-900 block">
                      🏦 Transfer Bank Manual (BCA)
                    </span>
                    <span className="text-xs text-espresso-900/70 block mt-0.5">
                      Transfer manual via ATM atau m-Banking tanpa biaya transaksi tambahan.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-2xl border border-oat-300 hover:border-caramel-500 cursor-pointer bg-cream-50/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank_mandiri"
                    checked={paymentMethodId === 'bank_mandiri'}
                    onChange={() => setPaymentMethodId('bank_mandiri')}
                    className="mt-1 text-caramel-600 focus:ring-caramel-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-cocoa-900 block">
                      🏦 Transfer Bank Manual (Mandiri)
                    </span>
                    <span className="text-xs text-espresso-900/70 block mt-0.5">
                      Transfer manual via Mandiri Livin atau ATM langsung.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Order Breakdown & Submit */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-cocoa-900 border-b border-oat-200 pb-3">
              Rincian Pesanan
            </h3>

            {/* Item list */}
            <div className="divide-y divide-oat-100 max-h-64 overflow-y-auto pr-1 text-xs">
              {items.map((it, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-cocoa-900 block">{it.product.name}</span>
                    <span className="text-[11px] text-espresso-900/60 block">
                      {it.selectedVariant.name} &times; {it.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-cocoa-900">
                    {formatMoney(it.selectedVariant.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs border-t border-oat-200 pt-3 text-espresso-900/80">
              <div className="flex justify-between">
                <span>Subtotal Menu</span>
                <span className="font-bold text-cocoa-900">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pengiriman</span>
                <span className="font-bold text-cocoa-900">
                  {orderType === 'pickup'
                    ? 'Gratis (Ambil di Toko)'
                    : isFreeDelivery
                    ? 'GRATIS'
                    : formatMoney(calculatedDeliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-serif text-lg font-bold text-cocoa-900 pt-3 border-t border-oat-200">
                <span>Total Tagihan</span>
                <span className="text-caramel-700">{formatMoney(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Selesaikan &amp; Bayar {formatMoney(totalAmount)}</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-espresso-900/60 text-center space-y-1">
              <p>Dengan memesan, Anda menyetujui kebijakan pre-order Aura Bakery.</p>
            </div>
          </div>
        </form>
      </main>

      {/* Online Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={totalAmount}
        orderNumber={`ORD-${Date.now().toString().slice(-4)}`}
        customerName={customerName}
        onPaymentSuccess={handleGatewaySuccess}
      />

      {/* Confirmation Modal */}
      {completedOrder && (
        <OrderConfirmationModal
          isOpen={Boolean(completedOrder)}
          onClose={() => setCompletedOrder(null)}
          order={completedOrder}
        />
      )}

      <Footer />
    </div>
  );
}
