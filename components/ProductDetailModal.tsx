'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Clock, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const { t, formatMoney } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultVar =
        product.variants?.find((v) => v.is_default && v.is_available) ||
        product.variants?.find((v) => v.is_available) ||
        product.variants?.[0] ||
        null;

      setSelectedVariant(defaultVar);
      setQuantity(1);
      setActiveImage(product.main_image);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const allImages = [
    product.main_image,
    ...(product.gallery || []).filter((img) => img !== product.main_image),
  ].filter(Boolean);

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
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
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
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

            {/* Preorder & Prep Time Info */}
            <div className="mt-5 p-3 rounded-xl bg-cream-100 border border-oat-200 space-y-1.5 text-xs text-cocoa-800/90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-caramel-600 shrink-0" />
                <span>
                  <strong>{t.productModal.preorderNotice}</strong>{' '}
                  {product.min_preorder_days > 0
                    ? `Min. ${product.min_preorder_days} ${t.catalog.days}`
                    : t.productModal.readyStock}
                </span>
              </div>
              {product.prep_time_hours > 0 && (
                <div className="text-[11px] text-espresso-900/70 pl-6">
                  {t.productModal.prepTime} {product.prep_time_hours} {t.productModal.hours}.
                </div>
              )}
            </div>
          </div>

          {/* Right: Info, Variant Selector & CTA */}
          <div className="p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {product.category && (
                <span className="text-[11px] font-bold tracking-widest uppercase text-sage-600 block">
                  {product.category.name}
                </span>
              )}
              <h3 className="font-serif text-2xl font-bold text-cocoa-800 leading-snug">
                {product.name}
              </h3>

              <div className="text-xl font-serif font-bold text-cocoa-900">
                {formatMoney(currentPrice)}
              </div>

              <p className="text-xs sm:text-sm text-espresso-900/80 leading-relaxed font-light">
                {product.description || product.short_description}
              </p>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider">
                    {t.productModal.selectVariant}
                  </label>
                  <div className="space-y-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!v.is_available}
                          onClick={() => setSelectedVariant(v)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
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

              {/* Allergen & Storage Notes */}
              {(product.allergens || product.storage_instructions) && (
                <div className="pt-3 border-t border-oat-200 space-y-2 text-xs">
                  {product.allergens && (
                    <div className="flex items-start gap-2 text-espresso-900/80">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{t.productModal.allergens}</strong> {product.allergens}
                      </span>
                    </div>
                  )}
                  {product.storage_instructions && (
                    <div className="flex items-start gap-2 text-espresso-900/80">
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
            <div className="pt-4 border-t border-oat-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-espresso-900">{t.productModal.quantity}</span>
                <div className="flex items-center border border-oat-300 rounded-xl bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-2 text-cocoa-800 hover:bg-oat-100 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-cocoa-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
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
                      {t.productModal.addToCart} {formatMoney(currentPrice * quantity)}
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