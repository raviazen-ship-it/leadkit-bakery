-- LeadKit Bakery & Catering - Supabase Database Migration
-- Version 1.0.0

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT NOT NULL DEFAULT 'Aura Artisan Bakery & Catering',
    logo_url TEXT DEFAULT '',
    description TEXT NOT NULL DEFAULT 'Artisan bakery & catering pilihan dengan bahan segar berkualitas tinggi untuk setiap perayaan istimewa Anda.',
    whatsapp_number TEXT NOT NULL DEFAULT '6281234567890',
    phone_number TEXT DEFAULT '021-5551234',
    email TEXT DEFAULT 'halo@aurabakery.id',
    instagram_handle TEXT DEFAULT '@aurabakery.id',
    instagram_url TEXT DEFAULT 'https://instagram.com/aurabakery.id',
    address TEXT NOT NULL DEFAULT 'Jl. Senopati No. 42, Kebayoran Baru',
    city TEXT NOT NULL DEFAULT 'Jakarta Selatan',
    postal_code TEXT DEFAULT '12190',
    latitude DOUBLE PRECISION DEFAULT -6.229728,
    longitude DOUBLE PRECISION DEFAULT 106.807464,
    google_maps_embed_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.28659103998!2d106.807464!3d-6.229728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnNDcuMCJTIDEwNsKwNDgnMjYuOSJF!5e0!3m2!1sid!2sid!4v1600000000000',
    google_maps_share_url TEXT DEFAULT 'https://maps.google.com/?q=-6.229728,106.807464',
    business_hours TEXT NOT NULL DEFAULT 'Selasa - Minggu: 08.00 - 20.00 WIB (Senin Tutup)',
    pickup_instructions TEXT DEFAULT 'Pengambilan pesanan dapat dilakukan di konter utama Aura Bakery pada jam operasional setelah mendapatkan notifikasi siap diambil.',
    delivery_areas TEXT DEFAULT 'Mencakup seluruh area Jakarta Selatan, Jakarta Pusat, dan sebagian Tangerang Selatan (maksimal 25 km).',
    delivery_fee_base NUMERIC(12, 2) NOT NULL DEFAULT 20000.00,
    free_delivery_threshold NUMERIC(12, 2) DEFAULT 350000.00,
    min_order_amount NUMERIC(12, 2) DEFAULT 50000.00,
    min_preorder_days INTEGER NOT NULL DEFAULT 1,
    payment_methods JSONB NOT NULL DEFAULT '[
        {"id": "bank_bca", "name": "Transfer Bank BCA", "account_number": "1234567890", "account_name": "Aura Bakery & Catering", "enabled": true},
        {"id": "bank_mandiri", "name": "Transfer Bank Mandiri", "account_number": "9876543210123", "account_name": "Aura Bakery & Catering", "enabled": true},
        {"id": "pickup_cash", "name": "Bayar saat Pengambilan (Cash/QRIS di Toko)", "account_number": "", "account_name": "", "enabled": true}
    ]'::jsonb,
    announcement_enabled BOOLEAN NOT NULL DEFAULT true,
    announcement_text TEXT DEFAULT 'Pre-order Lebaran & Hampers Spesial telah dibuka. Kuota terbatas setiap harinya!',
    hero_eyebrow TEXT DEFAULT 'Freshly Made, Thoughtfully Baked',
    hero_headline TEXT DEFAULT 'Cita Rasa Artisan untuk Setiap Momen Spesial',
    hero_description TEXT DEFAULT 'Temukan kue artisan, roti segar harian, dan paket catering pilihan yang dibuat dengan ketulusan dan bahan terbaik.',
    hero_image_url TEXT DEFAULT '/images/hero-artisan.jpg',
    ordering_policy TEXT DEFAULT 'Pesanan cake & hampers membutuhkan waktu pembuatan minimal 1-2 hari sebelumnya. Untuk pesanan catering dalam jumlah besar (di atas 20 box), silakan memesan H-3.',
    cancellation_policy TEXT DEFAULT 'Pembatalan atau perubahan tanggal pesanan dapat dilakukan maksimal 24 jam sebelum jadwal pengambilan/pengiriman.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    main_image TEXT NOT NULL DEFAULT '',
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    badge TEXT DEFAULT '', -- 'Best Seller', 'New', 'Seasonal', etc.
    min_preorder_days INTEGER NOT NULL DEFAULT 1,
    prep_time_hours INTEGER NOT NULL DEFAULT 24,
    allergens TEXT DEFAULT '', -- e.g. 'Mengandung susu, telur, gluten'
    storage_instructions TEXT DEFAULT 'Simpan di kulkas (4-8°C), nikmati dalam 3 hari',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'Diameter 16 cm', 'Box isi 6', 'Regular Box'
    price NUMERIC(12, 2) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT NOT NULL,
    banner_image TEXT NOT NULL,
    cta_text TEXT NOT NULL DEFAULT 'Pesan Paket Sekarang',
    cta_link TEXT NOT NULL DEFAULT '/produk',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    featured_product_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- e.g. ORD-20261023-A7B2
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('pickup', 'delivery')),
    delivery_address TEXT DEFAULT '',
    fulfillment_date DATE NOT NULL,
    fulfillment_time_slot TEXT NOT NULL, -- e.g. '10:00 - 12:00'
    customer_notes TEXT DEFAULT '',
    subtotal NUMERIC(12, 2) NOT NULL,
    delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method_id TEXT NOT NULL,
    payment_method_name TEXT NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'Baru' CHECK (order_status IN (
        'Baru',
        'Menunggu Konfirmasi',
        'Dikonfirmasi',
        'Diproses',
        'Siap Diambil/Dikirim',
        'Selesai',
        'Dibatalkan'
    )),
    payment_status TEXT NOT NULL DEFAULT 'Belum Dibayar' CHECK (payment_status IN (
        'Belum Dibayar',
        'Menunggu Verifikasi',
        'Dibayar',
        'Dikembalikan'
    )),
    internal_notes TEXT DEFAULT '',
    cancellation_reason TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE (PRICE SNAPSHOT)
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL, -- Snapshot
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    variant_name TEXT NOT NULL, -- Snapshot
    unit_price NUMERIC(12, 2) NOT NULL, -- Snapshot
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FAQS TABLE
CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'Umum',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_date ON orders(fulfillment_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public can view business settings" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view available products" ON products FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view product variants" ON product_variants FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active faqs" ON faqs FOR SELECT USING (is_active = true);

-- Public CREATE order policy (Anonymous customers can submit orders)
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Authenticated Admin policies (Full access for authenticated admins)
CREATE POLICY "Admin full access on business_settings" ON business_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on product_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on campaigns" ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on faqs" ON faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);
