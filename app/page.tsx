import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, HeartHandshake, Wheat, ShieldCheck, Clock, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { getBusinessSettings, getCategories, getProducts, getActiveCampaign } from '@/lib/db/repository';
import { formatRupiah } from '@/lib/utils';

export const revalidate = 0; // Ensure fresh data when admin updates

export default async function HomePage() {
  const [settings, categories, featuredProducts, activeCampaign] = await Promise.all([
    getBusinessSettings(),
    getCategories(),
    getProducts({ featuredOnly: true, availableOnly: true }),
    getActiveCampaign(),
  ]);

  const heroHeadline = settings.hero_headline || 'Cita Rasa Artisan untuk Setiap Momen Spesial';
  const heroDescription =
    settings.hero_description ||
    'Temukan kue perayaan artisan, roti sourdough segar harian, dan paket catering pilihan yang dibuat dengan ketulusan dan bahan terbaik.';
  const heroEyebrow = settings.hero_eyebrow || 'Freshly Made, Thoughtfully Baked';
  const heroImage =
    settings.hero_image_url ||
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1">
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
                    <span>Jelajahi Menu Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#tentang-kami"
                    className="px-6 py-3.5 rounded-full border border-cocoa-800/30 text-cocoa-800 font-medium hover:bg-oat-200 transition-colors text-sm sm:text-base"
                  >
                    Kenali Toko Kami
                  </a>
                </div>

                {/* Micro Trust Points */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-oat-200 text-xs text-cocoa-800/80">
                  <div className="flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-caramel-600 shrink-0" />
                    <span>Pure French Butter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
                    <span>Tanpa Pengawet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                    <span>Fresh Harian</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-oat-200 relative">
                    <img
                      src={heroImage}
                      alt={settings.store_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Floating Highlight Card */}
                  <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-oat-200 hidden sm:flex items-center gap-3 max-w-xs">
                    <div className="w-10 h-10 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        Slow-Fermentation Craft
                      </span>
                      <span className="text-[11px] text-espresso-900/70 block leading-tight">
                        Fermentasi hingga 36 jam untuk tekstur roti terbaik.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERKENALAN TOKO */}
        <section id="tentang-kami" className="py-16 lg:py-24 bg-oat-100/60 border-b border-oat-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border border-oat-200 relative bg-oat-200">
                  <img
                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop"
                    alt="Proses pembuatan roti"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-sage-600">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Filosofi & Nilai Kami</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800 leading-tight">
                  Ketulusan pada Setiap Lapisan Adonan & Hidangan Perayaan
                </h2>

                <div className="space-y-4 text-sm sm:text-base text-espresso-900/80 font-light leading-relaxed">
                  <p>
                    {settings.store_name} berawal dari kecintaan sederhana terhadap aroma roti yang baru keluar dari pemanggang. Kami percaya bahwa makanan yang lezat berasal dari rasa hormat terhadap bahan baku dan kesabaran dalam setiap prosesnya.
                  </p>
                  <p>
                    Setiap whole cake, croissant, dan hidangan catering kami diracik menggunakan butter berkualitas, ragi alami starter liar, dan bahan lokal segar tanpa pengawet sintetik. Baik perayaan ulang tahun keluarga, bingkisan perayaan, maupun santap bersama di kantor, kami hadir membawa kehangatan yang berkesan.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/kontak"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa-800 hover:text-caramel-600 transition-colors underline underline-offset-4"
                  >
                    <span>Kunjungi Dapur & Lokasi Toko Kami</span>
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
                Pilihan Menu
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800">
                Jelajahi Berdasarkan Kategori
              </h2>
              <p className="text-sm text-espresso-900/70 font-light">
                Dari whole cake perayaan hingga roti fermentasi harian dan paket meal box.
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
                    Lihat Produk &rarr;
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
                    Pilihan Favorit
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-800">
                    Produk Unggulan Toko
                  </h2>
                </div>
                <Link
                  href="/produk"
                  className="text-sm font-semibold text-cocoa-800 hover:text-caramel-600 flex items-center gap-1.5 transition-colors"
                >
                  <span>Lihat Seluruh Katalog</span>
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
                    <div className="aspect-[4/3] bg-oat-100 overflow-hidden relative">
                      {prod.main_image ? (
                        <img
                          src={prod.main_image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                          Foto Produk
                        </div>
                      )}
                      {prod.badge && (
                        <span className="absolute top-4 left-4 bg-cocoa-800 text-cream-100 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-sage-600 block">
                          {prod.category?.name || 'Artisan Bakery'}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-cocoa-800 group-hover:text-caramel-600 transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-espresso-900/70 line-clamp-2 font-light leading-relaxed">
                          {prod.short_description || prod.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-oat-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-espresso-900/60 block">Harga</span>
                          <span className="font-serif text-lg font-bold text-cocoa-900">
                            {formatRupiah(prod.base_price)}
                          </span>
                        </div>

                        <Link
                          href="/produk"
                          className="px-4 py-2 rounded-full bg-oat-200 hover:bg-caramel-500 hover:text-cream-100 text-cocoa-800 text-xs font-semibold transition-all"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
                      <span>{activeCampaign.cta_text || 'Pesan Paket Sekarang'}</span>
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
              Temukan Hidangan Istimewa untuk Perayaan Anda Berikutnya
            </h2>
            <p className="text-sm sm:text-base text-espresso-900/70 font-light">
              Pesan secara praktis melalui website kami atau konsultasikan kebutuhan paket katering Anda langsung dengan tim kami.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/produk"
                className="px-7 py-3.5 rounded-full bg-cocoa-800 text-cream-100 font-medium hover:bg-cocoa-900 transition-all text-sm shadow-md"
              >
                Buka Katalog Produk
              </Link>
              <Link
                href="/kontak"
                className="px-6 py-3.5 rounded-full border border-cocoa-800 text-cocoa-800 font-medium hover:bg-oat-200 transition-all text-sm"
              >
                Hubungi Kami di WhatsApp
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
