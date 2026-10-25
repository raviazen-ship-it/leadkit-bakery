'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Truck,
  HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { BusinessSettings, FAQ } from '@/types';
import { formatWhatsAppNumber } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface ContactPageClientProps {
  initialSettings?: BusinessSettings;
  initialFaqs: FAQ[];
}

export default function ContactPageClient({
  initialSettings,
  initialFaqs,
}: ContactPageClientProps) {
  const [settings] = useState<BusinessSettings | undefined>(initialSettings);
  const [faqs] = useState<FAQ[]>(initialFaqs);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  const { t, language } = useLanguage();

  const storeName = settings?.store_name || 'Aura Artisan Bakery & Catering';
  const whatsapp = settings?.whatsapp_number || '6281234567890';
  const phone = settings?.phone_number || '021-5551234';
  const email = settings?.email || 'halo@aurabakery.id';
  const instagram = settings?.instagram_handle || '@aurabakery.id';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/aurabakery.id';
  const address = settings?.address || 'Jl. Senopati No. 42, Kebayoran Baru';
  const city = settings?.city || 'Jakarta Selatan';
  const postalCode = settings?.postal_code || '12190';
  const hours =
    language === 'en'
      ? 'Tuesday - Sunday: 08:00 AM - 08:00 PM (Monday Closed)'
      : settings?.business_hours || 'Selasa - Minggu: 08.00 - 20.00 WIB (Senin Tutup)';
  const mapsEmbed =
    settings?.google_maps_embed_url ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.28659103998!2d106.807464!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNDcuMCJTIDEwNsKwNDgnMjYuOSJF!5e0!3m2!1sid!2sid!4v1600000000000';
  const mapsShare =
    settings?.google_maps_share_url ||
    `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}`)}`;

  const cleanWa = formatWhatsAppNumber(whatsapp);
  const waContactUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    'Halo tim Aura Bakery, saya ingin bertanya seputar pemesanan cake / catering.'
  )}`;

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar settings={settings} />

      <main className="flex-1 pb-20">
        {/* Header */}
        <section className="bg-oat-100/70 border-b border-oat-200 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-cream-100 text-cocoa-800 text-xs font-semibold tracking-wide border border-oat-200">
              {t.contact.badge}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cocoa-800">
              {t.contact.title}
            </h1>
            <p className="text-sm sm:text-base text-espresso-900/70 max-w-2xl mx-auto font-light leading-relaxed">
              {t.contact.subtitle}
            </p>
          </div>
        </section>

        {/* Contact Cards & Map Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 5 Cols: Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-cocoa-800">
                    {t.contact.contactUs}
                  </h2>
                  <p className="text-xs text-espresso-900/70 mt-1">
                    {t.contact.contactDesc}
                  </p>
                </div>

                {/* WhatsApp Primary Button */}
                <a
                  href={waContactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] text-white font-bold hover:bg-[#20BE5C] transition-all shadow-md flex items-center justify-center gap-3 text-sm focus:ring-2 focus:ring-[#20BE5C]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{t.contact.chatWa}</span>
                </a>

                {/* Details List */}
                <div className="space-y-4 pt-2 text-sm border-t border-oat-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        {t.contact.hours}
                      </span>
                      <span className="text-xs text-espresso-900/80 leading-relaxed block mt-0.5">
                        {hours}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-cocoa-800 block">
                        {t.contact.phone}
                      </span>
                      <a
                        href={waContactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cocoa-900 font-semibold hover:text-caramel-600 block mt-0.5 underline"
                      >
                        +{cleanWa}
                      </a>
                      {phone && (
                        <span className="text-xs text-espresso-900/70 block mt-0.5">
                          {phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {email && (
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-cocoa-800 block">
                          {t.contact.email}
                        </span>
                        <a
                          href={`mailto:${email}`}
                          className="text-xs text-cocoa-900 hover:text-caramel-600 block mt-0.5"
                        >
                          {email}
                        </a>
                      </div>
                    </div>
                  )}

                  {instagram && (
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-caramel-100 text-caramel-700 flex items-center justify-center shrink-0">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-cocoa-800 block">
                          {t.contact.instagram}
                        </span>
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cocoa-900 hover:text-caramel-600 block mt-0.5"
                        >
                          {instagram}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup & Delivery Rules Card */}
              <div className="bg-oat-100/60 p-6 rounded-3xl border border-oat-200 space-y-3 text-xs text-cocoa-800">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Truck className="w-4 h-4 text-caramel-600" />
                  <span>{t.contact.pickupAndDelivery}</span>
                </div>
                <p className="leading-relaxed text-espresso-900/80">
                  {settings?.pickup_instructions ||
                    (language === 'en'
                      ? 'Order pickup is available directly at the Aura Bakery front counter during opening hours.'
                      : 'Pengambilan pesanan dapat dilakukan di konter toko pada jam buka.')}
                </p>
                <p className="leading-relaxed text-espresso-900/80 border-t border-oat-200/80 pt-2">
                  <strong>{t.checkout.deliveryAreaNotice}</strong>{' '}
                  {settings?.delivery_areas ||
                    (language === 'en'
                      ? 'Entire metropolitan area & suburbs.'
                      : 'Seluruh area Jakarta dan sekitarnya.')}
                </p>
              </div>
            </div>

            {/* Right 7 Cols: Google Maps & Address */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-oat-200 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-cocoa-800">
                      {t.contact.locationTitle}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-espresso-900/70 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-caramel-600 shrink-0" />
                      <span>
                        {address}, {city} {postalCode}
                      </span>
                    </div>
                  </div>

                  <a
                    href={mapsShare}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-caramel-500 text-caramel-700 hover:bg-caramel-500 hover:text-cream-100 text-xs font-semibold transition-all self-start sm:self-auto shrink-0"
                  >
                    <span>{t.contact.openMaps}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Google Maps Embed Iframe */}
                <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-oat-200 bg-oat-100 relative">
                  {mapsEmbed ? (
                    <iframe
                      src={mapsEmbed}
                      title={`Map location for ${storeName}`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 text-cocoa-800/60">
                      <MapPin className="w-8 h-8" />
                      <p className="text-xs">
                        Google Maps location has not been configured.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policies Note */}
              {(settings?.ordering_policy || settings?.cancellation_policy) && (
                <div className="p-6 rounded-3xl bg-white border border-oat-200 shadow-sm space-y-3 text-xs text-cocoa-800">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-sage-600" />
                    <span>{t.contact.policiesTitle}</span>
                  </div>
                  {settings.ordering_policy && (
                    <p className="leading-relaxed text-espresso-900/80">
                      <strong>{t.contact.orderingPolicy}</strong>{' '}
                      {settings.ordering_policy}
                    </p>
                  )}
                  {settings.cancellation_policy && (
                    <p className="leading-relaxed text-espresso-900/80 border-t border-oat-100 pt-2">
                      <strong>{t.contact.cancellationPolicy}</strong>{' '}
                      {settings.cancellation_policy}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-caramel-600">
              <HelpCircle className="w-4 h-4" />
              <span>{t.contact.faqTitle}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-cocoa-800">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-espresso-900/70 font-light">
              {t.contact.faqSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = activeFaqId === faq.id;
              return (
                <details
                  key={faq.id}
                  open={isOpen}
                  className="bg-white rounded-2xl border border-oat-200 overflow-hidden shadow-sm transition-all"
                >
                  <summary
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFaq(faq.id);
                    }}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-cream-50 transition-colors cursor-pointer list-none select-none"
                  >
                    <span className="font-serif text-base font-bold text-cocoa-800">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-caramel-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-espresso-900/80 font-light leading-relaxed border-t border-oat-100">
                    {faq.answer}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </main>

      <Footer settings={settings} />
      <CartDrawer settings={settings} />
    </div>
  );
}
