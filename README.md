# 🥐 LeadKit Bakery & Catering — Website & Admin Dashboard

Website bisnis bakery artisan dan katering modern dengan sistem pemesanan online end-to-end, penghitungan ongkir otomatis, integrasi WhatsApp, serta **Admin Dashboard** terintegrasi untuk pemilik usaha di Indonesia.

Dibangun dengan filosofi **Modern Earthy Artisan Bakery — Warm, Minimal, Elegant, Appetizing**.

---

## 📑 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Batasan Struktur Halaman](#-batasan-struktur-halaman)
3. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
4. [Struktur Folder Project](#-struktur-folder-project)
5. [Struktur Database & Migration](#-struktur-database--migration)
6. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
7. [Panduan Konfigurasi Supabase (Produksi)](#-panduan-konfigurasi-supabase-produksi)
8. [Cara Menguji Alur Pemesanan (Checkout)](#-cara-menguji-alur-pemesanan-checkout)
9. [Akses & Akun Admin Pertama](#-akses--akun-admin-pertama)
10. [Konfigurasi Eksternal (Opsional)](#-konfigurasi-eksternal-opsional)

---

## ✨ Fitur Utama

### 🛒 Pengalaman Pelanggan (Halaman Publik)
- **Tepat Tiga Halaman Publik**: Beranda (`/`), Katalog Produk & Pemesanan (`/produk`), Kontak & Lokasi (`/kontak`).
- **Announcement Bar Dinamis**: Pesan promo musiman di bar atas yang dapat diaktifkan/dinonaktifkan langsung oleh admin.
- **Hero & Cerita Artisan**: Tampilan editorial dengan foto makanan hangat, filosofi slow-fermented, dan tanpa pengawet.
- **Katalog Menu Interaktif**:
  - Filter kategori dinamis (Cakes, Pastry, Cookies, Catering, Hampers).
  - Pencarian nama produk & deskripsi real-time.
  - Filter ketersediaan (Ready Stock) dan pengurutan harga.
- **Modal Detail Produk & Pilihan Varian**:
  - Pilihan ukuran/varian wajib (contoh: 16cm vs 20cm, Box isi 4 vs Box isi 6) dengan perubahan harga otomatis.
  - Keterangan alergen, petunjuk penyimpanan, dan waktu minimum pre-order.
- **Keranjang Belanja (Cart Drawer)**: Penyesuaian kuantitas, subtotal, validasi batas minimum pemesanan.
- **Checkout Modal**:
  - Pilihan **Ambil di Toko (Pick-up)** atau **Pengiriman (Delivery)** dengan alamat lengkap.
  - Validasi batas waktu pre-order (tidak dapat memilih tanggal lampau atau kurang dari waktu persiapan dapur).
  - Pilihan slot jam pengambilan/pengantaran.
  - Penghitungan ongkos kirim dan gratis ongkir otomatis.
  - Pembuatan nomor pesanan unik (`ORD-YYYYMMDD-XXXX`).
  - **Tombol WhatsApp Otomatis**: Pesan WhatsApp pre-formatted yang memuat rincian pesanan dan total harga tersimpan.
- **Peta Google Maps & FAQ**: Google Maps embed interaktif dengan tombol "Buka di Google Maps" serta akordeon FAQ yang dapat dikelola admin.

### 🛡️ Dashboard Admin Pemilik Usaha
- **Autentikasi Terproteksi**: Login aman dengan session cookie HTTP-only (`/admin/login`).
- **Ringkasan (Overview) Real-Time (`/admin`)**:
  - Jumlah pesanan baru, sedang diproses, dan selesai.
  - Total omzet terverifikasi yang dihitung dari transaksi database nyata.
  - Peringatan stok habis & status campaign aktif.
  - Riwayat pesanan terbaru.
- **Pengelolaan Pesanan (`/admin/pesanan`)**:
  - Filter berdasarkan status pesanan dan status pembayaran.
  - Pencarian nomor order, nama pemesan, atau WhatsApp.
  - Pembaruan status pesanan (`Baru`, `Dikonfirmasi`, `Diproses`, `Siap Diambil/Dikirim`, `Selesai`, `Dibatalkan`).
  - Pembaruan status pembayaran manual terpisah (`Belum Dibayar`, `Menunggu Verifikasi`, `Dibayar`, `Dikembalikan`).
  - Catatan internal admin dan pencatatan alasan pembatalan.
  - Ekspor seluruh data transaksi ke **CSV**.
  - Tombol **Chat WhatsApp Langsung** ke nomor pelanggan.
- **Pengelolaan Produk & Varian (`/admin/produk`)**:
  - Tambah, edit, hapus produk dan kategori.
  - Upload file foto produk langsung melalui formulir dengan preview instan.
  - Tambah varian ukuran dan harga berbeda untuk setiap produk.
  - Pengaturan label promosi (Best Seller, Favorite, Seasonal).
  - Saklar ketersediaan stok cepat (Tersedia / Habis).
- **Pengaturan Tampilan & Promo (`/admin/tampilan`)**:
  - Ubah teks dan status aktif Announcement Bar.
  - Ubah headline, deskripsi, dan foto Hero Beranda.
  - Atur judul, subjudul, banner, dan status aktif Seasonal Campaign & Hampers.
  - Tampilan live preview langsung di dashboard sebelum disimpan.
- **Pengaturan Bisnis & Lokasi (`/admin/pengaturan`)**:
  - Identitas toko (nama toko, deskripsi, WhatsApp, email, Instagram).
  - Alamat toko & URL Google Maps embed dengan preview peta langsung.
  - Jam operasional, aturan gratis ongkir, dan batas minimum pre-order.
  - Daftar nomor rekening bank manual (BCA, Mandiri, dll.).
  - Pengelola tanya-jawab FAQ.

---

## 🧭 Batasan Struktur Halaman

Sesuai spesifikasi proyek, website publik hanya terdiri dari **Tepat Tiga Halaman**:
1. **Beranda** — `/`
2. **Katalog Produk & Pemesanan** — `/produk`
3. **Kontak, Lokasi & FAQ** — `/kontak`

Seluruh proses melihat detail produk, keranjang belanja, pengisian checkout, dan konfirmasi pesanan dijalankan di dalam modal & drawer pada halaman `/produk` tanpa membuka halaman publik ke-4.

Area admin adalah portal terpisah:
- `/admin/login`
- `/admin`
- `/admin/pesanan`
- `/admin/produk`
- `/admin/tampilan`
- `/admin/pengaturan`

---

## 🛠️ Arsitektur & Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS dengan palet khusus *Artisan Earthy*
- **Icons**: Lucide React
- **Database Engine**:
  - **Local Zero-Config**: Native Node.js SQLite (`node:sqlite` DatabaseSync) untuk pengujian lokal instan tanpa perlu instalasi pihak ketiga.
  - **Cloud Production**: Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`) dengan Row Level Security (RLS) dan migrasi SQL siap pakai.
- **Media Uploads**: Penyimpanan file lokal di `/public/uploads/` atau Supabase Storage bucket.

---

## 📁 Struktur Folder Project

```text
leadkit-bakery/
├── app/
│   ├── api/
│   │   ├── admin/overview/      # Endpoint metrik dashboard
│   │   ├── auth/                # Login, logout, session check
│   │   ├── campaigns/           # CRUD campaign musiman
│   │   ├── categories/          # CRUD kategori
│   │   ├── faqs/                # CRUD FAQ
│   │   ├── orders/              # Checkout & status pesanan
│   │   ├── products/            # CRUD produk & varian
│   │   ├── settings/            # Pengaturan bisnis & tampilan
│   │   └── upload/              # Upload foto produk & banner
│   ├── admin/
│   │   ├── (dashboard)/         # Area admin terlindungi autentikasi
│   │   │   ├── layout.tsx       # Layout admin & verifikasi sesi
│   │   │   ├── page.tsx         # Dashboard overview & metrik
│   │   │   ├── pengaturan/      # Pengaturan toko & lokasi
│   │   │   ├── pesanan/         # Kelola pesanan & ekspor CSV
│   │   │   ├── produk/          # Kelola produk, varian & foto
│   │   │   └── tampilan/        # Banner hero & campaign editor
│   │   └── login/               # Halaman login admin
│   ├── kontak/page.tsx          # Halaman 3: Kontak, Maps & FAQ
│   ├── produk/page.tsx          # Halaman 2: Produk, Cart & Checkout
│   ├── globals.css              # Styling Tailwind & warna earthy
│   ├── layout.tsx               # Root layout & CartProvider
│   └── page.tsx                 # Halaman 1: Beranda toko
├── components/
│   ├── admin/AdminSidebar.tsx   # Navigasi dashboard admin
│   ├── CartDrawer.tsx           # Drawer keranjang belanja
│   ├── CheckoutDrawer.tsx       # Formulir pemesanan & validasi
│   ├── Footer.tsx               # Footer bernuansa earthy
│   ├── Navbar.tsx               # Navigasi & announcement bar
│   ├── OrderConfirmationModal.tsx # Panel konfirmasi & tombol WA
│   └── ProductDetailModal.tsx   # Modal detail varian produk
├── context/
│   └── CartContext.tsx          # State management keranjang belanja
├── lib/
│   ├── auth.ts                  # Enkripsi & verifikasi sesi admin
│   ├── db/
│   │   ├── repository.ts        # Data access layer & validasi harga
│   │   └── sqlite.ts            # Local SQLite database engine & seed
│   ├── supabase/                # Klien Supabase browser & server
│   └── utils.ts                 # Format Rupiah, tanggal, WhatsApp msg
├── public/
│   └── uploads/                 # Folder hasil upload foto produk
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Schema PostgreSQL & RLS
│   └── seed.sql                 # Data awal demo toko & menu
├── .env.example                 # Contoh environment variables
├── package.json
└── tailwind.config.js
```

---

## 🗄️ Struktur Database & Migration

File schema lengkap tersedia di:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/seed.sql`

Tabel yang dibuat:
1. `business_settings`: Identitas toko, kontak, jam operasional, lokasi Google Maps, tarif ongkir, metode pembayaran, teks hero, dan pengumuman.
2. `categories`: Kategori menu (Cakes, Pastry, Cookies, Catering, Hampers).
3. `products`: Detail menu, foto utama, galeri, harga dasar, alergen, dan aturan pre-order.
4. `product_variants`: Pilihan varian ukuran/rasa dan harga masing-masing.
5. `campaigns`: Banner promo musiman, periode aktif, dan tombol CTA.
6. `orders`: Catatan pesanan pelanggan, jadwal penyerahan, rincian biaya, status pesanan, dan status pembayaran.
7. `order_items`: Snapshot harga dan nama produk saat pesanan dibuat (mencegah perubahan riwayat transaksi jika harga produk diubah di masa depan).
8. `faqs`: Pertanyaan umum dan jawaban pada halaman kontak.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- Node.js versi 18 atau lebih baru (disarankan Node v20 atau v25).

### 2. Jalankan Perintah
Buka terminal pada folder project `leadkit-bakery`:

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka peramban di: `http://localhost:3000`

> **Catatan Zero-Config:** Sistem secara otomatis mendeteksi database lokal SQLite dan mengisi data awal toko (seed data) sehingga Anda dapat langsung menguji website tanpa perlu membuat akun Supabase terlebih dahulu!

---

## ☁️ Panduan Konfigurasi Supabase (Produksi)

Jika Anda ingin menghubungkan database ke cloud Supabase:

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Buka file `supabase/migrations/001_initial_schema.sql`, salin seluruh isinya, dan klik **Run**.
4. Buka file `supabase/seed.sql`, salin isinya, dan klik **Run** untuk mengisi menu awal.
5. Buat storage bucket bernama `bakery-media` dengan hak akses publik jika ingin menyimpan gambar di Supabase Storage.
6. Buka menu **Project Settings &rarr; API** di Supabase, lalu salin URL dan Anon Key ke file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=rahasia_sesi_admin_anda
ADMIN_DEFAULT_PASSWORD=password_admin_baru_anda
```

---

## 🧪 Cara Menguji Alur Pemesanan (Checkout)

1. Buka halaman **Produk & Menu** (`/produk`).
2. Pilih salah satu produk (contoh: *Earl Grey Lavender Chiffon Cake*) dan klik **Detail & Pesan**.
3. Pilih varian ukuran (misalnya *Diameter 20 cm*) dan klik **Tambah ke Keranjang**.
4. Klik tombol keranjang di pojok kanan atas atau tombol mengambang di HP untuk membuka **Cart Drawer**.
5. Klik **Lanjut ke Formulir Checkout**.
6. Isi nama pelanggan, nomor WhatsApp, pilih opsi **Ambil di Toko** atau **Kirim ke Alamat**.
7. Pilih tanggal dan slot jam penyerahan.
8. Klik **Kirim Pesanan Sekarang**.
9. Sistem akan memvalidasi harga di server, menyimpan pesanan ke database, dan menampilkan **Panel Konfirmasi** beserta nomor pesanan resmi.
10. Klik tombol **Lanjutkan Konfirmasi ke WhatsApp** untuk membuka percakapan WhatsApp dengan teks pesanan yang sudah diformat rapi.
11. Buka dashboard admin di `/admin/pesanan` untuk melihat pesanan yang baru saja Anda buat!

---

## 🔑 Akses & Akun Admin Pertama

1. Buka URL: `http://localhost:3000/admin/login`
2. Masukkan password default admin:
   - **Password**: `admin123456`
3. Klik **Masuk ke Dashboard**.
4. Anda akan diarahkan ke halaman `/admin` dengan metrik toko dan daftar pesanan.
5. Anda dapat mengganti password ini kapan saja dengan mengubah variabel `ADMIN_DEFAULT_PASSWORD` di `.env.local`.

---

## 🌐 Konfigurasi Eksternal (Opsional)

- **Nomor WhatsApp Toko**: Dapat diubah langsung melalui menu **Pengaturan Bisnis** di dashboard admin tanpa mengubah kode.
- **Peta Google Maps**: Cukup cari toko Anda di Google Maps, klik *Bagikan &rarr; Sematkan Peta*, lalu salin URL embed ke menu Pengaturan Bisnis.
- **Domain Kustom**: Dapat dihubungkan saat melakukan deployment ke Vercel atau penyedia hosting pilihan Anda.
