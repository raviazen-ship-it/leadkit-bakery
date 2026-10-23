'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, Truck, Store, Calendar, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah, formatIndonesianDate } from '@/lib/utils';
import { BusinessSettings } from '@/types';

interface CheckoutDrawerProps {
  settings?: BusinessSettings;
}

export default function CheckoutDrawer({ settings }: CheckoutDrawerProps) {
  const {
    items,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    subtotal,
    clearCart,
    setCompletedOrder,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('10.00 - 12.00 WIB');
  const [paymentMethodId, setPaymentMethodId] = useState(
    settings?.payment_methods?.find((p) => p.enabled)?.id || 'bank_bca'
  );

  // Calculate earliest eligible date based on products' pre-order lead time
  const maxPreorderDays = Math.max(
    settings?.min_preorder_days ?? 1,
    ...items.map((i) => i.product.min_preorder_days || 0)
  );

  const calculateMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + maxPreorderDays);
    return d.toISOString().split('T')[0];
  };

  const minDateString = calculateMinDate();
  const [fulfillmentDate, setFulfillmentDate] = useState(minDateString);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  // Delivery fee calculation
  const deliveryFeeBase = settings?.delivery_fee_base ?? 20000;
  const freeThreshold = settings?.free_delivery_threshold ?? 350000;
  const isFreeDelivery = freeThreshold > 0 && subtotal >= freeThreshold;
  const calculatedDeliveryFee = orderType === 'delivery' ? (isFreeDelivery ? 0 : deliveryFeeBase) : 0;
  const totalAmount = subtotal + calculatedDeliveryFee;

  const timeSlots = [
    '09.00 - 11.00 WIB',
    '11.00 - 13.00 WIB',
    '13.00 - 15.00 WIB',
    '15.00 - 17.00 WIB',
    '17.00 - 19.00 WIB',
  ];

  const paymentMethods = settings?.payment_methods?.filter((p) => p.enabled) || [
    { id: 'bank_bca', name: 'Transfer Bank BCA', account_number: '1234567890', account_name: 'Aura Bakery', enabled: true },
    { id: 'pickup_cash', name: 'Bayar saat Pengambilan di Toko', account_number: '', account_name: '', enabled: true },
  ];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap pemesan wajib diisi.');
      return;
    }
    if (!customerWhatsapp.trim()) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Alamat pengiriman lengkap wajib diisi untuk opsi Delivery.');
      return;
    }
    if (!fulfillmentDate) {
      setErrorMsg('Tanggal pesanan wajib dipilih.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        fulfillment_date: fulfillmentDate,
        fulfillment_time_slot: timeSlot,
        customer_notes: customerNotes,
        payment_method_id: paymentMethodId,
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
        throw new Error(data.error || 'Terjadi kesalahan saat memproses pesanan.');
      }

      // Order created successfully!
      clearCart();
      closeCheckout();
      setCompletedOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pesanan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCheckout}
        className="absolute inset-0 bg-espresso-950/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-cream-50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-oat-200 flex items-center justify-between bg-cream-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  closeCheckout();
                  openCart();
                }}
                className="p-1 rounded text-cocoa-800 hover:bg-oat-200 transition-colors mr-1"
                aria-label="Kembali ke keranjang"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-xl font-bold text-cocoa-800">
                Konfirmasi & Checkout
              </h2>
            </div>
            <button
              onClick={closeCheckout}
              aria-label="Tutup Checkout"
              className="p-1.5 rounded-lg text-cocoa-800 hover:bg-oat-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Kontak Pemesan */}
            <div className="space-y-3">
              <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                1. Data Pemesan
              </h3>
              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1">
                  Nama Lengkap Pemesan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                />
                <span className="text-[11px] text-espresso-900/60 block mt-1">
                  Notifikasi rincian pesanan dan status akan dikirimkan ke nomor ini.
                </span>
              </div>
            </div>

            {/* 2. Metode Penyerahan */}
            <div className="space-y-3">
              <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                2. Pilihan Pengambilan / Pengiriman
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    orderType === 'pickup'
                      ? 'border-caramel-500 bg-caramel-50/50 ring-2 ring-caramel-400'
                      : 'border-oat-200 bg-white hover:border-oat-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-caramel-600" />
                    <span className="text-xs font-bold text-cocoa-800">Ambil di Toko</span>
                  </div>
                  <span className="text-[11px] text-espresso-900/70">
                    Gratis / Bebas Biaya Kirim
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    orderType === 'delivery'
                      ? 'border-caramel-500 bg-caramel-50/50 ring-2 ring-caramel-400'
                      : 'border-oat-200 bg-white hover:border-oat-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-caramel-600" />
                    <span className="text-xs font-bold text-cocoa-800">Kirim ke Alamat</span>
                  </div>
                  <span className="text-[11px] text-espresso-900/70">
                    {isFreeDelivery ? 'Gratis Ongkir!' : formatRupiah(deliveryFeeBase)}
                  </span>
                </button>
              </div>

              {orderType === 'delivery' && (
                <div className="space-y-2 pt-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-espresso-900">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan lokasi..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <div className="p-2.5 rounded-lg bg-oat-100 text-[11px] text-cocoa-800/80">
                    📍 Area kirim: {settings?.delivery_areas || 'Jakarta & sekitarnya.'}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Jadwal Tanggal & Waktu */}
            <div className="space-y-3">
              <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                3. Jadwal Pemesanan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-caramel-600" />
                    <span>Tanggal *</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={minDateString}
                    value={fulfillmentDate}
                    onChange={(e) => setFulfillmentDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <span className="text-[10px] text-espresso-900/60 block mt-1">
                    Minimal persiapan: {maxPreorderDays} hari ke depan.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-caramel-600" />
                    <span>Slot Jam *</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Metode Pembayaran */}
            <div className="space-y-3">
              <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                4. Metode Pembayaran
              </h3>

              <div className="space-y-2">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethodId === pm.id
                        ? 'border-caramel-500 bg-caramel-50/40 ring-1 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={pm.id}
                      checked={paymentMethodId === pm.id}
                      onChange={() => setPaymentMethodId(pm.id)}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        {pm.name}
                      </span>
                      {pm.account_number && (
                        <span className="text-[11px] text-espresso-900/70 block mt-0.5">
                          No. Rekening: {pm.account_number} a/n {pm.account_name}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Catatan Tambahan */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-espresso-900">
                Catatan Khusus (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Ucapan pada kartu, pesan lilin/topping, instruksi kurir, alergi..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
              />
            </div>

            {/* Ringkasan Biaya */}
            <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-2.5">
              <div className="flex justify-between text-xs text-espresso-900/70">
                <span>Subtotal Menu ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-semibold text-cocoa-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-espresso-900/70">
                <span>Biaya Pengiriman</span>
                <span className="font-semibold text-cocoa-800">
                  {orderType === 'delivery'
                    ? isFreeDelivery
                      ? 'Gratis'
                      : formatRupiah(deliveryFeeBase)
                    : 'Gratis (Pick-up)'}
                </span>
              </div>
              <div className="pt-2 border-t border-oat-100 flex justify-between items-center text-sm">
                <span className="font-serif font-bold text-cocoa-800">Total Pembayaran</span>
                <span className="font-serif text-lg font-bold text-cocoa-800">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 pb-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-cocoa-800 text-cream-100 font-semibold hover:bg-cocoa-900 transition-all shadow-lg flex items-center justify-center gap-2 focus:ring-2 focus:ring-cocoa-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyimpan Pesanan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-caramel-400" />
                    <span>Kirim Pesanan Sekarang</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-espresso-900/60 mt-2">
                Pesanan Anda akan tersimpan di sistem toko dan dapat dilanjutkan ke WhatsApp.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
