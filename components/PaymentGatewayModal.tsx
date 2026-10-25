'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  customerName: string;
  orderNumber: string;
  onPaymentSuccess: (transactionRef: string, methodDetails: string) => void;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  amount,
  customerName,
  orderNumber,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const { t, formatMoney } = useLanguage();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState(customerName || 'Sarah Jenkins');
  const [zip, setZip] = useState('94103');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format card number with spaces (4 4 4 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Format expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      setExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setExpiry(val);
    }
  };

  // Demo Card One-Click Autofill
  const handleAutofillDemo = () => {
    setCardNumber('4242 4242 4242 4242');
    setExpiry('12/28');
    setCvc('888');
    setCardName(customerName || 'Alex Mercer');
    setZip('94103');
    setErrorMessage(null);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMessage('Please enter a valid expiration date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage('Please enter a valid 3-digit security code (CVC).');
      return;
    }

    setProcessing(true);

    // Realistic Payment Gateway Authorization simulation
    setTimeout(() => {
      setProcessing(false);
      const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `TXN_STRIPE_${randomSuffix}`;
      const last4 = cleanCard.substring(cleanCard.length - 4);
      onPaymentSuccess(transactionId, `Visa Card ending in •••• ${last4}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-md w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn my-6 relative">
        {/* Header */}
        <div className="bg-cocoa-800 text-cream-100 p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-caramel-500/20 text-caramel-300 text-[10px] font-bold tracking-wider uppercase border border-caramel-400/30">
              <Lock className="w-3 h-3 text-caramel-400" />
              <span>Stripe Secure Gateway</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-cream-100">
              {t.gatewayModal.title}
            </h2>
            <p className="text-[11px] text-cream-100/70">
              {t.gatewayModal.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1 rounded-full text-cream-100/70 hover:text-white hover:bg-cocoa-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-caramel-50 px-6 py-4 border-b border-caramel-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-cocoa-800">
            {t.gatewayModal.amountDue}
          </span>
          <span className="font-serif text-2xl font-bold text-cocoa-900">
            {formatMoney(amount)}
          </span>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Autofill Button */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-espresso-900/60 uppercase tracking-wider">
              Card Details
            </span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-[11px] font-bold text-caramel-700 hover:text-caramel-800 bg-caramel-100/60 hover:bg-caramel-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3 h-3 text-caramel-600" />
              <span>{t.gatewayModal.demoCardBtn}</span>
            </button>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-semibold text-espresso-900 mb-1">
              {t.gatewayModal.cardNumber}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="4242 •••• •••• 4242"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-oat-300 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
              />
              <CreditCard className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase bg-cocoa-800 text-cream-100 px-1.5 py-0.5 rounded">
                  VISA
                </span>
              </div>
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-espresso-900 mb-1">
                {t.gatewayModal.expiry}
              </label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-espresso-900 mb-1">
                {t.gatewayModal.cvc}
              </label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="CVC"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-mono text-center focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
              />
            </div>
          </div>

          {/* Cardholder Name & ZIP */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block font-semibold text-espresso-900 mb-1">
                {t.gatewayModal.cardholder}
              </label>
              <input
                type="text"
                required
                placeholder="Name as on card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-espresso-900 mb-1">
                {t.gatewayModal.zip}
              </label>
              <input
                type="text"
                required
                placeholder="94103"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
              />
            </div>
          </div>

          {/* Pay Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 px-6 rounded-2xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-cocoa-700 disabled:opacity-75"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-caramel-400" />
                  <span>{t.gatewayModal.processing}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-caramel-400" />
                  <span>
                    {t.gatewayModal.payNow} {formatMoney(amount)}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Security Assurance */}
          <div className="pt-2 text-center text-[10px] text-espresso-900/60 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>{t.gatewayModal.securityNotice}</span>
          </div>
        </form>
      </div>
    </div>
  );
}
