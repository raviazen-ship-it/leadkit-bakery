'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Wheat,
  ShieldCheck,
  Clock,
  Award,
  Star,
  Gift,
  Truck,
  CheckCircle2,
  Lock,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { BusinessSettings, Category, Product, Campaign } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface HomePageClientProps {
  settings: BusinessSettings;
  categories: Category[];
  featuredProducts: Product[];
  activeCampaign: Campaign | null;
}

export default function HomePageClient({
  settings,
  categories,
  featuredProducts,
  activeCampaign,
}: HomePageClientProps) {
  const { t, formatMoney, language } = useLanguage();

  const heroHeadline =
    language === 'en'
      ? t.hero.title
      : settings.hero_headline || 'Cita Rasa Artisan untuk Setiap Momen Spesial';

  const heroDescription =
    language === 'en'
      ? t.hero.description
      : settings.hero_description ||
        'Temukan kue perayaan artisan, roti sourdough segar harian, dan paket catering pilihan yang dibuat dengan ketulusan dan bahan terbaik.';

  const heroEyebrow =
    language === 'en'
      ? t.hero.eyebrow
      : settings.hero_eyebrow || 'Freshly Made, Thoughtfully Baked';

  const heroImage =
    settings.hero_image_url ||
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1">
        {/* TOP DEMONSTRATION ACCREDITATION BAR FOR PROSPECTS & CLIENTS */}
        <section className="bg-gradient-to-r from-cocoa-900 via-cocoa-800 to-caramel-900 text-cream-100 py-2.5 px-4 text-xs border-b border-caramel-500/30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-caramel-300">
                {language === 'en' ? 'Live Showcase Demonstration:' : 'Demonstrasi Live Toko Online:'}
              </span>
              <span className="text-cream-100/90 font-light hidden sm:inline">
                {language === 'en'
                  ? 'Bilingual (EN/ID) • Real-Time Currency Engine • QRIS, Transfer Bank & Online Gateway • Automated Kitchen Lead-Times'
                  : 'Bilingual (EN/ID) • Konversi Mata Uang (IDR/USD) • QRIS, Transfer Bank & Payment Gateway • Kalkulasi Otomatis Pre-Order'}
              </span>
            </div>
            <Link
              href="/produk"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-caramel-300 hover:text-white underline underline-offset-2 ml-auto"
            >
              <span>{language === 'en' ? 'Try Interactive Order Flow →' : 'Uji Coba Alur Order →'}</span>
            </Link>
          </div>
        </section>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-oat-200 text-cocoa-800 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
                  <span>{heroEyebrow}</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cocoa-800 leading-[1.15]">
                  {heroHeadline}
                </h1>

                <p className="text-base sm:text-lg text-espresso-900/80 max-w-xl font-light leading-relaxed">
                  {heroDescription}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/produk"
                    className="px-7 py-3.5 rounded-full bg-caramel-500 text-cream-100 font-semibold hover:bg-caramel-600 shadow-md transition-all text-sm sm:text-base flex items-center gap-2 focus:ring-2 focus:ring-caramel-400"
                  >
                    <span>{t.hero.exploreMenu}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#tentang-kami"
                    className="px-6 py-3.5 rounded-full border border-cocoa-800/30 text-cocoa-800 font-medium hover:bg-oat-200 transition-colors text-sm sm:text-base"
                  >
                    {t.hero.ourStory}
                  </a>
                </div>

                {/* Micro Trust Points */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-oat-200 text-xs text-cocoa-800/80">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-caramel-600 shrink-0" />
                    <span>{t.hero.badgeButter}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
                    <span>{t.hero.badgeNoPreservatives}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                    <span>{t.hero.badgeDailyFresh}</span>
                  </div>
                </div>
              </div>

              {/* Hero Image with Floating Glassmorphism Cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-oat-200 relative">
                    <img
                      src={heroImage}
                      alt={settings.store_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Floating Highlight Card 1 */}
                  <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-oat-200 hidden sm:flex items-center gap-3 max-w-xs animate-slideUp">
                    <div className="w-10 h-10 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        {t.hero.floatingCardTitle}
                      </span>
                      <span className="text-[11px] text-espresso-900/70 block leading-tight">
                        {t.hero.floatingCardDesc}
                      </span>
                    </div>
                  </div>

                  {/* Floating Highlight Card 2: 5-Star Rating */}
                  <div className="absolute top-6 -right-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-oat-200 hidden sm:flex items-center gap-2 animate-fadeIn">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-cocoa-900">4.9 / 5.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP SEAMLESS ORDERING EXPERIENCE */}
        <section className="py-14 bg-white border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-caramel-600 block">
                {language === 'en' ? 'HOW IT WORKS' : 'CARA PEMESANAN'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-800">
                {language === 'en' ? 'Effortless Ordering from Oven to Doorstep' : 'Pemesanan Mudah dari Dapur ke Meja Anda'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-cream-50 border border-oat-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-caramel-100 text-caramel-700 mx-auto flex items-center justify-center font-serif text-lg font-bold">
                  1
                </div>
                <h3 className="font-serif text-base font-bold text-cocoa-800">
                  {language === 'en' ? 'Choose Artisan Bakes' : 'Pilih Menu Artisan'}
                </h3>
                <p className="text-xs text-espresso-900/70 leading-relaxed font-light">
                  {language === 'en'
                    ? 'Explore signature whole celebration cakes, slow-fermented sourdough, or custom catering sets.'
                    : 'Pilih kue whole cake perayaan, roti sourdough segar harian, atau paket katering sesuai selera.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-50 border border-oat-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-caramel-100 text-caramel-700 mx-auto flex items-center justify-center font-serif text-lg font-bold">
                  2
                </div>
                <h3 className="font-serif text-base font-bold text-cocoa-800">
                  {language === 'en' ? 'Pick Date & Pay Online' : 'Pilih Jadwal & Bayar Online'}
                </h3>
                <p className="text-xs text-espresso-900/70 leading-relaxed font-light">
                  {language === 'en'
                    ? 'Schedule your required delivery/pickup time slot with automated lead time rules and instant online checkout (Transfer, QRIS, & Card).'
                    : 'Tentukan tanggal pengambilan atau kirim alamat. Selesaikan pembayaran mudah via Transfer Bank, QRIS, atau Kartu.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cream-50 border border-oat-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-caramel-100 text-caramel-700 mx-auto flex items-center justify-center font-serif text-lg font-bold">
                  3
                </div>
                <h3 className="font-serif text-base font-bold text-cocoa-800">
                  {language === 'en' ? 'Fresh Handcrafted Delivery' : 'Pengantaran Segar & Terjaga'}
                </h3>
                <p className="text-xs text-espresso-900/70 leading-relaxed font-light">
                  {language === 'en'
                    ? 'Baked fresh on the morning of fulfillment and delivered in insulated temperature-controlled packaging.'
                    : 'Dipanggang segar di pagi hari pengantaran dan dikirim dengan packaging aman berinsulasi dingin.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PERKENALAN TOKO / PHILOSOPHY */}
        <section id="tentang-kami" className="py-16 lg:py-24 bg-oat-100/60 border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border border-oat-200 relative bg-oat-200">
                  <img
                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop"
                    alt="Artisan bakery craft"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-sage-600">
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t.philosophy.tag}</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800 leading-tight">
                  {t.philosophy.title}
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-espresso-900/80 font-light leading-relaxed">
                  <p>{t.philosophy.desc1}</p>
                  <p>{t.philosophy.desc2}</p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/kontak"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa-800 hover:text-caramel-600 transition-colors underline underline-offset-4"
                  >
                    <span>{t.philosophy.link}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KATEGORI PRODUK */}
        <section className="py-16 lg:py-20 border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold tracking-widest uppercase text-caramel-600 block">
                {t.categories.tag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800">
                {t.categories.title}
              </h2>
              <p className="text-sm text-espresso-900/70 font-light">
                {t.categories.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/produk?kategori=${cat.slug}`}
                  className="group p-5 rounded-2xl bg-white border border-oat-200 hover:border-caramel-400 hover:shadow-lg transition-all text-center flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-cream-100 text-cocoa-800 group-hover:bg-caramel-500 group-hover:text-cream-100 mx-auto flex items-center justify-center transition-colors">
                      <Wheat className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-cocoa-800 group-hover:text-caramel-600 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-[11px] text-espresso-900/60 mt-3 block group-hover:text-cocoa-800 font-medium">
                    {t.categories.viewCategory}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        {featuredProducts.length > 0 && (
          <section className="py-16 lg:py-24 bg-oat-100/30 border-b border-oat-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-caramel-600 block">
                    {t.featured.tag}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800">
                    {t.featured.title}
                  </h2>
                </div>
                <Link
                  href="/produk"
                  className="text-sm font-semibold text-cocoa-800 hover:text-caramel-600 flex items-center gap-1.5 transition-colors"
                >
                  <span>{t.featured.viewAll}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-oat-200 shadow-sm hover:shadow-xl transition-all flex flex-col"
                  >
                    {/* Image */}
                    <Link
                      href={`/produk/${prod.slug}`}
                      className="aspect-[4/3] bg-oat-100 overflow-hidden relative block"
                    >
                      {prod.main_image ? (
                        <img
                          src={prod.main_image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                          {t.productModal.photoLabel}
                        </div>
                      )}
                      {prod.badge && (
                        <span className="absolute top-4 left-4 bg-cocoa-800 text-cream-100 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {prod.badge}
                        </span>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-sage-600 block">
                          {prod.category?.name || 'Artisan Bakery'}
                        </span>
                        <Link href={`/produk/${prod.slug}`}>
                          <h3 className="font-serif text-xl font-bold text-cocoa-800 group-hover:text-caramel-600 transition-colors">
                            {prod.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-espresso-900/70 line-clamp-2 font-light leading-relaxed">
                          {prod.short_description || prod.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-oat-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-espresso-900/60 block">{t.catalog.startingFrom}</span>
                          <span className="font-serif text-lg font-bold text-cocoa-900">
                            {formatMoney(prod.base_price)}
                          </span>
                        </div>

                        <Link
                          href={`/produk/${prod.slug}`}
                          className="px-4 py-2 rounded-full bg-oat-200 hover:bg-caramel-500 hover:text-cream-100 text-cocoa-800 text-xs font-semibold transition-all shadow-xs"
                        >
                          {t.featured.viewDetail}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CUSTOMER REVIEWS & SOCIAL PROOF */}
        <section className="py-16 bg-white border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-caramel-600 block">
                {language === 'en' ? 'VOICES OF OUR PATRONS' : 'ULASAN PELANGGAN'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-cocoa-800">
                {language === 'en' ? 'Loved by Pastry Lovers & Event Hosts' : 'Dipercaya untuk Setiap Momen Spesial'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-cream-50 border border-oat-200 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-espresso-900/80 italic font-serif leading-relaxed">
                    &quot;The Valrhona chocolate cake was the absolute centerpiece of our corporate anniversary. The online checkout with seamless QRIS &amp; Card took under a minute.&quot;
                  </p>
                </div>
                <div className="border-t border-oat-200 pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-cocoa-900">Amanda R.</span>
                  <span className="text-espresso-900/50">Private Event Host</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-cream-50 border border-oat-200 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-espresso-900/80 italic font-serif leading-relaxed">
                    &quot;Best open-crumb sourdough we have had outside Paris. You can instantly taste the French Normandy butter and patience in fermentation.&quot;
                  </p>
                </div>
                <div className="border-t border-oat-200 pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-cocoa-900">Chef Marcus T.</span>
                  <span className="text-espresso-900/50">Culinary Consultant</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-cream-50 border border-oat-200 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-espresso-900/80 italic font-serif leading-relaxed">
                    &quot;The automated pre-order date selection is brilliant. Arrived in pristine refrigerated packaging with greeting cards included.&quot;
                  </p>
                </div>
                <div className="border-t border-oat-200 pt-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-cocoa-900">Claire D.</span>
                  <span className="text-espresso-900/50">Verified Order</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEASONAL CAMPAIGN SECTION */}
        {activeCampaign && (
          <section className="py-16 lg:py-24 bg-cocoa-800 text-cream-100 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  {activeCampaign.subtitle && (
                    <span className="inline-block px-3.5 py-1 rounded-full bg-caramel-500/20 text-caramel-300 text-xs font-bold tracking-widest uppercase border border-caramel-400/30">
                      {activeCampaign.subtitle}
                    </span>
                  )}
                  <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-cream-100 leading-tight">
                    {activeCampaign.title}
                  </h2>
                  <p className="text-base text-cream-100/80 font-light leading-relaxed max-w-xl">
                    {activeCampaign.description}
                  </p>

                  <div>
                    <Link
                      href={activeCampaign.cta_link || '/produk'}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-caramel-500 text-cream-100 font-semibold hover:bg-caramel-600 transition-all text-sm sm:text-base shadow-lg"
                    >
                      <span>{activeCampaign.cta_text || t.campaign.ctaFallback}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-cocoa-900">
                    <img
                      src={activeCampaign.banner_image}
                      alt={activeCampaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CLOSING CTA SECTION */}
        <section className="py-16 lg:py-20 text-center border-b border-oat-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800">
              {t.closingCta.title}
            </h2>
            <p className="text-sm sm:text-base text-espresso-900/70 font-light">
              {t.closingCta.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/produk"
                className="px-7 py-3.5 rounded-full bg-cocoa-800 text-cream-100 font-medium hover:bg-cocoa-900 transition-all text-sm shadow-md"
              >
                {t.closingCta.openCatalog}
              </Link>
              <Link
                href="/kontak"
                className="px-6 py-3.5 rounded-full border border-cocoa-800 text-cocoa-800 font-medium hover:bg-oat-200 transition-all text-sm"
              >
                {t.closingCta.contactWa}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
      <CartDrawer settings={settings} />
    </div>
  );
}