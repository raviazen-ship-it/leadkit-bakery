'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Store,
  ArrowRight,
} from 'lucide-react';
import { BusinessSettings, Campaign } from '@/types';

export default function AdminTampilanPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCamp, setUploadingCamp] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');

  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImage, setHeroImage] = useState('');

  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubtitle, setCampaignSubtitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignBanner, setCampaignBanner] = useState('');
  const [campaignCtaText, setCampaignCtaText] = useState('');
  const [campaignActive, setCampaignActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [settRes, campRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/campaigns?activeOnly=true'),
        ]);

        const settData = await settRes.json();
        const campData = await campRes.json();

        if (settData.success && settData.data) {
          const s = settData.data;
          setSettings(s);
          setAnnouncementEnabled(s.announcement_enabled);
          setAnnouncementText(s.announcement_text || '');
          setHeroEyebrow(s.hero_eyebrow || '');
          setHeroHeadline(s.hero_headline || '');
          setHeroDescription(s.hero_description || '');
          setHeroImage(s.hero_image_url || '');
        }

        if (campData.success && campData.data) {
          const c = campData.data;
          setCampaign(c);
          setCampaignTitle(c.title || '');
          setCampaignSubtitle(c.subtitle || '');
          setCampaignDescription(c.description || '');
          setCampaignBanner(c.banner_image || '');
          setCampaignCtaText(c.cta_text || 'Pesan Paket Sekarang');
          setCampaignActive(c.is_active);
        }
      } catch (err) {
        console.error('Failed to load visual settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'hero' | 'campaign'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (target === 'hero') setUploadingHero(true);
      if (target === 'campaign') setUploadingCamp(true);
      setErrorMsg(null);

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah gambar.');
      }

      if (target === 'hero') setHeroImage(data.url);
      if (target === 'campaign') setCampaignBanner(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal upload file.');
    } finally {
      if (target === 'hero') setUploadingHero(false);
      if (target === 'campaign') setUploadingCamp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    try {
      // 1. Save settings (Announcement + Hero)
      const settPayload = {
        announcement_enabled: announcementEnabled,
        announcement_text: announcementText.trim(),
        hero_eyebrow: heroEyebrow.trim(),
        hero_headline: heroHeadline.trim(),
        hero_description: heroDescription.trim(),
        hero_image_url: heroImage.trim(),
      };

      const resSett = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settPayload),
      });

      if (!resSett.ok) {
        const err = await resSett.json();
        throw new Error(err.error || 'Gagal menyimpan pengaturan tampilan.');
      }

      // 2. Save Campaign
      const campPayload = {
        id: campaign?.id || 'camp_festive_special',
        title: campaignTitle.trim(),
        subtitle: campaignSubtitle.trim(),
        description: campaignDescription.trim(),
        banner_image: campaignBanner.trim(),
        cta_text: campaignCtaText.trim() || 'Pesan Sekarang',
        cta_link: '/produk',
        is_active: campaignActive,
      };

      const resCamp = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campPayload),
      });

      if (!resCamp.ok) {
        const err = await resCamp.json();
        throw new Error(err.error || 'Gagal menyimpan campaign promosi.');
      }

      setToastMsg('Tampilan website & promosi berhasil diperbarui!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-espresso-900/60 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-caramel-600" />
        <span>Memuat pengaturan visual...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
          Branding & Promosi
        </span>
        <h1 className="font-serif text-3xl font-bold text-cocoa-800">
          Kustomisasi Tampilan & Promo Musiman
        </h1>
        <p className="text-xs text-espresso-900/70 mt-1 font-light">
          Ubah pesan promo di announcement bar, banner utama hero section, dan campaign musiman tanpa menyentuh kode.
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. ANNOUNCEMENT BAR */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-oat-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-cocoa-800">
                1. Announcement Bar (Bar Atas)
              </h2>
              <p className="text-xs text-espresso-900/70">
                Pemberitahuan tipis di bagian paling atas halaman publik untuk promo atau info penting.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-cocoa-800">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="rounded text-caramel-600 focus:ring-caramel-500"
              />
              <span>Aktifkan Bar</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-900 mb-1">
              Teks Pengumuman
            </label>
            <input
              type="text"
              placeholder="Contoh: Pre-order Lebaran & Hampers Spesial telah dibuka..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full p-3 rounded-xl border border-oat-300 text-xs bg-cream-50/50"
            />
          </div>
        </div>

        {/* 2. HERO SECTION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-oat-200">
            <h2 className="font-serif text-lg font-bold text-cocoa-800">
              2. Banner Utama Hero Section (Beranda)
            </h2>
            <p className="text-xs text-espresso-900/70">
              Judul utama, deskripsi pengantar, dan foto sambutan di halaman depan toko.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Eyebrow Text (Teks Kecil di Atas Judul)
              </label>
              <input
                type="text"
                placeholder="Freshly Made, Thoughtfully Baked"
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Headline Utama *
              </label>
              <input
                type="text"
                required
                placeholder="Cita Rasa Artisan untuk Setiap Momen Spesial"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Deskripsi Hero *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Temukan kue perayaan artisan, roti sourdough segar harian..."
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
            />
          </div>

          {/* Hero Image Upload */}
          <div className="p-4 rounded-2xl bg-oat-100/60 border border-oat-200 space-y-3">
            <label className="block text-xs font-bold text-cocoa-800">
              Foto Utama Hero Beranda
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white border border-oat-200 shrink-0">
                {heroImage ? (
                  <img src={heroImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-espresso-900/40">
                    Foto Hero
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full text-xs">
                <label className="px-4 py-2 rounded-xl bg-cocoa-800 text-cream-100 hover:bg-cocoa-900 cursor-pointer font-semibold inline-flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-caramel-400" />
                  <span>{uploadingHero ? 'Mengunggah...' : 'Upload File Foto Hero'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingHero}
                    onChange={(e) => handleUploadImage(e, 'hero')}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-espresso-900/60">Atau URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-oat-300 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SEASONAL CAMPAIGN */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-oat-200">
            <div>
              <h2 className="font-serif text-lg font-bold text-cocoa-800">
                3. Seasonal Campaign & Hampers Section
              </h2>
              <p className="text-xs text-espresso-900/70">
                Bagian promosi khusus (misal: Ramadan, Natal, Imlek, Valentine, Mother&apos;s Day).
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-cocoa-800">
              <input
                type="checkbox"
                checked={campaignActive}
                onChange={(e) => setCampaignActive(e.target.checked)}
                className="rounded text-caramel-600 focus:ring-caramel-500"
              />
              <span>Tampilkan di Beranda</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Sub-Judul / Label Musim
              </label>
              <input
                type="text"
                placeholder="Edisi Terbatas Setiap Pekan / Eid Special"
                value={campaignSubtitle}
                onChange={(e) => setCampaignSubtitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-espresso-900 mb-1">
                Judul Campaign *
              </label>
              <input
                type="text"
                required
                placeholder="Koleksi Perayaan & Hampers Musiman"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Deskripsi Campaign *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ceritakan keistimewaan paket musiman ini..."
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-xs"
            />
          </div>

          <div className="text-xs">
            <label className="block font-bold text-espresso-900 mb-1">
              Label Tombol CTA
            </label>
            <input
              type="text"
              placeholder="Pesan Paket Sekarang"
              value={campaignCtaText}
              onChange={(e) => setCampaignCtaText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-oat-300 bg-cream-50/50"
            />
          </div>

          {/* Campaign Banner Image Upload */}
          <div className="p-4 rounded-2xl bg-oat-100/60 border border-oat-200 space-y-3">
            <label className="block text-xs font-bold text-cocoa-800">
              Banner Foto Campaign
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white border border-oat-200 shrink-0">
                {campaignBanner ? (
                  <img src={campaignBanner} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-espresso-900/40">
                    Banner Foto
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full text-xs">
                <label className="px-4 py-2 rounded-xl bg-cocoa-800 text-cream-100 hover:bg-cocoa-900 cursor-pointer font-semibold inline-flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-caramel-400" />
                  <span>{uploadingCamp ? 'Mengunggah...' : 'Upload File Banner Campaign'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingCamp}
                    onChange={(e) => handleUploadImage(e, 'campaign')}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-espresso-900/60">Atau URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={campaignBanner}
                    onChange={(e) => setCampaignBanner(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-oat-300 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LIVE PREVIEW PREVIEW CARD */}
        <div className="bg-oat-100/70 p-6 sm:p-8 rounded-3xl border border-oat-200 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-caramel-600" />
            <h3 className="font-serif text-lg font-bold text-cocoa-800">
              Preview Langsung Tampilan Campaign
            </h3>
          </div>

          {campaignActive ? (
            <div className="bg-cocoa-800 text-cream-100 p-6 sm:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-lg">
              <div className="space-y-3">
                {campaignSubtitle && (
                  <span className="text-[10px] font-bold tracking-widest uppercase text-caramel-300 block">
                    {campaignSubtitle}
                  </span>
                )}
                <h4 className="font-serif text-2xl font-bold leading-tight">
                  {campaignTitle || 'Judul Campaign'}
                </h4>
                <p className="text-xs text-cream-100/80 font-light leading-relaxed">
                  {campaignDescription || 'Deskripsi singkat campaign...'}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-caramel-500 text-cream-100 font-semibold text-xs shadow">
                    <span>{campaignCtaText || 'Pesan Paket'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-cocoa-900 border border-white/10">
                {campaignBanner ? (
                  <img src={campaignBanner} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-cream-100/40">
                    Banner Image
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-2xl border border-oat-200 text-center text-xs text-espresso-900/60">
              Bagian campaign musiman dinonaktifkan (tidak akan tampil di Beranda).
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="py-3.5 px-8 rounded-2xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-sm transition-all shadow-md flex items-center gap-2 focus:ring-2 focus:ring-cocoa-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan & Publikasikan Tampilan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
