'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { BusinessSettings } from '@/types';

interface CartDrawerProps {
  settings?: BusinessSettings;
}

export default function CartDrawer({ settings }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    closeCart,
    openCheckout,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  const { t, formatMoney } = useLanguage();

  if (!isCartOpen) return null;

  const minOrder = settings?.min_order_amount ?? 50000;
  const isMinOrderMet = subtotal >= minOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-espresso-950/50 backdrop-blur-sm transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-oat-200 flex items-center justify-between bg-cream-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cocoa-800" />
              <h2 className="font-serif text-xl font-bold text-cocoa-800">
                {t.cart.title} ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close Cart"
              className="p-1.5 rounded-lg text-cocoa-800 hover:bg-oat-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-oat-200 text-cocoa-800 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-cocoa-800">
                    {t.cart.emptyTitle}
                  </h3>
                  <p className="text-sm text-espresso-900/70 max-w-xs font-light">
                    {t.cart.emptyDesc}
                  </p>
                </div>
                <Link
                  href="/produk"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-caramel-500 text-cream-100 font-medium hover:bg-caramel-600 transition-colors text-sm shadow-sm"
                >
                  <span>{t.cart.browseMenu}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedVariant.id}`}
                  className="flex gap-4 p-3.5 rounded-2xl bg-white border border-oat-200 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-oat-100 shrink-0 border border-oat-200 relative">
                    {item.product.main_image ? (
                      <img
                        src={item.product.main_image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                        Photo
                      </div>
                    )}
                  </div>

                  {/* Item Info & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-bold text-cocoa-800 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id, item.selectedVariant.id)}
                          className="text-espresso-900/40 hover:text-red-600 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-sage-600 font-medium mt-0.5">
                        {item.selectedVariant.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-oat-100">
                      <span className="text-sm font-semibold text-cocoa-800">
                        {formatMoney(item.selectedVariant.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-oat-200 rounded-lg bg-cream-50">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedVariant.id,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                          className="p-1 hover:bg-oat-200 rounded-l text-cocoa-800"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-espresso-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedVariant.id,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                          className="p-1 hover:bg-oat-200 rounded-r text-cocoa-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-oat-200 bg-cream-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-espresso-900/70">{t.cart.subtotal}</span>
                <span className="font-serif text-lg font-bold text-cocoa-800">
                  {formatMoney(subtotal)}
                </span>
              </div>

              {!isMinOrderMet && (
                <div className="p-2.5 rounded-lg bg-rose-200/60 border border-rose-300 text-xs text-cocoa-800">
                  {t.cart.minOrderAlert} {formatMoney(minOrder)}.
                </div>
              )}

              <p className="text-[11px] text-espresso-900/60 leading-tight">
                {t.cart.deliveryNotice}
              </p>

              <button
                disabled={!isMinOrderMet}
                onClick={openCheckout}
                className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-md ${
                  isMinOrderMet
                    ? 'bg-caramel-500 text-cream-100 hover:bg-caramel-600 focus:ring-2 focus:ring-caramel-400'
                    : 'bg-oat-300 text-espresso-900/40 cursor-not-allowed'
                }`}
              >
                <span>{t.cart.proceedCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}