import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailView from '@/components/ProductDetailView';
import { getProduct, getBusinessSettings, getProducts } from '@/lib/db/repository';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | Aura Artisan Bakery',
    };
  }

  return {
    title: `${product.name} | Aura Artisan Bakery & Catering`,
    description: product.short_description || product.description,
    openGraph: {
      title: product.name,
      description: product.short_description || product.description,
      images: product.main_image ? [{ url: product.main_image }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProduct(slug),
    getBusinessSettings(),
  ]);

  if (!product) {
    notFound();
  }

  // Fetch 4 related products
  const allProducts = await getProducts({ availableOnly: true });
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || !product.category_id))
    .slice(0, 4);

  // Schema.org Product Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.main_image, ...(product.gallery || [])].filter(Boolean),
    description: product.short_description || product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: settings.store_name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://leadkit-bakery.vercel.app/produk/${product.slug}`,
      priceCurrency: 'IDR',
      price: product.base_price,
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        settings={settings}
        relatedProducts={related}
      />
    </>
  );
}
