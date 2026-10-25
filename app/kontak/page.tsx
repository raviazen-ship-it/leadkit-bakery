import React from 'react';
import ContactPageClient from '@/components/ContactPageClient';
import { getBusinessSettings, getFAQs } from '@/lib/db/repository';

export const revalidate = 0; // Fresh contact and FAQ data

export default async function KontakPage() {
  const [settings, faqs] = await Promise.all([
    getBusinessSettings(),
    getFAQs('all'),
  ]);

  return (
    <ContactPageClient
      initialSettings={settings}
      initialFaqs={faqs}
    />
  );
}
