-- LeadKit Bakery & Catering - Seed Demo Data
-- Clearly marked as initial starter / demo data for the business owner.

-- 1. SEED BUSINESS SETTINGS
INSERT INTO business_settings (
    id, store_name, logo_url, description, whatsapp_number, phone_number, email, 
    instagram_handle, instagram_url, address, city, postal_code, latitude, longitude,
    google_maps_embed_url, google_maps_share_url, business_hours, pickup_instructions,
    delivery_areas, delivery_fee_base, free_delivery_threshold, min_order_amount, min_preorder_days,
    payment_methods, announcement_enabled, announcement_text, hero_eyebrow, hero_headline,
    hero_description, hero_image_url, ordering_policy, cancellation_policy
) VALUES (
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
    'Pengambilan pesanan dapat dilakukan di Pick-up Counter Aura Bakery sesuai slot waktu yang dipilih.',
    'Pengiriman mencakup seluruh wilayah Jakarta Selatan, Jakarta Pusat, dan sebagian Tangerang Selatan (kurir instan/sameday berpendingin).',
    20000.00,
    350000.00,
    50000.00,
    1,
    '[
        {"id": "bank_bca", "name": "Transfer Bank BCA", "account_number": "1234-5678-90", "account_name": "Aura Bakery & Catering", "enabled": true},
        {"id": "bank_mandiri", "name": "Transfer Bank Mandiri", "account_number": "987-654-321-0123", "account_name": "Aura Bakery & Catering", "enabled": true},
        {"id": "pickup_cash", "name": "Bayar saat Pengambilan (Cash/QRIS di Counter)", "account_number": "", "account_name": "", "enabled": true}
    ]'::jsonb,
    true,
    'Pre-order Festive Season & Eid Hampers telah dibuka! Kuota terbatas setiap harinya.',
    'Freshly Made, Thoughtfully Baked',
    'Cita Rasa Artisan untuk Setiap Momen Spesial',
    'Temukan kue perayaan artisan, roti sourdough segar harian, dan paket catering pilihan yang dibuat dengan ketulusan dan bahan terbaik.',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
    'Pesanan cake & hampers membutuhkan waktu pembuatan minimal 1 hari sebelumnya. Untuk pesanan catering dalam jumlah besar (di atas 20 box), silakan memesan H-3.',
    'Pembatalan atau perubahan tanggal pesanan dapat dilakukan maksimal 24 jam sebelum jadwal pengambilan/pengiriman.'
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED CATEGORIES
INSERT INTO categories (id, name, slug, description, display_order, is_active) VALUES
('cat_cakes', 'Cakes & Celebration', 'cakes-celebration', 'Kue ulang tahun dan perayaan dengan bahan natural dan desain estetik', 1, true),
('cat_pastry', 'Pastry & Sourdough', 'pastry-sourdough', 'Croissant berlapis renyah dan sourdough fermentasi lambat', 2, true),
('cat_cookies', 'Cookies & Small Bites', 'cookies-small-bites', 'Kue kering artisan dengan butter pilihan untuk camilan premium', 3, true),
('cat_catering', 'Catering & Meal Boxes', 'catering-meal-boxes', 'Paket nasi kotak dan hidangan perayaan untuk pertemuan dan acara keluarga', 4, true),
('cat_hampers', 'Hampers & Seasonal', 'hampers-seasonal', 'Bingkisan kurasi istimewa untuk momen hari raya dan perayaan', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PRODUCTS
INSERT INTO products (
    id, category_id, name, slug, short_description, description, base_price, main_image,
    gallery, is_available, is_featured, badge, min_preorder_days, prep_time_hours,
    allergens, storage_instructions, display_order
) VALUES
(
    'prod_earl_grey_cake',
    'cat_cakes',
    'Earl Grey Lavender Chiffon Cake',
    'earl-grey-lavender-chiffon-cake',
    'Kue sifon lembut beraroma teh Earl Grey dengan lapisan chantilly lavender ringan.',
    'Kue sifon artisan yang menggunakan seduhan daun teh Earl Grey asli dan bunga lavender organik. Dilapisi fresh chantilly cream yang lembut tidak membuat enek, dengan dekorasi buah segar musiman.',
    285000.00,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    true,
    'Best Seller',
    1,
    24,
    'Mengandung telur, susu, gluten (tepung gandum).',
    'Simpan di dalam kulkas pada suhu 4-8°C. Tahan hingga 3 hari.',
    1
),
(
    'prod_burnt_cheesecake',
    'cat_cakes',
    'Basque Burnt Cheesecake Madagaskar',
    'basque-burnt-cheesecake-madagaskar',
    'Cheesecake lumer khas San Sebastian dengan vanila bean Madagaskar asli.',
    'Dibuat dengan French cream cheese berkualitas dan Madagascan vanilla bean. Permukaan karamel yang terpanggang harum berpadu sempurna dengan bagian tengah yang creamy dan lumer.',
    295000.00,
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    true,
    'Favorite',
    1,
    24,
    'Mengandung susu, keju, telur.',
    'Simpan di chiller. Paling nikmat disajikan dingin.',
    2
),
(
    'prod_butter_croissant',
    'cat_pastry',
    'Artisan French Butter Croissant Box',
    'artisan-french-butter-croissant-box',
    'Croissant klasik renyah berlapis dengan butter Prancis AOP.',
    'Dipanggang fresh setiap pagi melalui proses laminasi 3 hari. Kulit luar sangat renyah dan bagian dalam lembut berongga dengan aroma butter yang harum.',
    135000.00,
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    true,
    'Fresh Daily',
    0,
    4,
    'Mengandung susu, butter, gluten.',
    'Dapat dihangatkan di oven/airfryer pada suhu 170°C selama 3 menit.',
    3
),
(
    'prod_sourdough_country',
    'cat_pastry',
    'Country Sourdough Loaf (Slow Fermented)',
    'country-sourdough-loaf-slow-fermented',
    'Roti sourdough fermentasi 36 jam dengan ragi alami starter liar.',
    'Dibuat hanya dari tepung gandum utuh organik, air terfiltrasi, garam laut, dan starter ragi liar alami. Kulit luar berkerak gurih dan remah lembut dengan keasaman seimbang.',
    65000.00,
    'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    false,
    'Artisan Bread',
    1,
    36,
    'Mengandung gluten. Tanpa telur dan tanpa susu (Vegan friendly).',
    'Simpan di tempat kering tertutup. Tahan 4 hari di suhu ruang, atau dibekukan.',
    4
),
(
    'prod_sea_salt_cookies',
    'cat_cookies',
    'Valrhona Dark Chocolate Sea Salt Cookies',
    'valrhona-dark-chocolate-sea-salt-cookies',
    'Kue kering cokelat pekat Valrhona 70% dengan taburan Maldon sea salt flakes.',
    'Tekstur renyah di luar dan fudgy di tengah. Kombinasi cokelat hitam premium Prancis dengan kristal garam laut menciptakan rasa manis-gurih yang seimbang.',
    145000.00,
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    true,
    'Best Seller',
    0,
    6,
    'Mengandung telur, butter, tepung gandum, cokelat.',
    'Simpan di toples kedap udara. Tahan 2 minggu.',
    5
),
(
    'prod_catering_box_nusantara',
    'cat_catering',
    'Nasi Liwet Solo & Ayam Ungkep Madu Box',
    'nasi-liwet-solo-ayam-ungkep-madu-box',
    'Paket hidangan katering higienis dengan nasi liwet gurih, ayam ungkep madu, dan lauk pelengkap.',
    'Cocok untuk rapat kantor, syukuran keluarga, dan acara intim. Dikemas rapi dengan kotak ramah lingkungan lengkap dengan alat makan kayu sekali pakai dan buah segar.',
    55000.00,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    false,
    'Min. 5 Box',
    2,
    48,
    'Mengandung kacang, santan.',
    'Sebaiknya disantap dalam 4 jam setelah diterima.',
    6
),
(
    'prod_hampers_festive',
    'cat_hampers',
    'The Artisan Heritage Hampers Set',
    'the-artisan-heritage-hampers-set',
    'Set hampers eksklusif berisi 3 toples cookies artisan, loose leaf tea, dan kartu ucapan.',
    'Dikemas dalam box linen custom bernuansa earthy dengan pita satin. Pilihan sempurna untuk bingkisan keluarga, sahabat, maupun rekan korporat.',
    420000.00,
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    '["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"]'::jsonb,
    true,
    true,
    'Seasonal',
    2,
    48,
    'Mengandung dairy, telur, gluten, kacang.',
    'Simpan toples dalam suhu ruang yang sejuk.',
    7
)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PRODUCT VARIANTS
INSERT INTO product_variants (id, product_id, name, price, is_default, is_available, display_order) VALUES
-- Variants for Earl Grey Chiffon Cake
('var_chiffon_16', 'prod_earl_grey_cake', 'Diameter 16 cm (4-6 Porsi)', 285000.00, true, true, 1),
('var_chiffon_20', 'prod_earl_grey_cake', 'Diameter 20 cm (8-10 Porsi)', 380000.00, false, true, 2),
-- Variants for Basque Burnt Cheesecake
('var_cheesecake_16', 'prod_burnt_cheesecake', 'Diameter 16 cm (Porsi Sedang)', 295000.00, true, true, 1),
('var_cheesecake_20', 'prod_burnt_cheesecake', 'Diameter 20 cm (Porsi Besar)', 395000.00, false, true, 2),
-- Variants for Croissant Box
('var_croissant_4', 'prod_butter_croissant', 'Box Isi 4 pcs', 135000.00, true, true, 1),
('var_croissant_6', 'prod_butter_croissant', 'Box Isi 6 pcs (Hemat)', 195000.00, false, true, 2),
-- Variants for Sourdough
('var_sourdough_whole', 'prod_sourdough_country', 'Whole Loaf (Belum Dipotong)', 65000.00, true, true, 1),
('var_sourdough_sliced', 'prod_sourdough_country', 'Sliced (Sudah Dipotong Rapi)', 68000.00, false, true, 2),
-- Variants for Sea Salt Cookies
('var_cookies_jar', 'prod_sea_salt_cookies', 'Glass Jar (250 gr)', 145000.00, true, true, 1),
('var_cookies_pouch', 'prod_sea_salt_cookies', 'Twin Pack Jar (500 gr)', 270000.00, false, true, 2),
-- Variants for Catering Box
('var_catering_regular', 'prod_catering_box_nusantara', 'Paket Reguler (Ayam Bakar + Lauk Lengkap)', 55000.00, true, true, 1),
('var_catering_premium', 'prod_catering_box_nusantara', 'Paket Premium (+ Udang Balado & Buah Potong)', 75000.00, false, true, 2),
-- Variants for Hampers
('var_hampers_3jars', 'prod_hampers_festive', 'Box Klasik (3 Toples Cookies + Teh)', 420000.00, true, true, 1),
('var_hampers_deluxe', 'prod_hampers_festive', 'Box Deluxe (+ Cangkir Keramik Handmade)', 560000.00, false, true, 2)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED CAMPAIGNS
INSERT INTO campaigns (
    id, title, slug, subtitle, description, banner_image, cta_text, cta_link,
    start_date, end_date, is_active, featured_product_ids
) VALUES (
    'camp_festive_special',
    'Koleksi Perayaan & Hampers Musiman',
    'koleksi-perayaan-musiman',
    'Edisi Terbatas Setiap Pekan',
    'Hadirkan kehangatan cita rasa artisan untuk keluarga tercinta dan relasi terdekat. Setiap hampers dikemas elegan dengan sentuhan personal.',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
    'Pesan Paket Hampers Sekarang',
    '/produk',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    true,
    '["prod_hampers_festive", "prod_earl_grey_cake", "prod_sea_salt_cookies"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 6. SEED FAQS
INSERT INTO faqs (id, question, answer, category, display_order, is_active) VALUES
('faq_1', 'Berapa hari sebelumnya saya harus memesan?', 'Untuk whole cake dan hampers, pemesanan minimal dilakukan H-1 (minimal 24 jam sebelum waktu pengambilan/pengiriman). Untuk pastry dan roti satuan, ketersediaan harian dapat dipesan jika stok hari tersebut masih tersedia. Untuk pesanan katering di atas 20 box, mohon memesan minimal H-3.', 'Pemesanan', 1, true),
('faq_2', 'Apakah pesanan bisa dikirim ke rumah?', 'Ya, kami melayani pengiriman area Jakarta dan sekitarnya menggunakan armada kurir instan berpendingin atau kurir roda empat khusus cake agar pesanan tiba dalam kondisi prima dan utuh.', 'Pengiriman', 2, true),
('faq_3', 'Bagaimana metode pembayaran yang tersedia?', 'Kami menerima transfer bank manual (BCA dan Mandiri), serta pembayaran saat pengambilan di toko untuk pemesanan reguler.', 'Pembayaran', 3, true),
('faq_4', 'Apakah produk Aura Bakery menggunakan bahan pengawet?', 'Tidak. Semua produk kami dibuat secara artisan dari bahan-bahan segar berkualitas (pure butter, fresh cream, ragi alami) tanpa bahan pengawet sintetik. Oleh karena itu, kami menyarankan penyimpanan sesuai petunjuk pada label.', 'Kualitas Produk', 4, true),
('faq_5', 'Apakah bisa melakukan custom ucapan di atas kue?', 'Tentu bisa! Silakan cantumkan pesan ucapan, lilin, atau catatan khusus pada kolom "Catatan Tambahan" saat melakukan checkout di website.', 'Pemesanan', 5, true)
ON CONFLICT (id) DO NOTHING;
