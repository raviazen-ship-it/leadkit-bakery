'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Check,
  Users,
  MapPin,
  CalendarCheck,
  Sparkles,
  Gift,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

const AVAILABLE_ADDONS: AddOnOption[] = [
  { id: 'addon_candle', name: 'Lilin Ulang Tahun Spiral Gold (1 set)', price: 15000 },
  { id: 'addon_wooden_knife', name: 'Pisau Kue Kayu Reusable', price: 10000 },
  { id: 'addon_card', name: 'Kartu Ucapan Handwritten Custom', price: 12000 },
  { id: 'addon_cooler_bag', name: 'Cooler Bag Foil Thermal Khusus Cake', price: 25000 },
];

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const { t, formatMoney } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const minQuantity = (() => {
    const match = product?.badge?.match(/min\.?\s*(\d+)/i);
    if (match) return parseInt(match[1], 10);
    if (product?.category_id === 'cat_catering' || product?.category?.slug === 'catering-event-boxes') return 5;
    return 1;
  })();

  const [quantity, setQuantity] = useState(minQuantity);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  // Addons state
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  // Date check state (CAT-08)
  const [checkDate, setCheckDate] = useState('');
  const [dateCheckResult, setDateCheckResult] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      const defaultVar =
        product.variants?.find((v) => v.is_default && v.is_available) ||
        product.variants?.find((v) => v.is_available) ||
        product.variants?.[0] ||
        null;

      setSelectedVariant(defaultVar);
      setQuantity(minQuantity);
      setActiveImage(product.main_image);
      setIsAdded(false);
      setSelectedAddons({});
      setDateCheckResult(null);

      // Pre-fill tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + Math.max(1, product.min_preorder_days || 1));
      setCheckDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [product, minQuantity]);

  if (!product) return null;

  const allImages = [
    product.main_image,
    ...(product.gallery || []).filter((img) => img !== product.main_image),
  ].filter(Boolean);

  const basePrice = selectedVariant ? selectedVariant.price : product.base_price;
  const addonsTotal = AVAILABLE_ADDONS.reduce((acc, addon) => {
    return selectedAddons[addon.id] ? acc + addon.price : acc;
  }, 0);
  const currentTotalPrice = (basePrice + addonsTotal) * quantity;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => ({
      ...prev,
      [addonId]: !prev[addonId],
    }));
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    // Attach chosen addons to variant name/note
    const addonNames = AVAILABLE_ADDONS.filter((a) => selectedAddons[a.id]).map((a) => a.name);
    const customizedVariant = {
      ...selectedVariant,
      name: addonNames.length > 0 ? `${selectedVariant.name} (+ ${addonNames.join(', ')})` : selectedVariant.name,
      price: selectedVariant.price + addonsTotal,
    };

    addItem(product, customizedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  const handleVerifyDate = () => {
    if (!checkDate) return;
    const target = new Date(`${checkDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < (product.min_preorder_days || 1)) {
      setDateCheckResult(`⚠️ Produk ini memerlukan pre-order minimal ${product.min_preorder_days || 1} hari sebelumnya.`);
    } else {
      setDateCheckResult(`✅ Tanggal ${checkDate} tersedia untuk slot produksi & pengiriman!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream-50 rounded-3xl max-w-2xl w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn my-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cream-100/90 text-cocoa-800 hover:bg-white shadow-sm transition-all focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Image & Gallery */}
          <div className="bg-oat-100 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-oat-200">
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-oat-200 shadow-sm relative">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-cocoa-800/40">
                    {t.productModal.photoLabel}
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-cocoa-800 text-cream-100 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 mt-3.5 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === img
                          ? 'border-caramel-500 ring-2 ring-caramel-300'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preorder & Lead Time Info */}
            <div className="mt-5 p-3 rounded-xl bg-cream-100 border border-oat-200 space-y-2 text-xs text-cocoa-800/90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                <span>
                  <strong>{t.productModal.preorderNotice}</strong>{' '}
                  {product.min_preorder_days > 0
                    ? `Min. ${product.min_preorder_days} Hari Sebelumnya (Cutoff 15.00 WIB)`
                    : 'Tersedia Fresh Hari Ini (Ready Stock)'}
                </span>
              </div>

              {/* CAT-08 Cek Tanggal Interaktif */}
              <div className="pt-2 border-t border-oat-200/60">
                <label className="block text-[11px] font-semibold text-espresso-900 mb-1">
                  Cek Ketersediaan Tanggal:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-oat-300 bg-white focus:outline-none focus:ring-1 focus:ring-caramel-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyDate}
                    className="px-2.5 py-1 text-xs rounded-lg bg-cocoa-800 text-cream-100 font-semibold hover:bg-cocoa-900"
                  >
                    Cek
                  </button>
                </div>
                {dateCheckResult && (
                  <p className="mt-1 text-[11px] font-medium text-cocoa-900 leading-tight">
                    {dateCheckResult}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info, Variant Selector, Addons & CTA */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-widest uppercase text-sage-600 block">
                  {product.category?.name || 'Artisan Bakery'}
                </span>
                {/* Portions Indicator (CAT-11) */}
                <span className="text-[11px] text-espresso-900/70 flex items-center gap-1 font-medium bg-oat-200/50 px-2.5 py-0.5 rounded-full">
                  <Users className="w-3.5 h-3.5 text-caramel-600" />
                  <span>Porsi: 6-10 Orang</span>
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-cocoa-800 leading-snug">
                {product.name}
              </h3>

              <div className="text-xl font-serif font-bold text-cocoa-900">
                {formatMoney(currentTotalPrice)}
              </div>

              <p className="text-xs sm:text-sm text-espresso-900/80 leading-relaxed font-light">
                {product.description || product.short_description}
              </p>

              {/* Variant Selector (CAT-07) */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider">
                    {t.productModal.selectVariant}
                  </label>
                  <div className="space-y-1.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!v.is_available}
                          onClick={() => setSelectedVariant(v)}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            !v.is_available
                              ? 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200'
                              : isSelected
                              ? 'border-caramel-500 bg-caramel-50/60 ring-2 ring-caramel-400 font-semibold'
                              : 'border-oat-200 bg-white hover:border-oat-300'
                          }`}
                        >
                          <span className="text-cocoa-800">{v.name}</span>
                          <span className="font-serif font-bold text-cocoa-900">
                            {formatMoney(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons Selector (CAT-14) */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-caramel-600" />
                  <span>Tambahan / Add-ons Spesial (Opsional):</span>
                </label>
                <div className="space-y-1.5">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isChecked = Boolean(selectedAddons[addon.id]);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-50 border-amber-300 text-cocoa-900 font-medium'
                            : 'bg-white border-oat-200 text-espresso-900/80 hover:bg-oat-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAddon(addon.id)}
                            className="rounded text-caramel-600 focus:ring-caramel-500 border-oat-300"
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-serif font-semibold text-cocoa-800">
                          +{formatMoney(addon.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Allergen & Storage Notes (CAT-10, BR-14) */}
              {(product.allergens || product.storage_instructions) && (
                <div className="pt-3 border-t border-oat-200 space-y-1.5 text-xs">
                  {product.allergens && (
                    <div className="flex items-start gap-2 text-espresso-900/80 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>{t.productModal.allergens}</strong> {product.allergens}
                        <p className="text-[10px] text-amber-800/80 mt-0.5 font-light">
                          *Peringatan Kontaminasi Silang: Diproduksi di dapur yang juga mengolah kacang, susu, telur, dan gandum.
                        </p>
                      </div>
                    </div>
                  )}
                  {product.storage_instructions && (
                    <div className="flex items-start gap-2 text-espresso-900/80 p-1">
                      <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.productModal.storage}</strong> {product.storage_instructions}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector & Add Button */}
            <div className="pt-3 border-t border-oat-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-espresso-900">{t.productModal.quantity}</span>
                  {minQuantity > 1 && (
                    <span className="block text-[10px] text-caramel-600 font-medium">Min. {minQuantity} box/porsi</span>
                  )}
                </div>
                <div className="flex items-center border border-oat-300 rounded-xl bg-white shadow-sm">
                  <button
                    type="button"
                    disabled={quantity <= minQuantity}
                    onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                    aria-label="Kurangi jumlah"
                    className="p-2 text-cocoa-800 hover:bg-oat-100 rounded-l-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-cocoa-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Tambah jumlah"
                    className="p-2 text-cocoa-800 hover:bg-oat-100 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={!product.is_available || !selectedVariant}
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-sm transition-all shadow-md ${
                  !product.is_available
                    ? 'bg-oat-300 text-espresso-900/40 cursor-not-allowed'
                    : isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-caramel-500 text-cream-100 hover:bg-caramel-600 focus:ring-2 focus:ring-caramel-400'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t.productModal.addedSuccess}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      {t.productModal.addToCart} {formatMoney(currentTotalPrice)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
