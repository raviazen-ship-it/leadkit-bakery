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
  CreditCard,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatIndonesianDate } from '@/lib/utils';
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

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [timeSlot, setTimeSlot] = useState('10.00 - 12.00');
  const [paymentMethodId, setPaymentMethodId] = useState('gateway_stripe');

  // Gateway Modal State
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

  // Pre-fill logged in customer profile
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
    '09.00 - 11.00',
    '11.00 - 13.00',
    '13.00 - 15.00',
    '15.00 - 17.00',
    '17.00 - 19.00',
  ];

  const manualMethods = settings?.payment_methods?.filter((p) => p.enabled) || [
    {
      id: 'bank_bca',
      name: 'Bank Transfer (BCA)',
      account_number: '1234567890',
      account_name: 'Aura Bakery',
      enabled: true,
    },
    {
      id: 'pickup_cash',
      name: 'Pay Upon Counter Pickup',
      account_number: '',
      account_name: '',
      enabled: true,
    },
  ];

  const validateForm = () => {
    setErrorMsg(null);
    if (!customerName.trim()) {
      setErrorMsg(language === 'en' ? 'Full name is required.' : 'Nama lengkap pemesan wajib diisi.');
      return false;
    }
    if (!customerWhatsapp.trim()) {
      setErrorMsg(language === 'en' ? 'Phone or WhatsApp number is required.' : 'Nomor WhatsApp aktif wajib diisi.');
      return false;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg(
        language === 'en'
          ? 'Complete delivery address is required for Delivery.'
          : 'Alamat pengiriman lengkap wajib diisi untuk opsi Delivery.'
      );
      return false;
    }
    if (!fulfillmentDate) {
      setErrorMsg(language === 'en' ? 'Fulfillment date is required.' : 'Tanggal pesanan wajib dipilih.');
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
      const notesWithRef = gatewayRef
        ? `${customerNotes ? customerNotes + ' | ' : ''}Payment: ${gatewayRef} (${methodDetails || 'Card'})`
        : customerNotes;

      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        fulfillment_date: fulfillmentDate,
        fulfillment_time_slot: timeSlot,
        customer_notes: notesWithRef,
        payment_method_id: methodId,
        payment_status: gatewayRef ? 'Dibayar' : 'Belum Dibayar',
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
        throw new Error(data.error || 'Failed to submit order.');
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
      setErrorMsg(err.message || 'Failed to process order. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethodId === 'gateway_stripe') {
      setIsGatewayOpen(true);
    } else {
      executeOrderSubmission(paymentMethodId);
    }
  };

  const handleGatewaySuccess = (transactionRef: string, methodDetails: string) => {
    executeOrderSubmission('gateway_stripe', transactionRef, methodDetails);
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
                  aria-label="Back to cart"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="font-serif text-xl font-bold text-cocoa-800">
                  {t.checkout.title}
                </h2>
              </div>
              <button
                onClick={closeCheckout}
                aria-label="Close Checkout"
                className="p-1.5 rounded-lg text-cocoa-800 hover:bg-oat-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Customer Details */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  {t.checkout.section1}
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1">
                    {t.checkout.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.checkout.fullNamePlaceholder}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1">
                    {t.checkout.whatsapp}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.checkout.whatsappPlaceholder}
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <span className="text-[11px] text-espresso-900/60 block mt-1">
                    {t.checkout.whatsappNotice}
                  </span>
                </div>
              </div>

              {/* 2. Fulfillment Method */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  {t.checkout.section2}
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
                      <span className="text-xs font-bold text-cocoa-800">{t.checkout.pickup}</span>
                    </div>
                    <span className="text-[11px] text-espresso-900/70">
                      {t.checkout.pickupDesc}
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
                      <span className="text-xs font-bold text-cocoa-800">{t.checkout.delivery}</span>
                    </div>
                    <span className="text-[11px] text-espresso-900/70">
                      {isFreeDelivery ? t.checkout.freeDelivery : formatMoney(deliveryFeeBase)}
                    </span>
                  </button>
                </div>

                {orderType === 'delivery' && (
                  <div className="space-y-2 pt-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-espresso-900">
                      {t.checkout.deliveryAddress}
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={t.checkout.deliveryAddressPlaceholder}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                    />
                    <div className="p-2.5 rounded-lg bg-oat-100 text-[11px] text-cocoa-800/80">
                      📍 {t.checkout.deliveryAreaNotice} {settings?.delivery_areas || 'Metro area & suburbs.'}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Schedule & Time Slot */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  {t.checkout.section3}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-caramel-600" />
                      <span>{t.checkout.date}</span>
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
                      {t.checkout.minLeadNotice} {maxPreorderDays} {t.catalog.days}.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-caramel-600" />
                      <span>{t.checkout.timeSlot}</span>
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

              {/* 4. Payment Method & Online Gateway */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-cocoa-800 border-b border-oat-200 pb-1.5">
                  {t.checkout.section4}
                </h3>

                <div className="space-y-2.5">
                  {/* Option A: Online Payment Gateway (Recommended) */}
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethodId === 'gateway_stripe'
                        ? 'border-caramel-500 bg-caramel-50/70 ring-2 ring-caramel-400'
                        : 'border-oat-200 bg-white hover:border-oat-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="gateway_stripe"
                      checked={paymentMethodId === 'gateway_stripe'}
                      onChange={() => setPaymentMethodId('gateway_stripe')}
                      className="mt-1 text-caramel-600 focus:ring-caramel-500"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cocoa-900 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-caramel-600" />
                          <span>{t.checkout.gatewayOption}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Instant</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-espresso-900/70">
                        {t.checkout.gatewayDesc}
                      </p>
                      {/* Supported Card Badges */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-900 text-white font-mono text-[9px] font-bold">VISA</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[9px] font-bold">MC</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-mono text-[9px] font-bold">AMEX</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-900 text-white font-sans text-[9px] font-bold"> Pay</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 font-sans text-[9px] font-bold">G Pay</span>
                      </div>
                    </div>
                  </label>

                  {/* Option B: Manual Methods */}
                  {manualMethods.map((pm) => (
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
                            Account: {pm.account_number} ({pm.account_name})
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Special Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-espresso-900">
                  {t.checkout.section5}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.checkout.notesPlaceholder}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
                />
              </div>

              {/* Order Cost Summary */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-2.5 shadow-sm">
                <div className="flex justify-between text-xs text-espresso-900/70">
                  <span>
                    {t.checkout.summaryItems} ({items.reduce((s, i) => s + i.quantity, 0)} {t.cart.itemCount})
                  </span>
                  <span className="font-semibold text-cocoa-800">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-espresso-900/70">
                  <span>{t.checkout.summaryDelivery}</span>
                  <span className="font-semibold text-cocoa-800">
                    {orderType === 'delivery'
                      ? isFreeDelivery
                        ? t.checkout.freeDelivery
                        : formatMoney(deliveryFeeBase)
                      : t.checkout.pickupFree}
                  </span>
                </div>
                <div className="pt-2 border-t border-oat-100 flex justify-between items-center text-sm">
                  <span className="font-serif font-bold text-cocoa-800">{t.checkout.grandTotal}</span>
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
                      <span>{t.checkout.processing}</span>
                    </>
                  ) : paymentMethodId === 'gateway_stripe' ? (
                    <>
                      <CreditCard className="w-5 h-5 text-caramel-400" />
                      <span>{t.checkout.submitOrder} ({formatMoney(totalAmount)})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-caramel-400" />
                      <span>{t.checkout.submitManual}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-espresso-900/60 mt-2.5">
                  <Lock className="w-3.5 h-3.5 text-sage-600" />
                  <span>{t.checkout.guaranteeNotice}</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stripe Payment Gateway Interactive Modal */}
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