import React from 'react';
import ProductCatalogClient from '@/components/ProductCatalogClient';
import { getBusinessSettings, getCategories, getProducts } from '@/lib/db/repository';

export const revalidate = 0; // Fresh catalog data on every request

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams?.kategori || 'all';

  const [settings, categories, products] = await Promise.all([
    getBusinessSettings(),
    getCategories(),
    getProducts({ availableOnly: false }),
  ]);

  return (
    <ProductCatalogClient
      initialCategory={initialCategory}
      initialSettings={settings}
      initialCategories={categories}
      initialProducts={products}
    />
  );
}
