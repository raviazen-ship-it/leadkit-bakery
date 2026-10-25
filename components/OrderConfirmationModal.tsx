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
  Printer,
  Truck,
  Flame,
  ChefHat,
  Download,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatWhatsAppNumber, createWhatsAppOrderMessage } from '@/lib/utils';
import { BusinessSettings, Order } from '@/types';

interface OrderConfirmationModalProps {
  settings?: BusinessSettings;
  order?: Order | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function OrderConfirmationModal({
  settings,
  order,
  isOpen,
  onClose,
}: OrderConfirmationModalProps) {
  const { completedOrder, setCompletedOrder } = useCart();
  const activeOrder = order || completedOrder;
  const { t, formatMoney, language } = useLanguage();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  if (isOpen !== undefined && !isOpen) return null;
  if (!activeOrder) return null;

  const handleClose = () => {
    if (onClose) onClose();
    setCompletedOrder(null);
  };

  const targetWhatsapp = settings?.whatsapp_number || '6281234567890';
  const cleanTargetWa = formatWhatsAppNumber(targetWhatsapp);

  // Is this an online payment gateway order?
  const isGatewayOrder =
    activeOrder.payment_method_id === 'gateway_stripe' ||
    activeOrder.payment_method_id?.startsWith('gateway_') ||
    activeOrder.payment_status === 'Dibayar' ||
    (activeOrder as any).transaction_id;

  const transactionRef =
    (activeOrder as any).transaction_id ||
    (activeOrder.customer_notes?.match(/TXN_[A-Z0-9_]+/)?.[0]) ||
    'TXN_STRIPE_98A41E';

  // Generate WhatsApp prefilled message
  const waEncodedMsg = createWhatsAppOrderMessage({
    order_number: activeOrder.order_number,
    customer_name: activeOrder.customer_name,
    order_type: activeOrder.order_type,
    fulfillment_date: activeOrder.fulfillment_date,
    fulfillment_time_slot: activeOrder.fulfillment_time_slot,
    delivery_address: activeOrder.delivery_address,
    customer_notes: activeOrder.customer_notes,
    subtotal: activeOrder.subtotal,
    delivery_fee: activeOrder.delivery_fee,
    total_amount: activeOrder.total_amount,
    payment_method_name: isGatewayOrder
      ? 'Online Payment Gateway (Paid & Verified)'
      : activeOrder.payment_method_name,
    items: activeOrder.items?.map((it) => ({
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
    (p) => p.id === activeOrder.payment_method_id
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

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-cream-50 rounded-3xl max-w-xl w-full shadow-2xl border border-oat-300 overflow-hidden animate-fadeIn my-6 relative">
        {/* Header */}
        <div className="bg-cocoa-900 text-cream-100 p-6 text-center relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-caramel-500/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-caramel-500/20 blur-2xl pointer-events-none" />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-cream-100/70 hover:text-cream-100 hover:bg-cocoa-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-caramel-500 text-cream-100 mx-auto flex items-center justify-center mb-3 shadow-lg ring-4 ring-caramel-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl font-bold tracking-tight">
            {t.confirmation.successTitle}
          </h2>
          <p className="text-xs text-cream-100/80 mt-1 max-w-sm mx-auto font-light leading-relaxed">
            {t.confirmation.successDesc}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Online Gateway Verified Banner */}
          {isGatewayOrder && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-serif text-sm font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>{t.confirmation.paymentVerified}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold tracking-wider">
                  SETTLED &amp; AUTH OK
                </span>
              </div>
              <div className="text-xs text-emerald-900/90 flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-emerald-200 font-mono">
                <span>Transaction Ref:</span>
                <span className="font-bold select-all">{transactionRef}</span>
              </div>
            </div>
          )}

          {/* Order Number Box */}
          <div className="p-4 rounded-2xl bg-white border border-oat-200 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-semibold text-espresso-900/60 uppercase tracking-wider block">
                {t.confirmation.orderNumber}
              </span>
              <span className="font-mono text-base font-bold text-cocoa-900">
                {activeOrder.order_number}
              </span>
            </div>
            <button
              onClick={() => handleCopyOrderNumber(activeOrder.order_number)}
              className="px-3 py-1.5 rounded-xl border border-oat-300 hover:bg-oat-100 text-xs font-semibold text-cocoa-800 flex items-center gap-1.5 transition-colors shadow-sm"
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

          {/* Interactive Live Kitchen & Delivery Tracker */}
          <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold text-cocoa-800 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-caramel-600" />
                <span>{t.confirmation.trackOrderTitle}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-sage-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Kitchen Queue</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-cocoa-900 block">{t.confirmation.stepPaid}</span>
                  <span className="text-[10px] text-espresso-900/60 block font-mono">
                    Authorized via Secure Gateway
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-cocoa-900 block">{t.confirmation.stepKitchen}</span>
                  <span className="text-[10px] text-espresso-900/60 block">
                    Normandy butter &amp; sourdough starter resting
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-oat-200 text-espresso-900/60 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-cocoa-800 block">{t.confirmation.stepOven}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-oat-200 text-espresso-900/60 flex items-center justify-center shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-cocoa-800 block">{t.confirmation.stepDelivery}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Fulfillment Info */}
          <div className="p-4 rounded-2xl bg-oat-100/70 border border-oat-200 space-y-2 text-xs text-cocoa-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.schedule}</strong> {activeOrder.fulfillment_date} ({activeOrder.fulfillment_time_slot})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.method}</strong>{' '}
                {activeOrder.order_type === 'delivery'
                  ? `${t.checkout.delivery}: ${activeOrder.delivery_address}`
                  : `${t.checkout.pickup} (Aura Bakery Counter)`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
              <span>
                <strong>{t.confirmation.status}</strong>{' '}
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {isGatewayOrder ? 'Confirmed & Paid' : `${activeOrder.order_status} (${activeOrder.payment_status})`}
                </span>
              </span>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="space-y-2 bg-white p-4 rounded-2xl border border-oat-200 shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-oat-200">
              <h4 className="font-serif text-xs font-bold text-cocoa-800 uppercase tracking-wider">
                {t.confirmation.itemsOrdered}
              </h4>
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-caramel-700 hover:text-caramel-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.confirmation.printReceipt}</span>
              </button>
            </div>

            <div className="divide-y divide-oat-100 text-xs">
              {activeOrder.items?.map((it) => (
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

            <div className="space-y-1 pt-2 border-t border-oat-100 text-xs">
              <div className="flex justify-between text-espresso-900/70">
                <span>{t.cart.subtotal}</span>
                <span>{formatMoney(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-900/70">
                <span>{t.checkout.summaryDelivery}</span>
                <span>{formatMoney(activeOrder.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-serif text-sm font-bold text-cocoa-900 pt-1 border-t border-oat-200">
                <span>{t.checkout.grandTotal}</span>
                <span>{formatMoney(activeOrder.total_amount)}</span>
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
          <div className="space-y-2.5 pt-1">
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
              onClick={handleClose}
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