'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutDrawer from '@/components/CheckoutDrawer';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Product, Category, BusinessSettings } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

function ProdukContent() {
  const searchParams = useSearchParams();
  const initialCategorySlug = searchParams.get('kategori') || 'all';

  const [settings, setSettings] = useState<BusinessSettings | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modal state
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);

  const { openCart, itemCount } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [settRes, catRes, prodRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories'),
          fetch('/api/products'),
        ]);

        const settData = await settRes.json();
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (settData.success) setSettings(settData.data);
        if (catData.success) setCategories(catData.data);
        if (prodData.success) setProducts(prodData.data);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sync category param if URL changes
  useEffect(() => {
    const slug = searchParams.get('kategori');
    if (slug) {
      setSelectedCategory(slug);
    }
  }, [searchParams]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = (p.short_description || '').toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category?.slug !== selectedCategory && p.category_id !== selectedCategory) {
            return false;
          }
        }

        // Availability filter
        if (availableOnly && !p.is_available) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return a.display_order - b.display_order;
      });
  }, [products, searchQuery, selectedCategory, availableOnly, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 pb-20">
        {/* Catalog Hero / Header */}
        <section className="bg-oat-100/70 border-b border-oat-200 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-100 text-cocoa-800 text-xs font-semibold tracking-wide border border-oat-200">
              <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
              <span>Katalog Lengkap Bakery & Catering</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cocoa-800">
              Something Delicious Awaits
            </h1>

            <p className="text-sm sm:text-base text-espresso-900/70 max-w-2xl mx-auto font-light leading-relaxed">
              Pilih kue perayaan favorit, sourdough fermentasi alami, kue kering premium, dan paket catering untuk momen Anda.
            </p>

            {/* Search Bar */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 text-espresso-900/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama kue, roti, atau catering..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-full border border-oat-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-espresso-900/50 hover:text-espresso-900 font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Filter & Sort Controls */}
        <section className="sticky top-20 z-20 bg-cream-100/95 backdrop-blur-md border-b border-oat-200 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                    : 'bg-white border border-oat-200 text-cocoa-800 hover:bg-oat-100'
                }`}
              >
                Semua Kategori
              </button>

              {categories.map((c) => {
                const isSelected = selectedCategory === c.slug || selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                        : 'bg-white border border-oat-200 text-cocoa-800 hover:bg-oat-100'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            {/* Sort & Availability Toggle */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              {/* Ready Stock Filter */}
              <label className="flex items-center gap-2 text-xs text-cocoa-800 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded text-caramel-600 focus:ring-caramel-500"
                />
                <span>Hanya Tersedia</span>
              </label>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-oat-200 rounded-full px-3 py-1.5 shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5 text-espresso-900/50" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs text-cocoa-800 bg-transparent focus:outline-none font-medium cursor-pointer"
                >
                  <option value="default">Urutan Standar</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="name-asc">Nama (A - Z)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-4 border border-oat-200 animate-pulse space-y-3"
                >
                  <div className="aspect-[4/3] bg-oat-200 rounded-2xl" />
                  <div className="h-4 bg-oat-200 rounded w-2/3" />
                  <div className="h-3 bg-oat-100 rounded w-full" />
                  <div className="h-8 bg-oat-200 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-16 rounded-3xl bg-white border border-oat-200 text-center max-w-md mx-auto space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-oat-100 text-cocoa-800 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cocoa-800">
                Menu Tidak Ditemukan
              </h3>
              <p className="text-xs text-espresso-900/70">
                Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot; atau filter yang dipilih. Silakan coba kata kunci lain.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setAvailableOnly(false);
                }}
                className="px-5 py-2.5 rounded-full bg-caramel-500 text-cream-100 text-xs font-semibold hover:bg-caramel-600 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl overflow-hidden border border-oat-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  {/* Photo & Badge */}
                  <div>
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

                      {/* Promo Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {prod.badge && (
                          <span className="bg-cocoa-800 text-cream-100 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            {prod.badge}
                          </span>
                        )}
                        {!prod.is_available && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            Habis
                          </span>
                        )}
                      </div>

                      {/* Preorder lead badge */}
                      {prod.min_preorder_days > 0 && (
                        <span className="absolute bottom-3 right-3 bg-espresso-900/80 backdrop-blur-sm text-cream-100 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-caramel-400" />
                          <span>Pre-order {prod.min_preorder_days} Hari</span>
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sage-600 block">
                        {prod.category?.name || 'Artisan'}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-cocoa-800 group-hover:text-caramel-600 transition-colors line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-espresso-900/70 line-clamp-2 font-light leading-relaxed">
                        {prod.short_description || prod.description}
                      </p>

                      {/* Variant indication */}
                      {prod.variants && prod.variants.length > 1 && (
                        <span className="inline-block text-[11px] text-caramel-700 bg-caramel-50 px-2 py-0.5 rounded-md border border-caramel-200/60">
                          {prod.variants.length} Pilihan Ukuran/Varian
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="p-5 pt-0 border-t border-oat-100 mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-espresso-900/60 block">Mulai dari</span>
                      <span className="font-serif text-base font-bold text-cocoa-900">
                        {formatRupiah(prod.base_price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveProductForModal(prod)}
                      className="px-4 py-2 rounded-full bg-caramel-500 hover:bg-caramel-600 text-cream-100 text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 focus:ring-2 focus:ring-caramel-400"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Detail & Pesan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Floating Mobile Cart Bar */}
        {itemCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden animate-slideUp">
            <button
              onClick={openCart}
              className="w-full p-4 rounded-2xl bg-cocoa-800 text-cream-100 shadow-2xl flex items-center justify-between border border-cocoa-700 font-semibold text-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center text-xs font-bold">
                  {itemCount}
                </div>
                <span>Lihat Keranjang Pesanan</span>
              </div>
              <span className="text-caramel-300 font-serif font-bold">
                Lanjut &rarr;
              </span>
            </button>
          </div>
        )}
      </main>

      <Footer settings={settings} />

      {/* MODALS & DRAWERS (Preserving 3 Public Pages Architecture) */}
      <ProductDetailModal
        product={activeProductForModal}
        onClose={() => setActiveProductForModal(null)}
      />
      <CartDrawer settings={settings} />
      <CheckoutDrawer settings={settings} />
      <OrderConfirmationModal settings={settings} />
    </div>
  );
}

export default function ProdukPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <div className="text-sm font-serif text-cocoa-800 animate-pulse">
            Memuat Katalog Aura Bakery...
          </div>
        </div>
      }
    >
      <ProdukContent />
    </Suspense>
  );
}
