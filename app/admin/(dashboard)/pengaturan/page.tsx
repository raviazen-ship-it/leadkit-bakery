'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Clock,
  Truck,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { BusinessSettings, FAQ, PaymentMethod } from '@/types';

export default function AdminPengaturanPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States for Settings
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState('');
  const [mapsShareUrl, setMapsShareUrl] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [deliveryAreas, setDeliveryAreas] = useState('');
  const [deliveryFeeBase, setDeliveryFeeBase] = useState<number>(20000);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(350000);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(50000);
  const [minPreorderDays, setMinPreorderDays] = useState<number>(1);
  const [orderingPolicy, setOrderingPolicy] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // FAQ Modal / Creation State
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('Pemesanan');
  const [savingFaq, setSavingFaq] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settRes, faqRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/faqs'),
      ]);
      const settData = await settRes.json();
      const faqData = await faqRes.json();

      if (settData.success && settData.data) {
        const s = settData.data;
        setSettings(s);
        setStoreName(s.store_name || '');
        setDescription(s.description || '');
        setWhatsapp(s.whatsapp_number || '');
        setPhone(s.phone_number || '');
        setEmail(s.email || '');
        setInstagramHandle(s.instagram_handle || '');
        setInstagramUrl(s.instagram_url || '');
        setAddress(s.address || '');
        setCity(s.city || '');
        setPostalCode(s.postal_code || '');
        setMapsEmbedUrl(s.google_maps_embed_url || '');
        setMapsShareUrl(s.google_maps_share_url || '');
        setBusinessHours(s.business_hours || '');
        setPickupInstructions(s.pickup_instructions || '');
        setDeliveryAreas(s.delivery_areas || '');
        setDeliveryFeeBase(s.delivery_fee_base ?? 20000);
        setFreeDeliveryThreshold(s.free_delivery_threshold ?? 350000);
        setMinOrderAmount(s.min_order_amount ?? 50000);
        setMinPreorderDays(s.min_preorder_days ?? 1);
        setOrderingPolicy(s.ordering_policy || '');
        setCancellationPolicy(s.cancellation_policy || '');
        setPaymentMethods(s.payment_methods || []);
      }

      if (faqData.success) {
        setFaqs(faqData.data || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      const payload: Partial<BusinessSettings> = {
        store_name: storeName.trim(),
        description: description.trim(),
        whatsapp_number: whatsapp.trim(),
        phone_number: phone.trim(),
        email: email.trim(),
        instagram_handle: instagramHandle.trim(),
        instagram_url: instagramUrl.trim(),
        address: address.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        google_maps_embed_url: mapsEmbedUrl.trim(),
        google_maps_share_url: mapsShareUrl.trim(),
        business_hours: businessHours.trim(),
        pickup_instructions: pickupInstructions.trim(),
        delivery_areas: deliveryAreas.trim(),
        delivery_fee_base: Number(deliveryFeeBase),
        free_delivery_threshold: Number(freeDeliveryThreshold),
        min_order_amount: Number(minOrderAmount),
        min_preorder_days: Number(minPreorderDays),
        ordering_policy: orderingPolicy.trim(),
        cancellation_policy: cancellationPolicy.trim(),
        payment_methods: paymentMethods,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan pengaturan.');
      }

      setToastMsg('Pengaturan toko dan informasi lokasi berhasil disimpan!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  // Payment Method Row handlers
  const handleAddPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      {
        id: `bank_${Date.now()}`,
        name: 'Transfer Bank Baru',
        account_number: '',
        account_name: storeName,
        enabled: true,
      },
    ]);
  };

  const handleRemovePaymentMethod = (id: string) => {
    if (paymentMethods.length <= 1) return;
    setPaymentMethods(paymentMethods.filter((p) => p.id !== id));
  };

  // FAQ Handlers
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    try {
      setSavingFaq(true);
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory.trim(),
          display_order: faqs.length + 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFaqQuestion('');
        setFaqAnswer('');
        setToastMsg('Pertanyaan FAQ berhasil ditambahkan!');
        setTimeout(() => setToastMsg(null), 3000);
        // Reload faqs
        const faqRes = await fetch('/api/faqs');
        const faqData = await faqRes.json();
        if (faqData.success) setFaqs(faqData.data);
      }
    } catch (err) {
      console.error('FAQ error:', err);
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Hapus pertanyaan FAQ ini?')) return;
    try {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFaqs(faqs.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Delete FAQ error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-espresso-900/60 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-caramel-600" />
        <span>Memuat pengaturan bisnis...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
          Konfigurasi Operasional
        </span>
        <h1 className="font-serif text-3xl font-bold text-cocoa-800">
          Pengaturan Toko, Lokasi & Kebijakan
        </h1>
        <p className="text-xs text-espresso-900/70 mt-1 font-light">
          Kelola kontak toko, koordinat peta Google Maps, ongkos kirim, rekening bank, serta daftar tanya-jawab FAQ.
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. IDENTITAS & KONTAK TOKO */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-oat-200">
            <h2 className="font-serif text-lg font-bold text-cocoa-800">
              1. Identitas & Kontak Resmi Toko
            </h2>
            <p className="text-xs text-espresso-900/70">
              Informasi ini muncul di navbar, footer, halaman kontak, dan tombol pemesanan WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Nama Toko / Brand *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Nomor WhatsApp Toko (Format: 628...) *
              </label>
              <input
                type="text"
                required
                placeholder="6281234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
              <span className="text-[10px] text-espresso-900/60 block mt-1">
                Seluruh konfirmasi pesanan pelanggan akan diarahkan ke nomor WhatsApp ini.
              </span>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Deskripsi Singkat Toko
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Telepon Toko (Opsional)
              </label>
              <input
                type="text"
                placeholder="021-5551234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Email Toko
              </label>
              <input
                type="email"
                placeholder="halo@aurabakery.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Akun Instagram
              </label>
              <input
                type="text"
                placeholder="@aurabakery.id"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Jam Operasional Toko
            </label>
            <input
              type="text"
              placeholder="Selasa - Minggu: 08.00 - 20.00 WIB (Senin Tutup)"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
            />
          </div>
        </div>

        {/* 2. LOKASI TOKO & GOOGLE MAPS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-oat-200">
            <h2 className="font-serif text-lg font-bold text-cocoa-800">
              2. Alamat & Peta Google Maps
            </h2>
            <p className="text-xs text-espresso-900/70">
              Pastikan alamat dan URL embed Google Maps valid agar pelanggan dapat menemukan toko Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-espresso-900 mb-1">
                Alamat Fisik Lengkap *
              </label>
              <input
                type="text"
                required
                placeholder="Jl. Senopati No. 42, Kebayoran Baru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Kota & Kode Pos *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Jakarta Selatan"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
                />
                <input
                  type="text"
                  placeholder="12190"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-20 p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                URL Google Maps Embed (Iframe URL) *
              </label>
              <input
                type="url"
                required
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={mapsEmbedUrl}
                onChange={(e) => setMapsEmbedUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
              <span className="text-[10px] text-espresso-900/60 block mt-1">
                Dapatkan dari Google Maps &rarr; Klik Bagikan &rarr; Sematkan Peta &rarr; Salin isi atribut <code>src</code>.
              </span>
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Tautan Share Google Maps (Untuk tombol navigasi aplikasi)
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={mapsShareUrl}
                onChange={(e) => setMapsShareUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>
          </div>

          {/* Live Map Preview */}
          <div className="p-4 rounded-2xl bg-oat-100/60 border border-oat-200 space-y-2">
            <span className="text-xs font-bold text-cocoa-800 block">
              Preview Langsung Peta Lokasi Toko:
            </span>
            <div className="w-full h-64 rounded-xl overflow-hidden border border-oat-300 bg-white">
              {mapsEmbedUrl ? (
                <iframe
                  src={mapsEmbedUrl}
                  title="Preview Peta Lokasi"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                  Masukkan URL Embed Google Maps untuk melihat preview
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. PENGIRIMAN & ATURAN PRE-ORDER */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-oat-200">
            <h2 className="font-serif text-lg font-bold text-cocoa-800">
              3. Aturan Pengiriman & Batasan Pesanan
            </h2>
            <p className="text-xs text-espresso-900/70">
              Atur ongkir standar, batas gratis ongkir, dan minimal waktu persiapan order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Ongkos Kirim Dasar (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={deliveryFeeBase}
                onChange={(e) => setDeliveryFeeBase(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Gratis Ongkir Jika Belanja &ge; (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Minimum Nilai Pesanan (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Default Min. Pre-Order (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={minPreorderDays}
                onChange={(e) => setMinPreorderDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Instruksi Pengambilan (Pick-up)
              </label>
              <textarea
                rows={2}
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Cakupan Area Pengiriman
              </label>
              <textarea
                rows={2}
                value={deliveryAreas}
                onChange={(e) => setDeliveryAreas(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 4. METODE PEMBAYARAN MANUAL */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-oat-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-cocoa-800">
                4. Pilihan Metode Pembayaran & Rekening Bank
              </h2>
              <p className="text-xs text-espresso-900/70">
                Pilihan rekening transfer bank manual dan pembayaran di tempat yang muncul saat checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPaymentMethod}
              className="px-3.5 py-1.5 rounded-xl border border-caramel-500 text-caramel-700 text-xs font-semibold hover:bg-caramel-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Rekening / Opsi</span>
            </button>
          </div>

          <div className="space-y-3">
            {paymentMethods.map((pm, idx) => (
              <div
                key={pm.id}
                className="p-3.5 rounded-2xl bg-cream-50 border border-oat-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <label className="block font-semibold text-espresso-900/70 text-[10px] mb-0.5">
                    Nama Metode / Bank
                  </label>
                  <input
                    type="text"
                    required
                    value={pm.name}
                    onChange={(e) => {
                      const next = [...paymentMethods];
                      next[idx].name = e.target.value;
                      setPaymentMethods(next);
                    }}
                    className="w-full p-2 rounded-lg border border-oat-300 bg-white font-medium"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-espresso-900/70 text-[10px] mb-0.5">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={pm.account_number}
                    placeholder="Contoh: 1234567890"
                    onChange={(e) => {
                      const next = [...paymentMethods];
                      next[idx].account_number = e.target.value;
                      setPaymentMethods(next);
                    }}
                    className="w-full p-2 rounded-lg border border-oat-300 bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-espresso-900/70 text-[10px] mb-0.5">
                    Atas Nama (A/N)
                  </label>
                  <input
                    type="text"
                    value={pm.account_name}
                    placeholder="Nama pemilik rekening"
                    onChange={(e) => {
                      const next = [...paymentMethods];
                      next[idx].account_name = e.target.value;
                      setPaymentMethods(next);
                    }}
                    className="w-full p-2 rounded-lg border border-oat-300 bg-white"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2 sm:pt-0">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-cocoa-800">
                    <input
                      type="checkbox"
                      checked={pm.enabled}
                      onChange={(e) => {
                        const next = [...paymentMethods];
                        next[idx].enabled = e.target.checked;
                        setPaymentMethods(next);
                      }}
                      className="rounded text-caramel-600"
                    />
                    <span>Aktif</span>
                  </label>

                  {paymentMethods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePaymentMethod(pm.id)}
                      className="p-1.5 text-red-500 hover:text-red-700"
                      title="Hapus metode ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. KEBIJAKAN PEMESANAN & PEMBATALAN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-oat-200">
            <h2 className="font-serif text-lg font-bold text-cocoa-800">
              5. Kebijakan Toko
            </h2>
            <p className="text-xs text-espresso-900/70">
              Penjelasan resmi mengenai batas pemesanan, kebijakan uang muka, serta pembatalan pesanan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Kebijakan Pemesanan
              </label>
              <textarea
                rows={3}
                value={orderingPolicy}
                onChange={(e) => setOrderingPolicy(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Kebijakan Pembatalan / Reschedule
              </label>
              <textarea
                rows={3}
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Button for Settings */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-3.5 px-8 rounded-2xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-sm transition-all shadow-md flex items-center gap-2 focus:ring-2 focus:ring-cocoa-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <span>Simpan Pengaturan Bisnis</span>
            )}
          </button>
        </div>
      </form>

      {/* 6. FAQ MANAGER SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-6 mt-8">
        <div className="pb-3 border-b border-oat-200">
          <h2 className="font-serif text-lg font-bold text-cocoa-800">
            6. Kelola Tanya Jawab (FAQ) Halaman Kontak
          </h2>
          <p className="text-xs text-espresso-900/70">
            Pertanyaan ini akan langsung muncul dalam bentuk akordeon interaktif pada halaman Kontak.
          </p>
        </div>

        {/* Existing FAQ items */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-4 rounded-2xl bg-cream-50 border border-oat-200 flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-cocoa-800 block text-sm">
                  {faq.question}
                </span>
                <p className="text-espresso-900/80 leading-relaxed font-light">
                  {faq.answer}
                </p>
                <span className="inline-block px-2 py-0.5 rounded bg-oat-200 text-cocoa-800 text-[10px] font-semibold mt-1">
                  Kategori: {faq.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteFaq(faq.id)}
                className="p-1.5 text-red-500 hover:text-red-700 shrink-0"
                title="Hapus pertanyaan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New FAQ Form */}
        <form onSubmit={handleCreateFaq} className="p-5 rounded-2xl bg-oat-100/60 border border-oat-200 space-y-4">
          <h3 className="font-serif text-sm font-bold text-cocoa-800">
            Tambah Pertanyaan FAQ Baru
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-espresso-900 mb-1">
                Pertanyaan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Apakah bisa request dekorasi khusus?"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Kategori
              </label>
              <select
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-medium"
              >
                <option value="Pemesanan">Pemesanan</option>
                <option value="Pengiriman">Pengiriman</option>
                <option value="Pembayaran">Pembayaran</option>
                <option value="Kualitas Produk">Kualitas Produk</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Jawaban *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Tuliskan jawaban lengkap dan jelas..."
              value={faqAnswer}
              onChange={(e) => setFaqAnswer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-white text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingFaq}
              className="px-5 py-2.5 rounded-xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-colors shadow-sm flex items-center gap-1.5"
            >
              {savingFaq ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menambahkan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-caramel-400" />
                  <span>Tambah ke Daftar FAQ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
