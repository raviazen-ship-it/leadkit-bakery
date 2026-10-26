'use client';

import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  Smartphone,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  Clock,
  Building2,
  MessageSquare,
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

type PaymentTab = 'qris' | 'va_bca' | 'va_mandiri' | 'whatsapp';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  amount,
  customerName,
  orderNumber,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const { formatMoney } = useLanguage();
  const [activeTab, setActiveTab] = useState<PaymentTab>('qris');

  // QRIS Countdown timer (15 minutes = 900 seconds)
  const [secondsLeft, setSecondsLeft] = useState(899);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Verification state
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleSimulatePayment = (methodName: string) => {
    setProcessing(true);
    setStatusMessage('Memverifikasi pembayaran melalui server payment gateway...');

    setTimeout(() => {
      setProcessing(false);
      const randomRef = `PAY-20261027-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      onPaymentSuccess(randomRef, methodName);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-lg w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn relative my-6">
        {/* Header Bar */}
        <div className="bg-cocoa-800 text-cream-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                Pembayaran Resmi Toko
              </h3>
              <p className="text-[11px] text-cream-200/80">
                Aura Artisan Bakery & Catering · IDR Secure Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-cream-200 hover:text-white hover:bg-cocoa-700 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-oat-100/90 border-b border-oat-200 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-espresso-900/60 block text-[10px]">Total Tagihan:</span>
            <span className="font-serif text-lg font-bold text-cocoa-900">
              {formatMoney(amount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-espresso-900/60 block text-[10px]">No. Pesanan:</span>
            <span className="font-mono font-bold text-cocoa-800 bg-white px-2 py-0.5 rounded border border-oat-300">
              {orderNumber || 'ORD-AURA-NEW'}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-oat-200 bg-cream-100/60 p-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('qris')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qris'
                ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                : 'text-cocoa-800 hover:bg-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-caramel-400" />
            <span>QRIS Instan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('va_bca')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'va_bca'
                ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                : 'text-cocoa-800 hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-caramel-400" />
            <span>Transfer BCA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('va_mandiri')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'va_mandiri'
                ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                : 'text-cocoa-800 hover:bg-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-caramel-400" />
            <span>Mandiri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                : 'text-cocoa-800 hover:bg-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>CS WhatsApp</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: QRIS INSTAN */}
          {activeTab === 'qris' && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cocoa-900 bg-amber-50 border border-amber-200/80 p-2 rounded-xl">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Batas Waktu Pembayaran: <strong className="font-mono text-amber-800">{timeFormatted}</strong></span>
              </div>

              {/* QR Code Graphic */}
              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-oat-300 w-56 h-56 mx-auto flex flex-col items-center justify-center shadow-inner relative group">
                <svg
                  className="w-48 h-48"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="24" height="24" rx="3" fill="#2A1B14" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#2A1B14" />

                  <rect x="66" y="10" width="24" height="24" rx="3" fill="#2A1B14" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#2A1B14" />

                  <rect x="10" y="66" width="24" height="24" rx="3" fill="#2A1B14" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#2A1B14" />

                  {/* Dynamic pattern pixels */}
                  <rect x="42" y="12" width="6" height="6" fill="#2A1B14" />
                  <rect x="52" y="12" width="6" height="6" fill="#2A1B14" />
                  <rect x="42" y="24" width="6" height="6" fill="#2A1B14" />
                  <rect x="42" y="38" width="6" height="6" fill="#2A1B14" />
                  <rect x="52" y="38" width="6" height="6" fill="#2A1B14" />
                  <rect x="62" y="44" width="6" height="6" fill="#2A1B14" />
                  <rect x="72" y="44" width="6" height="6" fill="#2A1B14" />
                  <rect x="82" y="44" width="6" height="6" fill="#2A1B14" />
                  <rect x="38" y="52" width="6" height="6" fill="#2A1B14" />
                  <rect x="48" y="52" width="6" height="6" fill="#2A1B14" />
                  <rect x="58" y="52" width="6" height="6" fill="#2A1B14" />
                  <rect x="38" y="66" width="6" height="6" fill="#2A1B14" />
                  <rect x="48" y="66" width="6" height="6" fill="#2A1B14" />
                  <rect x="58" y="66" width="6" height="6" fill="#2A1B14" />
                  <rect x="68" y="66" width="6" height="6" fill="#2A1B14" />
                  <rect x="78" y="66" width="6" height="6" fill="#2A1B14" />
                  <rect x="42" y="80" width="6" height="6" fill="#2A1B14" />
                  <rect x="52" y="80" width="6" height="6" fill="#2A1B14" />
                  <rect x="62" y="80" width="6" height="6" fill="#2A1B14" />
                  <rect x="78" y="80" width="6" height="6" fill="#2A1B14" />
                </svg>

                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold bg-cocoa-800 px-3 py-1.5 rounded-lg shadow-md">
                    Scan via m-Banking / e-Wallet
                  </span>
                </div>
              </div>

              <p className="text-xs text-espresso-900/70 font-light">
                Buka aplikasi m-Banking (BCA, Mandiri, BRI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay), lalu scan QRIS di atas.
              </p>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleSimulatePayment('QRIS Instan')}
                className="w-full py-3.5 px-6 rounded-2xl bg-caramel-500 hover:bg-caramel-600 text-cream-100 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi QRIS...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saya Sudah Bayar via QRIS</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: TRANSFER BANK BCA */}
          {activeTab === 'va_bca' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-oat-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cocoa-800">Bank Tujuan:</span>
                  <span className="font-bold text-blue-700">Bank Central Asia (BCA)</span>
                </div>

                <div className="border-t border-oat-200 pt-3">
                  <span className="text-[11px] text-espresso-900/60 block">Nomor Rekening Resmi:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xl font-bold text-cocoa-900">
                      1234-5678-90
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1234567890', 'bca')}
                      className="px-3 py-1.5 rounded-lg bg-oat-200 hover:bg-oat-300 text-xs font-semibold text-cocoa-800 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedAccount === 'bca' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount === 'bca' ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-espresso-900/70 block mt-1">
                    Atas Nama: <strong>Aura Artisan Bakery & Catering</strong>
                  </span>
                </div>

                <div className="border-t border-oat-200 pt-3">
                  <span className="text-[11px] text-espresso-900/60 block">Jumlah Transfer Tepat:</span>
                  <span className="font-serif text-lg font-bold text-cocoa-900 block mt-0.5">
                    {formatMoney(amount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleSimulatePayment('Transfer Bank BCA')}
                className="w-full py-3.5 px-6 rounded-2xl bg-caramel-500 hover:bg-caramel-600 text-cream-100 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengecek Mutasi Rekening...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Transfer BCA</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: TRANSFER MANDIRI */}
          {activeTab === 'va_mandiri' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-oat-300 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cocoa-800">Bank Tujuan:</span>
                  <span className="font-bold text-amber-700">Bank Mandiri</span>
                </div>

                <div className="border-t border-oat-200 pt-3">
                  <span className="text-[11px] text-espresso-900/60 block">Nomor Rekening Resmi:</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xl font-bold text-cocoa-900">
                      987-654-321-0123
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('9876543210123', 'mandiri')}
                      className="px-3 py-1.5 rounded-lg bg-oat-200 hover:bg-oat-300 text-xs font-semibold text-cocoa-800 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedAccount === 'mandiri' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount === 'mandiri' ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-espresso-900/70 block mt-1">
                    Atas Nama: <strong>Aura Artisan Bakery & Catering</strong>
                  </span>
                </div>

                <div className="border-t border-oat-200 pt-3">
                  <span className="text-[11px] text-espresso-900/60 block">Jumlah Transfer Tepat:</span>
                  <span className="font-serif text-lg font-bold text-cocoa-900 block mt-0.5">
                    {formatMoney(amount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleSimulatePayment('Transfer Bank Mandiri')}
                className="w-full py-3.5 px-6 rounded-2xl bg-caramel-500 hover:bg-caramel-600 text-cream-100 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengecek Mutasi Rekening...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Transfer Mandiri</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: WHATSAPP CS CONCIERGE */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-cocoa-900">
                  Konsultasi Pembayaran via WhatsApp
                </h4>
                <p className="text-xs text-espresso-900/70 mt-1 font-light leading-relaxed">
                  Untuk pesanan katering korporat, pelunasan down payment (DP), atau faktur pajak perusahaan, tim concierge kami siap membantu langsung.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const text = encodeURIComponent(
                    `Halo Aura Bakery, saya ingin mengonfirmasi pembayaran untuk pesanan #${orderNumber || 'BARU'} sebesar ${formatMoney(amount)} atas nama ${customerName}.`
                  );
                  window.open(`https://wa.me/6281234567890?text=${text}`, '_blank');
                  onPaymentSuccess('WA-CONCIERGE-PENDING', 'WhatsApp CS Concierge');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Buka WhatsApp Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {statusMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs text-center flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-cream-100/80 px-6 py-3 border-t border-oat-200 flex items-center justify-between text-[11px] text-espresso-900/60">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-caramel-600" />
            <span>256-bit SSL Encrypted Transaction</span>
          </div>
          <span>IDR Payment Authority</span>
        </div>
      </div>
    </div>
  );
}
