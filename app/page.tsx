import React from 'react';
import HomePageClient from '@/components/HomePageClient';
import { getBusinessSettings, getCategories, getProducts, getActiveCampaign } from '@/lib/db/repository';

export const revalidate = 0; // Ensure fresh data when admin updates

export default async function HomePage() {
  const [settings, categories, featuredProducts, activeCampaign] = await Promise.all([
    getBusinessSettings(),
    getCategories(),
    getProducts({ featuredOnly: true, availableOnly: true }),
    getActiveCampaign(),
  ]);

  return (
    <HomePageClient
      settings={settings}
      categories={categories}
      featuredProducts={featuredProducts}
      activeCampaign={activeCampaign}
    />
  );
}