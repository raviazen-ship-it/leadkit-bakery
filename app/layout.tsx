import type { Metadata } from 'next';
import { DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aura Artisan Bakery & Catering | Freshly Made, Thoughtfully Baked',
  description:
    'Website pemesanan bakery artisan, slow-fermented sourdough, whole cake perayaan, dan katering higienis dengan cita rasa istimewa di Jakarta.',
  openGraph: {
    title: 'Aura Artisan Bakery & Catering',
    description: 'Freshly Made, Thoughtfully Baked. Temukan kue, roti, dan katering pilihan.',
    url: 'https://aurabakery.id',
    siteName: 'Aura Artisan Bakery',
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${dmSerif.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-cream-100 text-espresso-900 flex flex-col font-sans">
        <LanguageProvider>
          <CartProvider>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
