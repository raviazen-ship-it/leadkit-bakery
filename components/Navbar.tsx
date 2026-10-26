'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, ArrowRight, Store, Globe, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { BusinessSettings } from '@/types';

interface NavbarProps {
  settings?: BusinessSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { language, setLanguage, currency, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const announcementEnabled = settings?.announcement_enabled ?? true;
  const announcementText =
    language === 'en'
      ? t.announcement
      : settings?.announcement_text || t.announcement;

  const storeName = settings?.store_name || 'Aura Artisan Bakery';

  const navLinks = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.menu, href: '/produk' },
    { name: language === 'en' ? 'Track Order' : 'Lacak Pesanan', href: '/pesanan' },
    { name: t.nav.contact, href: '/kontak' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-oat-200 transition-all">
      {/* Announcement Bar */}
      {announcementEnabled && (
        <div className="bg-cocoa-800 text-cream-100 text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
            <span>{announcementText}</span>
            <Link
              href="/produk"
              className="underline hover:text-caramel-400 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              {t.announcementCta}
            </Link>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center shadow-sm group-hover:bg-caramel-600 transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cocoa-800 block leading-tight">
                {storeName}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-sage-600 block">
                Artisan Bakery & Catering
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive
                      ? 'text-caramel-600 font-semibold'
                      : 'text-espresso-900 hover:text-caramel-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-caramel-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Language Toggle, Cart & CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language & Currency Switcher Pill */}
            <button
              onClick={toggleLanguage}
              title="Switch Language & Currency"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-oat-300 bg-white hover:bg-oat-100 text-xs font-semibold text-cocoa-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-caramel-400"
            >
              <Globe className="w-3.5 h-3.5 text-caramel-600" />
              <span>{language === 'en' ? '🇺🇸 EN ($)' : '🇮🇩 ID (Rp)'}</span>
            </button>

            {/* User Account / Profile Button */}
            <Link
              href="/akun"
              title="Akun & Status Pesanan Pelanggan"
              className="p-2.5 rounded-full hover:bg-oat-200 text-cocoa-800 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-caramel-500"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label="Open Shopping Cart"
              className="relative p-2.5 rounded-full hover:bg-oat-200 text-cocoa-800 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-caramel-500"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-caramel-500 text-cream-100 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Desktop Order Button */}
            <Link
              href="/produk"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cocoa-800 text-cream-100 text-sm font-medium hover:bg-cocoa-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cocoa-700"
            >
              <span>{t.nav.orderNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open Navigation Menu"
              className="md:hidden p-2 rounded-lg text-cocoa-800 hover:bg-oat-200 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream-50 border-b border-oat-200 px-4 pt-4 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-oat-200 text-caramel-700 font-semibold'
                    : 'text-espresso-900 hover:bg-oat-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/akun"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
              pathname === '/akun' || pathname === '/login'
                ? 'bg-oat-200 text-caramel-700 font-semibold'
                : 'text-espresso-900 hover:bg-oat-100'
            }`}
          >
            <User className="w-4 h-4 text-caramel-600" />
            <span>Akun Pelanggan & Lacak Pesanan</span>
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-oat-300 bg-white text-cocoa-800 text-sm font-semibold hover:bg-oat-100 transition-colors"
            >
              <Globe className="w-4 h-4 text-caramel-600" />
              <span>{language === 'en' ? 'Switch to Indonesian (Rp)' : 'Switch to English ($ USD)'}</span>
            </button>
            <Link
              href="/produk"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cocoa-800 text-cream-100 font-medium hover:bg-cocoa-900 transition-colors"
            >
              <span>{t.nav.orderNow}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
