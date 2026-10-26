'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Truck,
  Store,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Lock,
  Gift,
  QrCode,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { BusinessSettings } from '@/types';
import PaymentGatewayModal from '@/components/PaymentGatewayModal';

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

  const { t, formatMoney, language } = useLanguage();

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');

  // Different Recipient / Surprise Gift (CHK-07, CHK-08)
  const [isDifferentRecipient, setIsDifferentRecipient] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isSurprise, setIsSurprise] = useState(false);
  const [giftCardMessage, setGiftCardMessage] = useState('');

  // Fulfillment Details
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryCity, setDeliveryCity] = useState('Jakarta Selatan');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('11.00 - 13.00');

  // Allergen Agreement (CHK-15, F-21)
  const [confirmedAllergens, setConfirmedAllergens] = useState(false);

  // Payment Selection
  const [paymentMethodId, setPaymentMethodId] = useState('gateway_qris');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

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

  // Pre-fill logged in customer profile if available
  useEffect(() => {
    async function loadCustomerProfile() {
      try {
        const res = await fetch('/api/customer/session');
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomerName((prev) => prev || data.customer.name || '');
          setCustomerWhatsapp((prev) => prev || data.customer.phone || '');
          setDeliveryAddress((prev) => prev || data.customer.address || '');
        }
      } catch {
        // Guest user checkout continues normally
      }
    }
    if (isCheckoutOpen) {
      loadCustomerProfile();
    }
  }, [isCheckoutOpen]);

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

  const validateForm = () => {
    setErrorMsg(null);
    if (!customerName.trim()) {
      setErrorMsg('Nama lengkap pemesan wajib diisi.');
      return false;
    }
    if (!customerWhatsapp.trim()) {
      setErrorMsg('Nomor WhatsApp aktif wajib diisi.');
      return false;
    }
    if (isDifferentRecipient) {
      if (!recipientName.trim()) {
        setErrorMsg('Nama penerima hadiah wajib diisi.');
        return false;
      }
      if (!recipientPhone.trim()) {
        setErrorMsg('Nomor WhatsApp penerima hadiah wajib diisi.');
        return false;
      }
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Alamat pengiriman lengkap wajib diisi untuk opsi Delivery.');
      return false;
    }
    if (!fulfillmentDate) {
      setErrorMsg('Tanggal pesanan wajib dipilih.');
      return false;
    }
    if (!confirmedAllergens) {
      setErrorMsg('Silakan centang persetujuan informasi bahan & alergen sebelum melanjutkan.');
      return false;
    }
    return true;
  };

  const executeOrderSubmission = async (
    methodId: string,
    gatewayRef?: string,
    methodDetails?: string
  ) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Idempotency Key (CHK-17)
      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const fullAddress = orderType === 'delivery'
        ? `${deliveryAddress.trim()}, Kec. ${deliveryDistrict || '-'}, ${deliveryCity}${deliveryNotes ? ` (Patokan: ${deliveryNotes})` : ''}`
        : '';

      const compositeNotes = [
        customerNotes ? `Catatan: ${customerNotes}` : null,
        isDifferentRecipient ? `Hadiah untuk: ${recipientName} (${recipientPhone})${isSurprise ? ' [KEJUTAN - Sembunyikan Harga]' : ''}` : null,
        giftCardMessage ? `Kartu Ucapan: "${giftCardMessage}"` : null,
        gatewayRef ? `Ref Pembayaran: ${gatewayRef} (${methodDetails || 'Online'})` : null,
      ].filter(Boolean).join(' | ');

      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        order_type: orderType,
        delivery_address: fullAddress,
        fulfillment_date: fulfillmentDate,
        fulfillment_time_slot: timeSlot,
        customer_notes: compositeNotes,
        payment_method_id: methodId,
        payment_status: gatewayRef ? 'Dibayar' : 'Belum Dibayar',
        idempotency_key: idempotencyKey,
        items: items.map((i) => ({
          product_id: i.product.id,
          variant_id: i.selectedVariant.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan.');
      }

      // Order created successfully!
      clearCart();
      closeCheckout();
      setIsGatewayOpen(false);

      const returnedOrder = {
        ...data.order,
        transaction_id: gatewayRef || null,
        payment_status: gatewayRef ? 'Dibayar' : data.order.payment_status,
      };

      setCompletedOrder(returnedOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pesanan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethodId === 'gateway_qris') {
      setIsGatewayOpen(true);
    } else {
      executeOrderSubmission(paymentMethodId);
    }
  };

  const handleGatewaySuccess = (transactionRef: string, methodDetails: string) => {
    executeOrderSubmission(paymentMethodId, transactionRef, methodDetails);
  };

  return (
    <>
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
                  {t.checkout.title}
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
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Customer Details */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  1. Informasi Pemesan
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1">
                    Nama Lengkap Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sinta Maharani"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1">
                    Nomor WhatsApp Pemesan *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <span className="text-[11px] text-espresso-900/60 block mt-1">
                    Konfirmasi pesanan dan tautan resi digital akan dikirimkan ke nomor ini.
                  </span>
                </div>

                {/* Recipient / Surprise Gift Option (CHK-07, CHK-08) */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-cocoa-900 select-none bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                    <input
                      type="checkbox"
                      checked={isDifferentRecipient}
                      onChange={(e) => setIsDifferentRecipient(e.target.checked)}
                      className="rounded text-caramel-600 focus:ring-caramel-500 border-oat-300"
                    />
                    <Gift className="w-4 h-4 text-caramel-600 shrink-0" />
                    <span>Kirim sebagai Hadiah / Penerima Berbeda</span>
                  </label>

                  {isDifferentRecipient && (
                    <div className="p-3.5 bg-white rounded-xl border border-amber-300 space-y-3 mt-2 animate-fadeIn shadow-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                          Nama Penerima Hadiah *
                        </label>
                        <input
                          type="text"
                          required={isDifferentRecipient}
                          placeholder="Nama sahabat / keluarga penerima"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-oat-300 bg-white focus:outline-none focus:ring-1 focus:ring-caramel-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                          Nomor WhatsApp Penerima *
                        </label>
                        <input
                          type="tel"
                          required={isDifferentRecipient}
                          placeholder="08xxxxxxxxxx (untuk kurir mengantar)"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-oat-300 bg-white focus:outline-none focus:ring-1 focus:ring-caramel-500"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-cocoa-900">
                        <input
                          type="checkbox"
                          checked={isSurprise}
                          onChange={(e) => setIsSurprise(e.target.checked)}
                          className="rounded text-caramel-600"
                        />
                        <span>🤫 Kejutan (Sembunyikan harga pada invoice & slip pengantaran)</span>
                      </label>

                      <div>
                        <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                          Pesan Kartu Ucapan (Maks. 150 Karakter):
                        </label>
                        <textarea
                          rows={2}
                          maxLength={150}
                          placeholder="Selamat Ulang Tahun! Semoga bahagia dan sehat selalu."
                          value={giftCardMessage}
                          onChange={(e) => setGiftCardMessage(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-oat-300 bg-white focus:outline-none focus:ring-1 focus:ring-caramel-500"
                        />
                        <div className="text-[10px] text-espresso-900/50 text-right mt-0.5">
                          {giftCardMessage.length}/150 karakter
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Fulfillment Method (CHK-05, CHK-06) */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  2. Metode Pengambilan / Pengiriman
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
                      <span className="text-xs font-bold text-cocoa-800">Ambil di Toko (Pick-up)</span>
                    </div>
                    <span className="text-[11px] text-espresso-900/70">
                      Gratis · Counter Toko Senopati
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
                      <span className="text-xs font-bold text-cocoa-800">Kurir Pengantaran</span>
                    </div>
                    <span className="text-[11px] text-espresso-900/70">
                      {isFreeDelivery ? 'Gratis Ongkir' : formatMoney(deliveryFeeBase)}
                    </span>
                  </button>
                </div>

                {orderType === 'delivery' && (
                  <div className="space-y-2.5 pt-2 animate-fadeIn bg-white p-3.5 rounded-xl border border-oat-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                          Kota / Wilayah:
                        </label>
                        <select
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-oat-300 bg-white"
                        >
                          <option value="Jakarta Selatan">Jakarta Selatan</option>
                          <option value="Jakarta Pusat">Jakarta Pusat</option>
                          <option value="Jakarta Barat">Jakarta Barat</option>
                          <option value="Jakarta Timur">Jakarta Timur</option>
                          <option value="Jakarta Utara">Jakarta Utara</option>
                          <option value="Tangerang Selatan">Tangerang Selatan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                          Kecamatan & Kode Pos:
                        </label>
                        <input
                          type="text"
                          placeholder="Cth: Kebayoran Baru 12190"
                          value={deliveryDistrict}
                          onChange={(e) => setDeliveryDistrict(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-oat-300 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                        Alamat Lengkap Jalan, No Rumah/Kantor *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Nama jalan, nomor rumah, RT/RW, nama komplek/gedung kantor"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-oat-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-caramel-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                        Patokan Pengantaran Kurir (Opsional):
                      </label>
                      <input
                        type="text"
                        placeholder="Cth: Pagar hitam seberang minimarket, titip di pos sekuriti"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-oat-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Schedule & Time Slot (OPS-01, BR-01) */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  3. Tanggal & Slot Waktu (WIB)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-caramel-600" />
                      <span>Tanggal Dibutuhkan *</span>
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
                      Lead time minimal: {maxPreorderDays} hari. Cutoff: 15.00 WIB.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-caramel-600" />
                      <span>Slot Waktu Pengantaran/Pickup *</span>
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

              {/* 4. Payment Method (D-01, D-04, PAY-02) */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  4. Metode Pembayaran Resmi
                </h3>

                <div className="space-y-2">
                  {/* Option 1: QRIS Instan */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethodId === 'gateway_qris'
                        ? 'border-caramel-500 bg-caramel-50/70 ring-2 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="gateway_qris"
                      checked={paymentMethodId === 'gateway_qris'}
                      onChange={() => setPaymentMethodId('gateway_qris')}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cocoa-900 flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-caramel-600" />
                          <span>QRIS Instan (Semua e-Wallet & m-Banking)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-espresso-900/70">
                        Scan otomatis via BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, Dana.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Transfer Bank BCA */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethodId === 'bank_bca'
                        ? 'border-caramel-500 bg-caramel-50/40 ring-1 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_bca"
                      checked={paymentMethodId === 'bank_bca'}
                      onChange={() => setPaymentMethodId('bank_bca')}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-blue-700" />
                        <span>Transfer Bank BCA (1234-5678-90)</span>
                      </span>
                      <span className="text-[11px] text-espresso-900/70 block mt-0.5">
                        a/n Aura Artisan Bakery & Catering
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Transfer Mandiri */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethodId === 'bank_mandiri'
                        ? 'border-caramel-500 bg-caramel-50/40 ring-1 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_mandiri"
                      checked={paymentMethodId === 'bank_mandiri'}
                      onChange={() => setPaymentMethodId('bank_mandiri')}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-amber-700" />
                        <span>Transfer Bank Mandiri (987-654-321-0123)</span>
                      </span>
                      <span className="text-[11px] text-espresso-900/70 block mt-0.5">
                        a/n Aura Artisan Bakery & Catering
                      </span>
                    </div>
                  </label>

                  {/* Option 4: Bayar di Counter */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethodId === 'pickup_cash'
                        ? 'border-caramel-500 bg-caramel-50/40 ring-1 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="pickup_cash"
                      checked={paymentMethodId === 'pickup_cash'}
                      onChange={() => setPaymentMethodId('pickup_cash')}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        Bayar saat Pengambilan di Counter Toko
                      </span>
                      <span className="text-[11px] text-espresso-900/70 block mt-0.5">
                        Khusus metode Pick-up di Toko (Cash / Debit / QRIS EDC).
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. Allergen & Policy Agreement (CHK-15, F-21) */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-cocoa-900 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                  <input
                    type="checkbox"
                    required
                    checked={confirmedAllergens}
                    onChange={(e) => setConfirmedAllergens(e.target.checked)}
                    className="mt-0.5 rounded text-caramel-600 focus:ring-caramel-500 border-oat-300"
                  />
                  <span>
                    Saya telah membaca informasi bahan, petunjuk alergen & menyetujui kebijakan pemesanan dan pembatalan Aura Bakery.
                  </span>
                </label>
              </div>

              {/* Order Cost Summary */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-2.5 shadow-sm">
                <div className="flex justify-between text-xs text-espresso-900/70">
                  <span>
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)
                  </span>
                  <span className="font-semibold text-cocoa-800">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-espresso-900/70">
                  <span>Biaya Pengantaran</span>
                  <span className="font-semibold text-cocoa-800">
                    {orderType === 'delivery'
                      ? isFreeDelivery
                        ? 'Gratis Ongkir'
                        : formatMoney(deliveryFeeBase)
                      : 'Gratis (Pick-up)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-oat-100 flex justify-between items-center text-sm">
                  <span className="font-serif font-bold text-cocoa-800">Total Pembayaran:</span>
                  <span className="font-serif text-lg font-bold text-cocoa-900">
                    {formatMoney(totalAmount)}
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
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : paymentMethodId === 'gateway_qris' ? (
                    <>
                      <QrCode className="w-5 h-5 text-caramel-400" />
                      <span>Lanjut Pembayaran QRIS ({formatMoney(totalAmount)})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-caramel-400" />
                      <span>Konfirmasi & Buat Pesanan</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-espresso-900/60 mt-2.5">
                  <Lock className="w-3.5 h-3.5 text-sage-600" />
                  <span>Transaksi Terlindungi & Terverifikasi Langsung di Sistem Toko</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* QRIS & Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={totalAmount}
        customerName={customerName}
        orderNumber={`ORD-${Math.floor(1000 + Math.random() * 9000)}`}
        onPaymentSuccess={handleGatewaySuccess}
      />
    </>
  );
}
