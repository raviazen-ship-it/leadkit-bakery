'use client';

import React, { useState, useEffect } from 'react';
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
  Smartphone,
  QrCode,
  CalendarCheck,
  Fingerprint,
  Copy,
  Check,
  ArrowRight,
  Clock,
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

type GatewayTab = 'card' | 'wallet' | 'klarna' | 'qris';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  amount,
  customerName,
  orderNumber,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const { t, formatMoney, currency, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<GatewayTab>('card');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState(customerName || 'Sarah Jenkins');
  const [zip, setZip] = useState('94103');
  const [saveCard, setSaveCard] = useState(true);

  // Apple Pay Simulation State
  const [walletStage, setWalletStage] = useState<'idle' | 'scanning' | 'verified'>('idle');

  // QRIS Countdown State
  const [qrisSeconds, setQrisSeconds] = useState(899); // 14:59
  const [copiedVA, setCopiedVA] = useState(false);

  // Common Processing & Error State
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // QRIS countdown timer effect
  useEffect(() => {
    if (!isOpen || activeTab !== 'qris') return;
    const timer = setInterval(() => {
      setQrisSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab]);

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

  // Detect card brand
  const getCardBrand = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'Visa';
    if (raw.startsWith('5')) return 'Mastercard';
    if (raw.startsWith('3')) return 'American Express';
    if (raw.startsWith('6')) return 'Discover';
    return 'Card';
  };

  // Card Autofill Presets
  const autofillPreset = (type: 'visa' | 'mastercard' | 'amex') => {
    setErrorMessage(null);
    if (type === 'visa') {
      setCardNumber('4242 4242 4242 4242');
      setExpiry('12/28');
      setCvc('888');
      setCardName(customerName || 'Alexander Vance');
      setZip('94103');
    } else if (type === 'mastercard') {
      setCardNumber('5555 5555 5555 4444');
      setExpiry('08/29');
      setCvc('737');
      setCardName(customerName || 'Elena Rostova');
      setZip('10001');
    } else {
      setCardNumber('3782 8224 6310 0050');
      setExpiry('10/27');
      setCvc('9999');
      setCardName(customerName || 'Julian Sterling');
      setZip('90210');
    }
  };

  // Format time MM:SS
  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle Card Submit
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage(language === 'en' ? 'Please enter a valid card number.' : 'Nomor kartu harus minimal 15-16 digit.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMessage(language === 'en' ? 'Please enter a valid expiry date (MM/YY).' : 'Format kedaluwarsa tidak valid (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMessage(language === 'en' ? 'Please enter a valid CVC code.' : 'Kode CVC/CVV minimal 3 digit.');
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `TXN_STRIPE_${randomSuffix}`;
      const brand = getCardBrand();
      const last4 = cleanCard.substring(cleanCard.length - 4);
      onPaymentSuccess(transactionId, `${brand} •••• ${last4}`);
    }, 1600);
  };

  // Handle Apple Pay / Google Pay Simulation
  const handleWalletExpress = (walletType: 'Apple Pay' | 'Google Pay') => {
    setWalletStage('scanning');
    setErrorMessage(null);

    setTimeout(() => {
      setWalletStage('verified');
      setTimeout(() => {
        const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
        const transactionId = `TXN_WALLETPAY_${randomSuffix}`;
        onPaymentSuccess(transactionId, `${walletType} (Biometric 3DS OK)`);
      }, 900);
    }, 1500);
  };

  // Handle Klarna Pay in 4 Simulation
  const handleKlarnaSubmit = () => {
    setProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      setProcessing(false);
      const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `TXN_KLARNA_${randomSuffix}`;
      onPaymentSuccess(transactionId, `Klarna Slice It (4x Installments Approved)`);
    }, 1500);
  };

  // Handle QRIS Simulation
  const handleQrisSimulate = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const randomSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `TXN_QRIS_INSTANT_${randomSuffix}`;
      onPaymentSuccess(transactionId, `QRIS National Switch (Settled & Verified)`);
    }, 1400);
  };

  const installmentAmount = Math.round(amount / 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-cream-50 rounded-3xl max-w-xl w-full shadow-2xl border border-oat-300 overflow-hidden animate-fadeIn my-6 relative">
        {/* Header */}
        <div className="bg-cocoa-900 text-cream-100 p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            disabled={processing || walletStage === 'scanning'}
            className="absolute top-4 right-4 p-1.5 rounded-full text-cream-100/70 hover:text-white hover:bg-cocoa-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-500/20 text-caramel-300 text-[10px] font-bold tracking-wider uppercase border border-caramel-400/30">
              <Lock className="w-3 h-3 text-caramel-400" />
              <span>Stripe & Global Gateway Engine</span>
            </span>
            <span className="text-[11px] text-cream-100/60 font-mono">
              Ref: {orderNumber}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-cream-100">
                {t.gatewayModal.title}
              </h2>
              <p className="text-xs text-cream-100/70 mt-0.5">
                {t.gatewayModal.subtitle}
              </p>
            </div>
            <div className="bg-cocoa-800/90 border border-cocoa-700 rounded-2xl px-4 py-2 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-caramel-300 block">
                {t.gatewayModal.amountDue}
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-cream-100">
                {formatMoney(amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Method Navigation Tabs */}
        <div className="bg-oat-100/80 p-2 border-b border-oat-200 grid grid-cols-4 gap-1 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-2 px-1 sm:px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'card'
                ? 'bg-white text-cocoa-900 shadow-sm border border-oat-300'
                : 'text-espresso-900/70 hover:bg-white/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-caramel-600" />
            <span className="text-[11px] sm:text-xs truncate">{t.gatewayModal.tabCard}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`py-2 px-1 sm:px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'wallet'
                ? 'bg-white text-cocoa-900 shadow-sm border border-oat-300'
                : 'text-espresso-900/70 hover:bg-white/60'
            }`}
          >
            <Smartphone className="w-4 h-4 text-caramel-600" />
            <span className="text-[11px] sm:text-xs truncate">{t.gatewayModal.tabWallet}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('klarna')}
            className={`py-2 px-1 sm:px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'klarna'
                ? 'bg-white text-cocoa-900 shadow-sm border border-oat-300'
                : 'text-espresso-900/70 hover:bg-white/60'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-caramel-600" />
            <span className="text-[11px] sm:text-xs truncate">{t.gatewayModal.tabKlarna}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qris')}
            className={`py-2 px-1 sm:px-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'qris'
                ? 'bg-white text-cocoa-900 shadow-sm border border-oat-300'
                : 'text-espresso-900/70 hover:bg-white/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-caramel-600" />
            <span className="text-[11px] sm:text-xs truncate">{t.gatewayModal.tabQris}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: CREDIT / DEBIT CARD */}
          {activeTab === 'card' && (
            <div className="space-y-5">
              {/* Interactive Virtual Card Hologram */}
              <div className="relative mx-auto max-w-sm w-full rounded-2xl p-5 shadow-xl bg-gradient-to-tr from-cocoa-950 via-cocoa-800 to-caramel-900 text-white overflow-hidden border border-white/10">
                {/* Background decorative rings */}
                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-caramel-500/10 blur-xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-white/5 blur-lg pointer-events-none" />

                <div className="flex items-center justify-between mb-6">
                  {/* EMV Chip */}
                  <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 border border-yellow-500/40 shadow-inner flex items-center justify-center">
                    <div className="w-7 h-5 border border-amber-800/20 rounded-sm" />
                  </div>
                  {/* Card Brand Badge */}
                  <span className="font-mono text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm border border-white/20">
                    {getCardBrand()}
                  </span>
                </div>

                {/* Formatted Number Display */}
                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-cream-100 mb-5">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                {/* Cardholder & Expiry */}
                <div className="flex justify-between items-end text-[11px] uppercase tracking-wider font-mono">
                  <div>
                    <span className="text-[9px] text-cream-100/60 block font-sans">Cardholder</span>
                    <span className="font-bold truncate max-w-[170px] block">
                      {cardName || 'YOUR NAME'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-cream-100/60 block font-sans">Expires</span>
                    <span className="font-bold">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Quick One-Click Demo Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-espresso-900/70 block">
                  Quick Demo Autofill:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => autofillPreset('visa')}
                    className="px-2 py-1.5 rounded-xl border border-oat-300 bg-white hover:bg-oat-100 text-[11px] font-bold text-blue-900 shadow-sm transition-all text-center truncate"
                  >
                    {t.gatewayModal.demoVisa}
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillPreset('mastercard')}
                    className="px-2 py-1.5 rounded-xl border border-oat-300 bg-white hover:bg-oat-100 text-[11px] font-bold text-red-700 shadow-sm transition-all text-center truncate"
                  >
                    {t.gatewayModal.demoMastercard}
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillPreset('amex')}
                    className="px-2 py-1.5 rounded-xl border border-oat-300 bg-white hover:bg-oat-100 text-[11px] font-bold text-emerald-800 shadow-sm transition-all text-center truncate"
                  >
                    {t.gatewayModal.demoAmex}
                  </button>
                </div>
              </div>

              {/* Card Form */}
              <form onSubmit={handleCardSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-espresso-900 mb-1">
                    {t.gatewayModal.cardNumber}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                      <CreditCard className="w-4 h-4 text-espresso-900/40" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1">
                      {t.gatewayModal.expiry}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1">
                      {t.gatewayModal.cvc}
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-espresso-900 mb-1">
                      {t.gatewayModal.cardholder}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Jenkins"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-900 mb-1">
                      {t.gatewayModal.zip}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="94103"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded text-caramel-600 focus:ring-caramel-500"
                  />
                  <span className="text-xs text-espresso-900/80">
                    {t.gatewayModal.saveCard}
                  </span>
                </label>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 px-6 rounded-2xl bg-cocoa-800 text-cream-100 font-bold hover:bg-cocoa-900 transition-all shadow-lg flex items-center justify-center gap-2.5 text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.gatewayModal.processing}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-caramel-400" />
                      <span>
                        {t.gatewayModal.payNow} {formatMoney(amount)}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: APPLE PAY / GOOGLE PAY */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 text-center py-3">
              <div className="w-16 h-16 rounded-3xl bg-caramel-100 text-caramel-700 mx-auto flex items-center justify-center shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-cocoa-900">
                  {t.gatewayModal.applePayTitle}
                </h3>
                <p className="text-xs text-espresso-900/70 max-w-sm mx-auto">
                  {t.gatewayModal.applePayDesc}
                </p>
              </div>

              {walletStage === 'idle' ? (
                <div className="space-y-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => handleWalletExpress('Apple Pay')}
                    className="w-full py-4 px-6 rounded-2xl bg-black text-white font-bold hover:bg-gray-900 transition-all shadow-md flex items-center justify-center gap-2 text-base font-sans"
                  >
                    <span>{t.gatewayModal.payWithApple}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWalletExpress('Google Pay')}
                    className="w-full py-3.5 px-6 rounded-2xl border border-oat-300 bg-white text-espresso-900 font-bold hover:bg-oat-100 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                  >
                    <span>{t.gatewayModal.payWithGoogle}</span>
                  </button>
                </div>
              ) : walletStage === 'scanning' ? (
                <div className="p-6 rounded-3xl bg-white border border-caramel-300 max-w-sm mx-auto space-y-4 shadow-xl animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-caramel-50 border-2 border-caramel-500 text-caramel-600 mx-auto flex items-center justify-center animate-pulse">
                    <Fingerprint className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-cocoa-800">
                      {t.gatewayModal.walletSimulating}
                    </h4>
                    <p className="text-xs text-espresso-900/60 mt-1">
                      Double-Click side button to authorize {formatMoney(amount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-sage-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Biometric Handshake...</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-300 max-w-sm mx-auto space-y-3 shadow-xl animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-emerald-900">
                    {t.gatewayModal.walletSuccess}
                  </h4>
                  <p className="text-xs text-emerald-800/80">
                    Transaction authorized and recorded.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KLARNA PAY IN 4 */}
          {activeTab === 'klarna' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-950 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">Klarna.</span>
                  <span className="text-xs text-pink-900/80">{t.gatewayModal.klarnaSubtitle}</span>
                </div>
                <span className="font-serif text-lg font-bold">
                  4 x {formatMoney(installmentAmount)}
                </span>
              </div>

              {/* Installment Schedule */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cocoa-800 uppercase tracking-wider block">
                  {t.gatewayModal.klarnaSchedule}
                </span>
                <div className="divide-y divide-oat-200 border border-oat-200 rounded-2xl bg-white overflow-hidden text-xs">
                  <div className="p-3 flex justify-between items-center bg-caramel-50/50">
                    <span className="font-bold text-cocoa-900">1. Due Today at Checkout</span>
                    <span className="font-serif font-bold text-cocoa-900">{formatMoney(installmentAmount)}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-espresso-900/70">2. In 2 Weeks</span>
                    <span className="font-medium text-cocoa-800">{formatMoney(installmentAmount)}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-espresso-900/70">3. In 4 Weeks</span>
                    <span className="font-medium text-cocoa-800">{formatMoney(installmentAmount)}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-espresso-900/70">4. In 6 Weeks</span>
                    <span className="font-medium text-cocoa-800">{formatMoney(installmentAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleKlarnaSubmit}
                className="w-full py-4 px-6 rounded-2xl bg-[#FFA8CD] text-cocoa-950 font-bold hover:bg-[#ff95c1] transition-all shadow-md flex items-center justify-center gap-2.5 text-sm"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying with Klarna Engine...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    <span>{t.gatewayModal.payWithKlarna} (1st slice: {formatMoney(installmentAmount)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: QRIS & INSTANT VA */}
          {activeTab === 'qris' && (
            <div className="space-y-5 text-center">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-cocoa-900">
                  {t.gatewayModal.qrisTitle}
                </h3>
                <p className="text-xs text-espresso-900/70 max-w-sm mx-auto">
                  {t.gatewayModal.qrisDesc}
                </p>
              </div>

              {/* Dynamic QR Code Canvas Simulation */}
              <div className="relative inline-block p-4 rounded-3xl bg-white border-2 border-cocoa-800 shadow-xl mx-auto">
                <div className="w-48 h-48 bg-cream-50 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden border border-oat-300">
                  {/* Stylized QR Matrix Pattern */}
                  <div className="grid grid-cols-6 gap-2 w-full h-full opacity-90 p-1">
                    {[...Array(36)].map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${
                          i % 2 === 0 || i % 7 === 0 ? 'bg-cocoa-900' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Center QRIS Logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-bold text-xs tracking-wider shadow-lg">
                      QRIS
                    </span>
                  </div>
                </div>

                {/* Expiry Pill */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-cocoa-800 font-mono font-semibold">
                  <Clock className="w-3.5 h-3.5 text-caramel-600" />
                  <span>{t.gatewayModal.qrisExpires}</span>
                  <span className="text-red-600 font-bold">{formatTime(qrisSeconds)}</span>
                </div>
              </div>

              {/* Virtual Account Backup */}
              <div className="p-3.5 rounded-2xl bg-white border border-oat-200 flex items-center justify-between text-left max-w-sm mx-auto shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-espresso-900/60 block">
                    BCA Virtual Account
                  </span>
                  <span className="font-mono text-sm font-bold text-cocoa-900">
                    8809 1029 3848 1102
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('8809102938481102');
                    setCopiedVA(true);
                    setTimeout(() => setCopiedVA(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-oat-300 hover:bg-oat-100 text-xs font-semibold text-cocoa-800 flex items-center gap-1 transition-colors"
                >
                  {copiedVA ? (
                    <span className="text-green-600">Copied</span>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>

              {/* 1-Click Simulated Payment Trigger */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleQrisSimulate}
                  className="w-full max-w-sm py-4 px-6 rounded-2xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm mx-auto"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying QRIS Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-emerald-300" />
                      <span>{t.gatewayModal.simulateQris}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-espresso-900/60 mt-1.5">
                  Allows instant testing of the QRIS webhook settlement flow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security Trust Badges Footer */}
        <div className="p-3.5 bg-oat-100 border-t border-oat-200 flex flex-wrap items-center justify-center gap-4 text-[10px] text-espresso-900/70 font-medium text-center">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-sage-600" />
            <span>256-Bit TLS Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-sage-600" />
            <span>PCI-DSS Level 1 Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sage-600" />
            <span>3D Secure 2.0 Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}