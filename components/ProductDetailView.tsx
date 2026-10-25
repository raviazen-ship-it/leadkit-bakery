'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  Calendar,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import CheckoutDrawer from '@/components/CheckoutDrawer';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import { Product, ProductVariant, BusinessSettings } from '@/types';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProductDetailViewProps {
  product: Product;
  settings?: BusinessSettings;
  relatedProducts?: Product[];
}

export default function ProductDetailView({
  product,
  settings,
  relatedProducts = [],
}: ProductDetailViewProps) {
  const { addItem, openCart, openCheckout } = useCart();
  const { t, formatMoney, language } = useLanguage();

  const defaultVariant =
    product.variants?.find((v) => v.is_default) ||
    product.variants?.[0] || {
      id: 'default',
      product_id: product.id,
      name: 'Pilihan Standar',
      price: product.base_price,
      is_default: true,
      is_available: true,
      display_order: 1,
    };

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');
  const [activeImage, setActiveImage] = useState(product.main_image);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const images = Array.from(new Set([product.main_image, ...(product.gallery || [])])).filter(Boolean);

  const isCakeCategory =
    product.category?.slug === 'cakes-celebration' ||
    product.category_id === 'cat_cakes' ||
    product.name.toLowerCase().includes('cake');

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(product, selectedVariant, quantity);
    openCheckout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 pb-20">
        {/* Breadcrumb */}
        <div className="bg-oat-100/60 border-b border-oat-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-espresso-900/60 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-cocoa-900 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/produk" className="hover:text-cocoa-900 transition-colors">
              Menu
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/produk?kategori=${product.category.slug}`}
                  className="hover:text-cocoa-900 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-cocoa-900 truncate max-w-xs">{product.name}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left 6 cols: Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-oat-100 border border-oat-200 shadow-sm relative">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                    Foto produk
                  </div>
                )}

                {product.badge && (
                  <span className="absolute top-4 left-4 bg-cocoa-800 text-cream-100 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.badge}
                  </span>
                )}
                {!product.is_available && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Sedang Habis
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img
                          ? 'border-caramel-500 ring-2 ring-caramel-400/40'
                          : 'border-oat-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan Quality Highlights */}
              <div className="bg-white p-5 rounded-2xl border border-oat-200 space-y-3 text-xs text-cocoa-800 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-cocoa-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan Kualitas Artisan Aura Bakery</span>
                </div>
                <ul className="space-y-1.5 text-espresso-900/80 leading-relaxed list-disc list-inside">
                  <li>Dibuat secara segar (made-to-order) menggunakan butter Prancis &amp; bahan premium alami.</li>
                  <li>Tanpa bahan pengawet sintetik, pewarna buatan, atau pemanis buatan.</li>
                  <li>Dikemas aman khusus hantaran dengan packaging food-grade ramah lingkungan.</li>
                </ul>
              </div>
            </div>

            {/* Right 6 cols: Info, Variants, & Action */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sage-600 block mb-1">
                  {product.category?.name || 'Artisan Bakery'}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-espresso-900/80 mt-2 font-light leading-relaxed">
                  {product.short_description || product.description}
                </p>
              </div>

              {/* Price display */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-espresso-900/60 block">Harga Terpilih</span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-900">
                    {formatMoney(selectedVariant.price)}
                  </span>
                </div>
                {product.min_preorder_days > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-caramel-50 text-caramel-800 text-xs font-semibold border border-caramel-200">
                    <Clock className="w-3.5 h-3.5 text-caramel-600" />
                    <span>Pre-order H-{product.min_preorder_days} ({product.prep_time_hours} jam)</span>
                  </div>
                )}
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-800">
                    Pilih Ukuran / Varian:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-cocoa-800 text-cream-100 border-cocoa-800 shadow-sm'
                              : 'bg-white hover:bg-cream-50 text-cocoa-900 border-oat-300'
                          }`}
                        >
                          <span className="font-semibold text-xs block">{v.name}</span>
                          <span
                            className={`text-xs font-bold mt-1 block ${
                              isSelected ? 'text-caramel-300' : 'text-caramel-700'
                            }`}
                          >
                            {formatMoney(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Cake Greeting Box (Only for cakes) */}
              {isCakeCategory && (
                <div className="p-4 rounded-2xl bg-caramel-50/60 border border-caramel-200/80 space-y-2">
                  <label className="block text-xs font-bold text-cocoa-900">
                    🎂 Pesan Ucapan di Atas Kue / Cokelat Plakat (Opsional):
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Contoh: Happy 30th Birthday Sarah! 🎉"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-caramel-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-caramel-500"
                  />
                  <div className="flex justify-between text-[11px] text-espresso-900/60">
                    <span>Maksimal 40 karakter</span>
                    <span>{customNote.length}/40</span>
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-oat-300 bg-white rounded-full p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full hover:bg-oat-100 flex items-center justify-center text-sm font-bold text-cocoa-800"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-cocoa-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full hover:bg-oat-100 flex items-center justify-center text-sm font-bold text-cocoa-800"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-espresso-900/60">
                    Total: <strong className="text-cocoa-900">{formatMoney(selectedVariant.price * quantity)}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.is_available}
                    className="py-3.5 px-6 rounded-full border-2 border-cocoa-800 hover:bg-cocoa-800 hover:text-cream-100 text-cocoa-800 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedSuccess ? 'Ditambahkan! ✓' : 'Tambah ke Keranjang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!product.is_available}
                    className="py-3.5 px-6 rounded-full bg-caramel-500 hover:bg-caramel-600 text-cream-100 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informational Accordion Cards */}
              <div className="space-y-3 pt-4 border-t border-oat-200">
                {product.allergens && (
                  <div className="p-4 rounded-2xl bg-white border border-oat-200 text-xs space-y-1">
                    <span className="font-bold text-cocoa-900 block flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-caramel-600" />
                      <span>Informasi Bahan &amp; Alergen:</span>
                    </span>
                    <p className="text-espresso-900/80 leading-relaxed">{product.allergens}</p>
                  </div>
                )}

                {product.storage_instructions && (
                  <div className="p-4 rounded-2xl bg-white border border-oat-200 text-xs space-y-1">
                    <span className="font-bold text-cocoa-900 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sage-600" />
                      <span>Petunjuk Penyimpanan &amp; Daya Tahan:</span>
                    </span>
                    <p className="text-espresso-900/80 leading-relaxed">{product.storage_instructions}</p>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white border border-oat-200 text-xs space-y-1">
                  <span className="font-bold text-cocoa-900 block flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-caramel-600" />
                    <span>Pilihan Pengiriman &amp; Ambil Sendiri:</span>
                  </span>
                  <p className="text-espresso-900/80 leading-relaxed">
                    Pengambilan langsung di toko Senopati (Selasa-Minggu 08.00-20.00 WIB) atau kurir instan berpendingin area Jabodetabek.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="bg-oat-100/50 border-t border-oat-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
                    Koleksi Serupa
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-cocoa-900">
                    Pilihan Artisan Lainnya
                  </h2>
                </div>
                <Link
                  href="/produk"
                  className="text-xs font-bold text-cocoa-800 hover:text-caramel-600 underline"
                >
                  Lihat Semua Menu &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/produk/${rel.slug}`}
                    className="bg-white rounded-3xl overflow-hidden border border-oat-200 shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-oat-100 overflow-hidden relative">
                      {rel.main_image && (
                        <img
                          src={rel.main_image}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {rel.badge && (
                        <span className="absolute top-3 left-3 bg-cocoa-800 text-cream-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {rel.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-sage-600 block">
                        {rel.category?.name || 'Artisan'}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-cocoa-900 line-clamp-1 group-hover:text-caramel-600 transition-colors">
                        {rel.name}
                      </h3>
                      <span className="text-xs font-bold text-caramel-700 block pt-1">
                        {formatMoney(rel.base_price)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />

      {/* Global Drawers */}
      <CartDrawer settings={settings} />
      <CheckoutDrawer settings={settings} />
      <OrderConfirmationModal settings={settings} />
    </div>
  );
}
