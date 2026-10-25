import React from 'react';
import { Metadata } from 'next';
import ContactPageClient from '@/components/ContactPageClient';
import { getBusinessSettings, getFAQs } from '@/lib/db/repository';

export const revalidate = 0; // Fresh contact and FAQ data

export const metadata: Metadata = {
  title: 'Kontak, Lokasi Toko & FAQ | Aura Artisan Bakery & Catering',
  description: 'Alamat toko Aura Bakery di Senopati Jakarta Selatan, jam operasional, pemesanan via WhatsApp, serta pertanyaan seputar pre-order, alergen, dan katering.',
};

export default async function KontakPage() {
  const [settings, faqs] = await Promise.all([
    getBusinessSettings(),
    getFAQs('all'),
  ]);

  // Schema.org FAQPage Structured Data for Google Rich Snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ContactPageClient
        initialSettings={settings}
        initialFaqs={faqs}
      />
    </>
  );
}
