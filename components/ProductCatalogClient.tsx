'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Clock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldAlert,
  Users,
  Check,
  Info,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutDrawer from '@/components/CheckoutDrawer';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Product, Category, BusinessSettings } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCatalogClientProps {
  initialCategory?: string;
  initialSettings?: BusinessSettings;
  initialCategories: Category[];
  initialProducts: Product[];
}

type AllergenFilter = 'all' | 'nut-free' | 'dairy-free' | 'egg-free' | 'gluten-free';

export default function ProductCatalogClient({
  initialCategory = 'all',
  initialSettings,
  initialCategories,
  initialProducts,
}: ProductCatalogClientProps) {
  const [settings] = useState<BusinessSettings | undefined>(initialSettings);
  const [categories] = useState<Category[]>(initialCategories);
  const [products] = useState<Product[]>(initialProducts);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedAllergen, setSelectedAllergen] = useState<AllergenFilter>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modal state
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);

  const { openCart, itemCount } = useCart();
  const { t, formatMoney, language } = useLanguage();

  // Read URL query params on mount and popstate (CAT-01)
  useEffect(() => {
    const parseUrlParams = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('kategori')) setSelectedCategory(params.get('kategori')!);
      if (params.get('q')) setSearchQuery(params.get('q')!);
      if (params.get('sort')) setSortBy(params.get('sort') as any);
      if (params.get('alergen')) setSelectedAllergen(params.get('alergen') as AllergenFilter);
      if (params.get('stok') === '1') setAvailableOnly(true);
    };

    parseUrlParams();
    window.addEventListener('popstate', parseUrlParams);
    return () => window.removeEventListener('popstate', parseUrlParams);
  }, []);

  // Update URL search params cleanly (CAT-01)
  const updateUrlParams = (
    cat: string,
    q: string,
    sort: string,
    allergen: AllergenFilter,
    availOnly: boolean
  ) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (cat !== 'all') params.set('kategori', cat);
    if (q.trim()) params.set('q', q.trim());
    if (sort !== 'default') params.set('sort', sort);
    if (allergen !== 'all') params.set('alergen', allergen);
    if (availOnly) params.set('stok', '1');

    const queryString = params.toString();
    const newUrl = queryString ? `/produk?${queryString}` : '/produk';
    window.history.pushState(null, '', newUrl);
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategory(slug);
    updateUrlParams(slug, searchQuery, sortBy, selectedAllergen, availableOnly);
  };

  const handleAllergenChange = (allergen: AllergenFilter) => {
    setSelectedAllergen(allergen);
    updateUrlParams(selectedCategory, searchQuery, sortBy, allergen, availableOnly);
  };

  const handleSortChange = (newSort: any) => {
    setSortBy(newSort);
    updateUrlParams(selectedCategory, searchQuery, newSort, selectedAllergen, availableOnly);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateUrlParams(selectedCategory, val, sortBy, selectedAllergen, availableOnly);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAllergen('all');
    setSortBy('default');
    setAvailableOnly(false);
    updateUrlParams('all', '', 'default', 'all', false);
  };

  // Filter & sort products (CAT-02, CAT-10, T-CAT-06, T-CAT-13)
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

        // Allergen filter (CAT-02 & T-CAT-13)
        if (selectedAllergen !== 'all') {
          const rawAllergens = (p.allergens || '').toLowerCase();
          const hasAllergen = (keywords: string[]) => {
            for (const kw of keywords) {
              if (rawAllergens.includes(kw)) {
                const isNegated = rawAllergens.includes(`tanpa ${kw}`) || rawAllergens.includes(`bebas ${kw}`);
                if (!isNegated) return true;
              }
            }
            return false;
          };

          if (selectedAllergen === 'nut-free') {
            if (hasAllergen(['kacang', 'nut', 'almond'])) return false;
          } else if (selectedAllergen === 'dairy-free') {
            if (hasAllergen(['susu', 'dairy', 'butter', 'keju'])) return false;
          } else if (selectedAllergen === 'egg-free') {
            if (hasAllergen(['telur', 'egg'])) return false;
          } else if (selectedAllergen === 'gluten-free') {
            if (hasAllergen(['gluten', 'gandum', 'tepung'])) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.base_price - b.base_price;
        if (sortBy === 'price-desc') return b.base_price - a.base_price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return a.display_order - b.display_order;
      });
  }, [products, searchQuery, selectedCategory, availableOnly, selectedAllergen, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 pb-20">
        {/* Catalog Hero / Header */}
        <section className="bg-oat-100/70 border-b border-oat-200 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-100 text-cocoa-800 text-xs font-semibold tracking-wide border border-oat-200">
              <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
              <span>{t.catalog.badge}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cocoa-800">
              {t.catalog.title}
            </h1>

            <p className="text-sm sm:text-base text-espresso-900/70 max-w-2xl mx-auto font-light leading-relaxed">
              {t.catalog.subtitle}
            </p>

            {/* STO-16 Staging / Demo Status Badge */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-medium">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Mode Preview: Seluruh harga dan spesifikasi menggunakan mata uang resmi IDR (Rupiah).</span>
              </span>
            </div>
          </div>
        </section>

        {/* Filter, Search & Controls Section */}
        <section className="sticky top-20 z-30 bg-cream-100/95 backdrop-blur-md border-b border-oat-200 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
            {/* Top row: Search input & sorting */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t.catalog.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-oat-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-caramel-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-espresso-900/40 hover:text-espresso-900"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Controls: Allergen filter, In Stock Only & Sort dropdown */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Allergen Filter Dropdown (CAT-02 & CAT-10) */}
                <div className="flex items-center gap-1.5 bg-white border border-oat-300 rounded-full px-3 py-1.5 shadow-2xs text-xs text-cocoa-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <select
                    value={selectedAllergen}
                    onChange={(e: any) => handleAllergenChange(e.target.value)}
                    className="bg-transparent focus:outline-none font-medium cursor-pointer"
                    aria-label="Filter Alergen"
                  >
                    <option value="all">Semua Alergen</option>
                    <option value="nut-free">Bebas Kacang (Nut-Free)</option>
                    <option value="dairy-free">Bebas Susu/Dairy</option>
                    <option value="egg-free">Bebas Telur</option>
                    <option value="gluten-free">Bebas Gluten / Vegan</option>
                  </select>
                </div>

                {/* Available Only Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-cocoa-800 select-none bg-white border border-oat-300 px-3 py-1.5 rounded-full shadow-2xs">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => {
                      setAvailableOnly(e.target.checked);
                      updateUrlParams(selectedCategory, searchQuery, sortBy, selectedAllergen, e.target.checked);
                    }}
                    className="w-3.5 h-3.5 rounded text-caramel-600 focus:ring-caramel-500 border-oat-300"
                  />
                  <span>{t.catalog.availableOnly}</span>
                </label>

                {/* Sort Dropdown (T-CAT-06) */}
                <div className="flex items-center gap-1.5 bg-white border border-oat-300 rounded-full px-3 py-1.5 shadow-2xs text-xs text-cocoa-800">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-caramel-600" />
                  <select
                    value={sortBy}
                    onChange={(e: any) => handleSortChange(e.target.value)}
                    className="bg-transparent focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="default">{t.catalog.sortDefault}</option>
                    <option value="price-asc">{t.catalog.sortPriceAsc}</option>
                    <option value="price-desc">{t.catalog.sortPriceDesc}</option>
                    <option value="name-asc">{t.catalog.sortNameAsc}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                  selectedCategory === 'all'
                    ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                    : 'bg-white text-espresso-900/70 hover:bg-oat-200 border border-oat-300'
                }`}
              >
                {t.catalog.allCategories} ({products.length})
              </button>

              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.category?.slug === cat.slug || p.category_id === cat.id
                ).length;
                const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-cocoa-800 text-cream-100 shadow-sm'
                        : 'bg-white text-espresso-900/70 hover:bg-oat-200 border border-oat-300'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Grid Area */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-oat-200 p-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-oat-100 text-cocoa-800 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cocoa-800">
                {t.catalog.notFoundTitle}
              </h3>
              <p className="text-xs text-espresso-900/70 font-light">
                {t.catalog.notFoundDesc}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-caramel-500 text-cream-100 text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm"
              >
                {t.catalog.resetFilters}
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
                    <Link
                      href={`/produk/${prod.slug}`}
                      className="block aspect-[4/3] bg-oat-100 overflow-hidden relative"
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

                      {/* Promo Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {prod.badge && (
                          <span className="bg-cocoa-800 text-cream-100 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            {prod.badge}
                          </span>
                        )}
                        {!prod.is_available && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            {t.catalog.outOfStock}
                          </span>
                        )}
                      </div>

                      {/* Preorder lead badge */}
                      {prod.min_preorder_days > 0 ? (
                        <span className="absolute bottom-3 right-3 bg-espresso-900/80 backdrop-blur-sm text-cream-100 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-caramel-400" />
                          <span>Pre-order {prod.min_preorder_days} Hari</span>
                        </span>
                      ) : (
                        <span className="absolute bottom-3 right-3 bg-emerald-800/80 backdrop-blur-sm text-cream-100 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Ready Stock Hari Ini</span>
                        </span>
                      )}
                    </Link>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sage-600 block">
                          {prod.category?.name || 'Artisan'}
                        </span>
                        {/* Portions Indicator (CAT-11) */}
                        {prod.category_id === 'cat_cakes' && (
                          <span className="text-[10px] text-espresso-900/60 flex items-center gap-1">
                            <Users className="w-3 h-3 text-caramel-600" />
                            <span>Porsi: 6-10 Orang</span>
                          </span>
                        )}
                      </div>

                      <Link href={`/produk/${prod.slug}`}>
                        <h3 className="font-serif text-lg font-bold text-cocoa-800 group-hover:text-caramel-600 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-espresso-900/70 line-clamp-2 font-light leading-relaxed">
                        {prod.short_description || prod.description}
                      </p>

                      {/* Variant indication & Allergens badge (CAT-10) */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prod.variants && prod.variants.length > 1 && (
                          <span className="inline-block text-[10px] text-caramel-700 bg-caramel-50 px-2 py-0.5 rounded-md border border-caramel-200/60 font-medium">
                            {prod.variants.length} Pilihan Ukuran
                          </span>
                        )}
                        {prod.allergens && (
                          <span className="inline-block text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-medium">
                            {prod.allergens.toLowerCase().includes('kacang') ? 'Ada Kacang' : 'Tanpa Kacang'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA Buttons */}
                  <div className="p-5 pt-0 border-t border-oat-100 mt-3 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-espresso-900/60 block">{t.catalog.startingFrom}</span>
                      <span className="font-serif text-base font-bold text-cocoa-900">
                        {formatMoney(prod.base_price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/produk/${prod.slug}`}
                        className="p-2 rounded-full border border-oat-300 hover:bg-oat-100 text-cocoa-800 text-xs transition-colors"
                        title="Lihat Detail Halaman"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setActiveProductForModal(prod)}
                        className="px-3.5 py-2 rounded-full bg-caramel-500 hover:bg-caramel-600 text-cream-100 text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 focus:ring-2 focus:ring-caramel-400"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t.catalog.detailAndOrder}</span>
                      </button>
                    </div>
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
                <span>{t.catalog.viewCartFloat}</span>
              </div>
              <span className="text-caramel-300 font-serif font-bold">
                &rarr;
              </span>
            </button>
          </div>
        )}
      </main>

      <Footer settings={settings} />

      {/* MODALS & DRAWERS */}
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
