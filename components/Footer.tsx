'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Phone, Mail, MapPin, Clock, Instagram, Lock } from 'lucide-react';
import { BusinessSettings } from '@/types';
import { formatWhatsAppNumber } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface FooterProps {
  settings?: BusinessSettings;
}

export default function Footer({ settings }: FooterProps) {
  const { t, language } = useLanguage();

  const storeName = settings?.store_name || 'Aura Artisan Bakery & Catering';
  const description =
    language === 'en'
      ? 'Artisan bakery & boutique catering crafted with pure French butter, slow fermentation, and zero artificial preservatives.'
      : settings?.description ||
        'Artisan bakery & catering dengan bahan segar berkualitas tinggi untuk setiap perayaan istimewa Anda.';

  const whatsapp = settings?.whatsapp_number || '6281234567890';
  const phone = settings?.phone_number || '021-5551234';
  const email = settings?.email || 'halo@aurabakery.id';
  const address = settings?.address || 'Jl. Senopati No. 42, Kebayoran Baru';
  const city = settings?.city || 'Jakarta Selatan';
  const hours =
    language === 'en'
      ? 'Tuesday - Sunday: 08:00 AM - 08:00 PM (Monday Closed)'
      : settings?.business_hours || 'Selasa - Minggu: 08.00 - 20.00 WIB (Senin Tutup)';
  const instagram = settings?.instagram_handle || '@aurabakery.id';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/aurabakery.id';

  const cleanWa = formatWhatsAppNumber(whatsapp);
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    'Halo Aura Bakery, saya ingin bertanya tentang menu dan pemesanan.'
  )}`;

  return (
    <footer className="bg-espresso-950 text-cream-100 border-t border-espresso-800 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-espresso-800/80">
          {/* Col 1: Store Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-cream-100 block">
                  {storeName}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-300 block">
                  Artisan Bakery & Catering
                </span>
              </div>
            </div>
            <p className="text-sm text-cream-100/80 leading-relaxed font-light">
              {description}
            </p>
            {instagram && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-caramel-400 hover:text-caramel-300 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>{instagram}</span>
              </a>
            )}
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-cream-100 tracking-wide">
              {t.footer.navigation}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-cream-100/80 hover:text-caramel-400 transition-colors"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/produk"
                  className="text-cream-100/80 hover:text-caramel-400 transition-colors"
                >
                  {t.nav.menu}
                </Link>
              </li>
              <li>
                <Link
                  href="/kontak"
                  className="text-cream-100/80 hover:text-caramel-400 transition-colors"
                >
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link
                  href="/pesanan"
                  className="text-cream-100/80 hover:text-caramel-400 transition-colors"
                >
                  {language === 'en' ? 'Track Order' : 'Lacak Status Pesanan'}
                </Link>
              </li>
              <li>
                <Link
                  href="/akun"
                  className="text-cream-100/80 hover:text-caramel-400 transition-colors"
                >
                  {language === 'en' ? 'Customer Account' : 'Akun Pelanggan'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-cream-100 tracking-wide">
              {t.footer.contactAndHours}
            </h3>
            <ul className="space-y-3 text-sm text-cream-100/80">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-caramel-400 shrink-0 mt-0.5" />
                <span>{hours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-caramel-400 shrink-0" />
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-caramel-400 underline transition-colors"
                >
                  WhatsApp: +{cleanWa}
                </a>
              </li>
              {phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-caramel-400 shrink-0" />
                  <span>{t.contact.phone}: {phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-caramel-400 shrink-0" />
                  <span>{email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Store Location & Maps CTA */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-cream-100 tracking-wide">
              {t.footer.storeLocation}
            </h3>
            <div className="flex items-start gap-2.5 text-sm text-cream-100/80">
              <MapPin className="w-4 h-4 text-caramel-400 shrink-0 mt-0.5" />
              <span>
                {address}, {city}
              </span>
            </div>
            <Link
              href="/kontak"
              className="inline-block mt-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border border-caramel-500/60 text-caramel-400 hover:bg-caramel-500 hover:text-cream-100 transition-all"
            >
              {t.contact.openMaps}
            </Link>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-100/60 font-light">
          <p>
            &copy; {new Date().getFullYear()} {storeName}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-cream-100/60 hover:text-caramel-400 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.footer.adminPortal}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}