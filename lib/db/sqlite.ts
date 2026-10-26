import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import type {
  BusinessSettings,
  Category,
  Product,
  ProductVariant,
  Campaign,
  Order,
  OrderItem,
  FAQ,
} from '../../types';

const IS_VERCEL = process.env.VERCEL === '1';
const DB_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'bakery.db');

let dbInstance: DatabaseSync | null = null;

export function getSQLiteDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const bundledDbPath = path.join(process.cwd(), 'data', 'bakery.db');
  if (IS_VERCEL && !fs.existsSync(DB_PATH) && fs.existsSync(bundledDbPath)) {
    try {
      fs.copyFileSync(bundledDbPath, DB_PATH);
    } catch {
      // Fallback to initSchemaAndSeed
    }
  }

  const db = new DatabaseSync(DB_PATH);
  initSchemaAndSeed(db);
  dbInstance = db;
  return db;
}

function initSchemaAndSeed(db: DatabaseSync) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_settings (
      id TEXT PRIMARY KEY,
      store_name TEXT NOT NULL,
      logo_url TEXT,
      description TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      phone_number TEXT,
      email TEXT,
      instagram_handle TEXT,
      instagram_url TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT,
      latitude REAL,
      longitude REAL,
      google_maps_embed_url TEXT,
      google_maps_share_url TEXT,
      business_hours TEXT NOT NULL,
      pickup_instructions TEXT,
      delivery_areas TEXT,
      delivery_fee_base REAL NOT NULL,
      free_delivery_threshold REAL,
      min_order_amount REAL,
      min_preorder_days INTEGER NOT NULL,
      payment_methods TEXT NOT NULL,
      announcement_enabled INTEGER NOT NULL DEFAULT 1,
      announcement_text TEXT,
      hero_eyebrow TEXT,
      hero_headline TEXT,
      hero_description TEXT,
      hero_image_url TEXT,
      ordering_policy TEXT,
      cancellation_policy TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      base_price REAL NOT NULL,
      main_image TEXT NOT NULL,
      gallery TEXT NOT NULL,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      min_preorder_days INTEGER NOT NULL DEFAULT 1,
      prep_time_hours INTEGER NOT NULL DEFAULT 24,
      allergens TEXT,
      storage_instructions TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      banner_image TEXT NOT NULL,
      cta_text TEXT NOT NULL,
      cta_link TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      featured_product_ids TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_whatsapp TEXT NOT NULL,
      order_type TEXT NOT NULL,
      delivery_address TEXT,
      fulfillment_date TEXT NOT NULL,
      fulfillment_time_slot TEXT NOT NULL,
      customer_notes TEXT,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_method_id TEXT NOT NULL,
      payment_method_name TEXT NOT NULL,
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      internal_notes TEXT,
      cancellation_reason TEXT,
      idempotency_key TEXT,
      public_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      product_name TEXT NOT NULL,
      variant_id TEXT,
      variant_name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'Umum',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Safe schema migrations for existing SQLite databases (Gate 0 & 2)
  try { db.exec('ALTER TABLE orders ADD COLUMN customer_id TEXT'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN idempotency_key TEXT'); } catch {}
  try { db.exec('ALTER TABLE orders ADD COLUMN public_token TEXT'); } catch {}

  // Check if business_settings has data; if not, seed initial data
  const checkSettings = db.prepare('SELECT count(*) as count FROM business_settings').get() as { count: number };
  if (checkSettings.count === 0) {
    seedInitialData(db);
  }
}

function seedInitialData(db: DatabaseSync) {
  const now = new Date().toISOString();

  // 1. Business Settings
  const insertSettings = db.prepare(`
    INSERT INTO business_settings (
      id, store_name, logo_url, description, whatsapp_number, phone_number, email,
      instagram_handle, instagram_url, address, city, postal_code, latitude, longitude,
      google_maps_embed_url, google_maps_share_url, business_hours, pickup_instructions,
      delivery_areas, delivery_fee_base, free_delivery_threshold, min_order_amount, min_preorder_days,
      payment_methods, announcement_enabled, announcement_text, hero_eyebrow, hero_headline,
      hero_description, hero_image_url, ordering_policy, cancellation_policy, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  insertSettings.run(
    'default',
    'Aura Artisan Bakery & Catering',
    '',
    'Artisan bakery & catering dengan teknik slow-fermented, butter kualitas prima, dan bahan natural tanpa pengawet.',
    '6281234567890',
    '021-5551234',
    'halo@aurabakery.id',
    '@aurabakery.id',
    'https://instagram.com/aurabakery.id',
    'Jl. Senopati No. 42, Kebayoran Baru',
    'Jakarta Selatan',
    '12190',
    -6.229728,
    106.807464,
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.28659103998!2d106.807464!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNDcuMCJTIDEwNsKwNDgnMjYuOSJF!5e0!3m2!1sid!2sid!4v1600000000000',
    'https://maps.google.com/?q=-6.229728,106.807464',
    'Selasa - Minggu: 08.00 - 20.00 WIB (Senin Tutup)',
    'Pengambilan pesanan dapat dilakukan di Pick-up Counter Aura Bakery sesuai slot waktu yang dipilih setelah mendapatkan notifikasi.',
    'Pengiriman mencakup seluruh wilayah Jakarta Selatan, Jakarta Pusat, dan sebagian Tangerang Selatan (kurir instan/sameday).',
    20000,
    350000,
    50000,
    1,
    JSON.stringify([
      { id: 'bank_bca', name: 'Transfer Bank BCA', account_number: '1234-5678-90', account_name: 'Aura Bakery & Catering', enabled: true },
      { id: 'bank_mandiri', name: 'Transfer Bank Mandiri', account_number: '987-654-321-0123', account_name: 'Aura Bakery & Catering', enabled: true },
      { id: 'pickup_cash', name: 'Bayar saat Pengambilan (Cash/QRIS di Counter)', account_number: '', account_name: '', enabled: true }
    ]),
    1,
    'Pre-order Festive Season & Eid Hampers telah dibuka! Kuota terbatas setiap harinya.',
    'Freshly Made, Thoughtfully Baked',
    'Cita Rasa Artisan untuk Setiap Momen Spesial',
    'Temukan kue perayaan artisan, roti sourdough segar harian, dan paket catering pilihan yang dibuat dengan ketulusan dan bahan terbaik.',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
    'Pesanan cake & hampers membutuhkan waktu pembuatan minimal 1 hari sebelumnya. Untuk pesanan catering dalam jumlah besar (di atas 20 box), silakan memesan H-3.',
    'Pembatalan atau perubahan tanggal pesanan dapat dilakukan maksimal 24 jam sebelum jadwal pengambilan/pengiriman.',
    now
  );

  // 2. Categories
  const categories = [
    { id: 'cat_cakes', name: 'Cakes & Celebration', slug: 'cakes-celebration', desc: 'Kue ulang tahun dan perayaan dengan bahan natural dan desain estetik', order: 1 },
    { id: 'cat_pastry', name: 'Pastry & Sourdough', slug: 'pastry-sourdough', desc: 'Croissant berlapis renyah dan sourdough fermentasi lambat', order: 2 },
    { id: 'cat_cookies', name: 'Cookies & Small Bites', slug: 'cookies-small-bites', desc: 'Kue kering artisan dengan butter pilihan untuk camilan premium', order: 3 },
    { id: 'cat_catering', name: 'Catering & Meal Boxes', slug: 'catering-meal-boxes', desc: 'Paket nasi kotak dan hidangan perayaan untuk pertemuan dan acara keluarga', order: 4 },
    { id: 'cat_hampers', name: 'Hampers & Seasonal', slug: 'hampers-seasonal', desc: 'Bingkisan kurasi istimewa untuk momen hari raya dan perayaan', order: 5 },
  ];

  const insertCat = db.prepare('INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)');
  for (const c of categories) {
    insertCat.run(c.id, c.name, c.slug, c.desc, c.order, now, now);
  }

  // 3. Products
  const products = [
    {
      id: 'prod_earl_grey_cake',
      category_id: 'cat_cakes',
      name: 'Earl Grey Lavender Chiffon Cake',
      slug: 'earl-grey-lavender-chiffon-cake',
      short_description: 'Kue sifon lembut beraroma teh Earl Grey dengan lapisan chantilly lavender ringan.',
      description: 'Kue sifon artisan yang menggunakan seduhan daun teh Earl Grey asli dan bunga lavender organik. Dilapisi fresh chantilly cream yang lembut tidak membuat enek, dengan dekorasi buah segar musiman.',
      base_price: 285000,
      main_image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 1,
      badge: 'Best Seller',
      min_preorder_days: 1,
      prep_time_hours: 24,
      allergens: 'Mengandung telur, susu, gluten (tepung gandum).',
      storage_instructions: 'Simpan di dalam kulkas pada suhu 4-8°C. Tahan hingga 3 hari.',
      display_order: 1,
    },
    {
      id: 'prod_burnt_cheesecake',
      category_id: 'cat_cakes',
      name: 'Basque Burnt Cheesecake Madagaskar',
      slug: 'basque-burnt-cheesecake-madagaskar',
      short_description: 'Cheesecake lumer khas San Sebastian dengan vanila bean Madagaskar asli.',
      description: 'Dibuat dengan French cream cheese berkualitas dan Madagascan vanilla bean. Permukaan karamel yang terpanggang harum berpadu sempurna dengan bagian tengah yang creamy dan lumer.',
      base_price: 295000,
      main_image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 1,
      badge: 'Favorite',
      min_preorder_days: 1,
      prep_time_hours: 24,
      allergens: 'Mengandung susu, keju, telur.',
      storage_instructions: 'Simpan di chiller. Paling nikmat disajikan dingin.',
      display_order: 2,
    },
    {
      id: 'prod_butter_croissant',
      category_id: 'cat_pastry',
      name: 'Artisan French Butter Croissant Box',
      slug: 'artisan-french-butter-croissant-box',
      short_description: 'Croissant klasik renyah berlapis dengan butter Prancis AOP.',
      description: 'Dipanggang fresh setiap pagi melalui proses laminasi 3 hari. Kulit luar sangat renyah dan bagian dalam lembut berongga dengan aroma butter yang harum.',
      base_price: 135000,
      main_image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 1,
      badge: 'Fresh Daily',
      min_preorder_days: 0,
      prep_time_hours: 4,
      allergens: 'Mengandung susu, butter, gluten.',
      storage_instructions: 'Dapat dihangatkan di oven/airfryer pada suhu 170°C selama 3 menit.',
      display_order: 3,
    },
    {
      id: 'prod_sourdough_country',
      category_id: 'cat_pastry',
      name: 'Country Sourdough Loaf (Slow Fermented)',
      slug: 'country-sourdough-loaf-slow-fermented',
      short_description: 'Roti sourdough fermentasi 36 jam dengan ragi alami starter liar.',
      description: 'Dibuat hanya dari tepung gandum utuh organik, air terfiltrasi, garam laut, dan starter ragi liar alami. Kulit luar berkerak gurih dan remah lembut dengan keasaman seimbang.',
      base_price: 65000,
      main_image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 0,
      badge: 'Artisan Bread',
      min_preorder_days: 1,
      prep_time_hours: 36,
      allergens: 'Mengandung gluten. Tanpa telur dan tanpa susu (Vegan friendly).',
      storage_instructions: 'Simpan di tempat kering tertutup. Tahan 4 hari di suhu ruang, atau dibekukan.',
      display_order: 4,
    },
    {
      id: 'prod_sea_salt_cookies',
      category_id: 'cat_cookies',
      name: 'Valrhona Dark Chocolate Sea Salt Cookies',
      slug: 'valrhona-dark-chocolate-sea-salt-cookies',
      short_description: 'Kue kering cokelat pekat Valrhona 70% dengan taburan Maldon sea salt flakes.',
      description: 'Tekstur renyah di luar dan fudgy di tengah. Kombinasi cokelat hitam premium Prancis dengan kristal garam laut menciptakan rasa manis-gurih yang seimbang.',
      base_price: 145000,
      main_image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 1,
      badge: 'Best Seller',
      min_preorder_days: 0,
      prep_time_hours: 6,
      allergens: 'Mengandung telur, butter, tepung gandum, cokelat.',
      storage_instructions: 'Simpan di toples kedap udara. Tahan 2 minggu.',
      display_order: 5,
    },
    {
      id: 'prod_catering_box_nusantara',
      category_id: 'cat_catering',
      name: 'Nasi Liwet Solo & Ayam Ungkep Madu Box',
      slug: 'nasi-liwet-solo-ayam-ungkep-madu-box',
      short_description: 'Paket hidangan katering higienis dengan nasi liwet gurih, ayam ungkep madu, dan lauk pelengkap.',
      description: 'Cocok untuk rapat kantor, syukuran keluarga, dan acara intim. Dikemas rapi dengan kotak ramah lingkungan lengkap dengan alat makan kayu sekali pakai dan buah segar.',
      base_price: 55000,
      main_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 0,
      badge: 'Min. 5 Box',
      min_preorder_days: 2,
      prep_time_hours: 48,
      allergens: 'Mengandung kacang, santan.',
      storage_instructions: 'Sebaiknya disantap dalam 4 jam setelah diterima.',
      display_order: 6,
    },
    {
      id: 'prod_hampers_festive',
      category_id: 'cat_hampers',
      name: 'The Artisan Heritage Hampers Set',
      slug: 'the-artisan-heritage-hampers-set',
      short_description: 'Set hampers eksklusif berisi 3 toples cookies artisan, loose leaf tea, dan kartu ucapan.',
      description: 'Dikemas dalam box linen custom bernuansa earthy dengan pita satin. Pilihan sempurna untuk bingkisan keluarga, sahabat, maupun rekan korporat.',
      base_price: 420000,
      main_image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      gallery: JSON.stringify(['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop']),
      is_available: 1,
      is_featured: 1,
      badge: 'Seasonal',
      min_preorder_days: 2,
      prep_time_hours: 48,
      allergens: 'Mengandung dairy, telur, gluten, kacang.',
      storage_instructions: 'Simpan toples dalam suhu ruang yang sejuk.',
      display_order: 7,
    },
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (
      id, category_id, name, slug, short_description, description, base_price,
      main_image, gallery, is_available, is_featured, badge, min_preorder_days,
      prep_time_hours, allergens, storage_instructions, display_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProd.run(
      p.id, p.category_id, p.name, p.slug, p.short_description, p.description,
      p.base_price, p.main_image, p.gallery, p.is_available, p.is_featured,
      p.badge, p.min_preorder_days, p.prep_time_hours, p.allergens,
      p.storage_instructions, p.display_order, now, now
    );
  }

  // 4. Product Variants
  const variants = [
    { id: 'var_chiffon_16', product_id: 'prod_earl_grey_cake', name: 'Diameter 16 cm (4-6 Porsi)', price: 285000, is_default: 1, order: 1 },
    { id: 'var_chiffon_20', product_id: 'prod_earl_grey_cake', name: 'Diameter 20 cm (8-10 Porsi)', price: 380000, is_default: 0, order: 2 },
    { id: 'var_cheesecake_16', product_id: 'prod_burnt_cheesecake', name: 'Diameter 16 cm (Porsi Sedang)', price: 295000, is_default: 1, order: 1 },
    { id: 'var_cheesecake_20', product_id: 'prod_burnt_cheesecake', name: 'Diameter 20 cm (Porsi Besar)', price: 395000, is_default: 0, order: 2 },
    { id: 'var_croissant_4', product_id: 'prod_butter_croissant', name: 'Box Isi 4 pcs', price: 135000, is_default: 1, order: 1 },
    { id: 'var_croissant_6', product_id: 'prod_butter_croissant', name: 'Box Isi 6 pcs (Hemat)', price: 195000, is_default: 0, order: 2 },
    { id: 'var_sourdough_whole', product_id: 'prod_sourdough_country', name: 'Whole Loaf (Belum Dipotong)', price: 65000, is_default: 1, order: 1 },
    { id: 'var_sourdough_sliced', product_id: 'prod_sourdough_country', name: 'Sliced (Sudah Dipotong Rapi)', price: 68000, is_default: 0, order: 2 },
    { id: 'var_cookies_jar', product_id: 'prod_sea_salt_cookies', name: 'Glass Jar (250 gr)', price: 145000, is_default: 1, order: 1 },
    { id: 'var_cookies_pouch', product_id: 'prod_sea_salt_cookies', name: 'Twin Pack Jar (500 gr)', price: 270000, is_default: 0, order: 2 },
    { id: 'var_catering_regular', product_id: 'prod_catering_box_nusantara', name: 'Paket Reguler (Ayam Bakar + Lauk)', price: 55000, is_default: 1, order: 1 },
    { id: 'var_catering_premium', product_id: 'prod_catering_box_nusantara', name: 'Paket Premium (+ Udang & Buah)', price: 75000, is_default: 0, order: 2 },
    { id: 'var_hampers_3jars', product_id: 'prod_hampers_festive', name: 'Box Klasik (3 Toples Cookies + Teh)', price: 420000, is_default: 1, order: 1 },
    { id: 'var_hampers_deluxe', product_id: 'prod_hampers_festive', name: 'Box Deluxe (+ Cangkir Keramik Handmade)', price: 560000, is_default: 0, order: 2 },
  ];

  const insertVar = db.prepare(`
    INSERT INTO product_variants (id, product_id, name, price, is_default, is_available, display_order, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `);

  for (const v of variants) {
    insertVar.run(v.id, v.product_id, v.name, v.price, v.is_default, v.order, now);
  }

  // 5. Campaigns
  const insertCamp = db.prepare(`
    INSERT INTO campaigns (
      id, title, slug, subtitle, description, banner_image, cta_text, cta_link,
      start_date, end_date, is_active, featured_product_ids, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  insertCamp.run(
    'camp_festive_special',
    'Koleksi Perayaan & Hampers Musiman',
    'koleksi-perayaan-musiman',
    'Edisi Terbatas Setiap Pekan',
    'Hadirkan kehangatan cita rasa artisan untuk keluarga tercinta dan relasi terdekat. Setiap hampers dikemas elegan dengan sentuhan personal pita satin dan kartu ucapan.',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    'Pesan Paket Hampers Sekarang',
    '/produk',
    new Date(Date.now() - 86400000).toISOString(),
    new Date(Date.now() + 30 * 86400000).toISOString(),
    JSON.stringify(['prod_hampers_festive', 'prod_earl_grey_cake', 'prod_sea_salt_cookies']),
    now,
    now
  );

  // 6. FAQs
  const faqs = [
    { id: 'faq_1', q: 'Berapa hari sebelumnya saya harus memesan?', a: 'Untuk whole cake dan hampers, pemesanan minimal dilakukan H-1 (minimal 24 jam sebelum waktu pengambilan/pengiriman). Untuk pastry dan roti satuan, ketersediaan harian dapat dipesan jika stok hari tersebut masih tersedia. Untuk pesanan katering di atas 20 box, mohon memesan minimal H-3.', cat: 'Pemesanan', order: 1 },
    { id: 'faq_2', q: 'Apakah pesanan bisa dikirim ke rumah?', a: 'Ya, kami melayani pengiriman area Jakarta dan sekitarnya menggunakan armada kurir instan berpendingin atau kurir roda empat khusus cake agar pesanan tiba dalam kondisi prima dan utuh.', cat: 'Pengiriman', order: 2 },
    { id: 'faq_3', q: 'Bagaimana metode pembayaran yang tersedia?', a: 'Kami menerima transfer bank manual (BCA dan Mandiri), serta pembayaran saat pengambilan di counter toko untuk pemesanan reguler.', cat: 'Pembayaran', order: 3 },
    { id: 'faq_4', q: 'Apakah produk Aura Bakery menggunakan bahan pengawet?', a: 'Tidak. Semua produk kami dibuat secara artisan dari bahan-bahan segar berkualitas (pure butter, fresh cream, ragi alami) tanpa bahan pengawet sintetik. Oleh karena itu, kami menyarankan penyimpanan sesuai petunjuk pada label.', cat: 'Kualitas Produk', order: 4 },
    { id: 'faq_5', q: 'Apakah bisa melakukan custom ucapan di atas kue?', a: 'Tentu bisa! Silakan cantumkan pesan ucapan, lilin, atau catatan khusus pada kolom "Catatan Tambahan" saat melakukan checkout di website.', cat: 'Pemesanan', order: 5 },
  ];

  const insertFaq = db.prepare('INSERT INTO faqs (id, question, answer, category, display_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)');
  for (const f of faqs) {
    insertFaq.run(f.id, f.q, f.a, f.cat, f.order, now, now);
  }
}
