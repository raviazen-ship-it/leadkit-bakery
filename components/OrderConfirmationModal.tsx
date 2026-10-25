'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  Clock,
  X,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatWhatsAppNumber, createWhatsAppOrderMessage } from '@/lib/utils';
import { BusinessSettings } from '@/types';

interface OrderConfirmationModalProps {
  settings?: BusinessSettings;
}

export default function OrderConfirmationModal({ settings }: OrderConfirmationModalProps) {
  const { completedOrder, setCompletedOrder } = useCart();
  const { t, formatMoney, language } = useLanguage();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  if (!completedOrder) return null;

  const targetWhatsapp = settings?.whatsapp_number || '6281234567890';
  const cleanTargetWa = formatWhatsAppNumber(targetWhatsapp);

  // Is this an online payment gateway order?
  const isGatewayOrder =
    completedOrder.payment_method_id === 'gateway_stripe' ||
    completedOrder.payment_method_id?.startsWith('gateway_') ||
    completedOrder.payment_status === 'Dibayar' ||
    (completedOrder as any).transaction_id;

  const transactionRef =
    (completedOrder as any).transaction_id ||
    (completedOrder.customer_notes?.match(/TXN_STRIPE_[A-Z0-9]+/)?.[0]) ||
    'TXN_STRIPE_DEMO_OK';

  // Generate WhatsApp prefilled message
  const waEncodedMsg = createWhatsAppOrderMessage({
    order_number: completedOrder.order_number,
    customer_name: completedOrder.customer_name,
    order_type: completedOrder.order_type,
    fulfillment_date: completedOrder.fulfillment_date,
    fulfillment_time_slot: completedOrder.fulfillment_time_slot,
    delivery_address: completedOrder.delivery_address,
    customer_notes: completedOrder.customer_notes,
    subtotal: completedOrder.subtotal,
    delivery_fee: completedOrder.delivery_fee,
    total_amount: completedOrder.total_amount,
    payment_method_name: isGatewayOrder
      ? 'Online Payment Gateway (Paid & Verified)'
      : completedOrder.payment_method_name,
    items: completedOrder.items?.map((it) => ({
      product_name: it.product_name,
      variant_name: it.variant_name,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total_price: it.total_price,
    })),
  });

  const whatsappUrl = `https://wa.me/${cleanTargetWa}?text=${waEncodedMsg}`;

  // Find payment info for manual method
  const paymentMethod = settings?.payment_methods?.find(
    (p) => p.id === completedOrder.payment_method_id
  );

  const handleCopyAccount = (accountNum: string) => {
    navigator.clipboard.writeText(accountNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-xl w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn my-8">
        {/* Header */}
        <div className="bg-cocoa-800 text-cream-100 p-6 text-center relative">
          <button
            onClick={() => setCompletedOrder(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-cream-100/70 hover:text-cream-100 hover:bg-cocoa-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-full bg-caramel-500 text-cream-100 mx-auto flex items-center justify-center mb-3 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            {t.confirmation.successTitle}
          </h2>
          <p className="text-xs text-cream-100/80 mt-1 max-w-sm mx-auto">
            {t.confirmation.successDesc}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Online Gateway Verified Banner */}
          {isGatewayOrder && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{t.confirmation.paymentVerified}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                  AUTH OK
                </span>
              </div>
              <div className="text-xs text-emerald-800/90 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-emerald-200/60 font-mono">
                <span>Transaction Ref:</span>
                <span className="font-bold">{transactionRef}</span>
              </div>
            </div>
          )}

          {/* Order Number Box */}
          <div className="p-4 rounded-2xl bg-white border border-oat-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[11px] font-semibold text-espresso-900/60 uppercase tracking-wider block">
                {t.confirmation.orderNumber}
              </span>
              <span className="font-mono text-base font-bold text-cocoa-800">
                {completedOrder.order_number}
              </span>
            </div>
            <button
              onClick={() => handleCopyOrderNumber(completedOrder.order_number)}
              className="px-3 py-1.5 rounded-lg border border-oat-300 hover:bg-oat-100 text-xs font-medium text-cocoa-800 flex items-center gap-1.5 transition-colors"
            >
              {copiedOrderNumber ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600 font-semibold">{t.confirmation.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.confirmation.copy}</span>
                </>
              )}
            </button>
          </div>

          {/* Schedule & Fulfillment Info */}
          <div className="p-4 rounded-2xl bg-oat-100/70 border border-oat-200 space-y-2 text-xs text-cocoa-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.schedule}</strong> {completedOrder.fulfillment_date} ({completedOrder.fulfillment_time_slot})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.method}</strong>{' '}
                {completedOrder.order_type === 'delivery'
                  ? `${t.checkout.delivery}: ${completedOrder.delivery_address}`
                  : `${t.checkout.pickup} (Aura Bakery Counter)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.status}</strong>{' '}
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {isGatewayOrder ? 'Confirmed & Paid' : `${completedOrder.order_status} (${completedOrder.payment_status})`}
                </span>
              </span>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-cocoa-800">
              {t.confirmation.itemsOrdered}
            </h4>
            <div className="divide-y divide-oat-200 border-y border-oat-200 py-1 text-xs">
              {completedOrder.items?.map((it) => (
                <div key={it.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-cocoa-800">{it.product_name}</span>
                    <span className="text-espresso-900/60 block text-[11px]">
                      {it.variant_name} x {it.quantity}
                    </span>
                  </div>
                  <span className="font-medium text-cocoa-800">
                    {formatMoney(it.total_price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between text-espresso-900/70">
                <span>{t.cart.subtotal}</span>
                <span>{formatMoney(completedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-900/70">
                <span>{t.checkout.summaryDelivery}</span>
                <span>{formatMoney(completedOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-serif text-sm font-bold text-cocoa-800 pt-1 border-t border-oat-200">
                <span>{t.checkout.grandTotal}</span>
                <span>{formatMoney(completedOrder.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Manual Payment Details Box (Only if not already paid via gateway) */}
          {!isGatewayOrder && paymentMethod && paymentMethod.account_number && (
            <div className="p-4 rounded-2xl bg-caramel-50 border border-caramel-200 space-y-2 text-xs">
              <span className="font-bold text-cocoa-800 block">
                {t.confirmation.manualTransferNotice}
              </span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-caramel-200">
                <div>
                  <span className="font-bold text-cocoa-800 block">{paymentMethod.name}</span>
                  <span className="font-mono text-sm font-semibold text-cocoa-900">
                    {paymentMethod.account_number}
                  </span>
                  <span className="text-[10px] text-espresso-900/60 block">
                    a/n {paymentMethod.account_name}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyAccount(paymentMethod.account_number)}
                  className="px-2.5 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-cocoa-800 text-[11px] font-semibold border border-oat-300 flex items-center gap-1"
                >
                  {copiedAccount ? (
                    <span className="text-green-600">{t.confirmation.copiedAccount}</span>
                  ) : (
                    <span>{t.confirmation.copyAccount}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white font-bold hover:bg-[#20BE5C] transition-all shadow-md flex items-center justify-center gap-2.5 text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.confirmation.continueWa}</span>
            </a>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-3 rounded-xl border border-oat-300 text-cocoa-800 font-medium hover:bg-oat-100 transition-colors text-xs"
            >
              {t.confirmation.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}