import { getSQLiteDb } from './sqlite';
import type {
  BusinessSettings,
  Category,
  Product,
  ProductVariant,
  Campaign,
  Order,
  OrderItem,
  FAQ,
  OrderStatus,
  PaymentStatus,
  Customer,
} from '../../types';
import { generateOrderNumber } from '../utils';
import { hashPassword } from '../auth';

// Helper to determine storage mode
export function getStorageMode(): 'supabase' | 'local' {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http') && !url.includes('your-project-id')) {
    return 'supabase';
  }
  return 'local';
}

// -------------------------------------------------------------
// 1. BUSINESS SETTINGS
// -------------------------------------------------------------
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const db = getSQLiteDb();
  const row = db.prepare('SELECT * FROM business_settings WHERE id = ?').get('default') as any;
  if (!row) {
    throw new Error('Business settings not found in database');
  }

  return {
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    delivery_fee_base: Number(row.delivery_fee_base),
    free_delivery_threshold: Number(row.free_delivery_threshold),
    min_order_amount: Number(row.min_order_amount),
    min_preorder_days: Number(row.min_preorder_days),
    payment_methods: JSON.parse(row.payment_methods || '[]'),
    announcement_enabled: Boolean(row.announcement_enabled),
  };
}

export async function updateBusinessSettings(
  updates: Partial<BusinessSettings>
): Promise<BusinessSettings> {
  const current = await getBusinessSettings();
  const db = getSQLiteDb();
  const now = new Date().toISOString();

  const merged: BusinessSettings = {
    ...current,
    ...updates,
    updated_at: now,
  };

  const stmt = db.prepare(`
    UPDATE business_settings SET
      store_name = ?,
      logo_url = ?,
      description = ?,
      whatsapp_number = ?,
      phone_number = ?,
      email = ?,
      instagram_handle = ?,
      instagram_url = ?,
      address = ?,
      city = ?,
      postal_code = ?,
      latitude = ?,
      longitude = ?,
      google_maps_embed_url = ?,
      google_maps_share_url = ?,
      business_hours = ?,
      pickup_instructions = ?,
      delivery_areas = ?,
      delivery_fee_base = ?,
      free_delivery_threshold = ?,
      min_order_amount = ?,
      min_preorder_days = ?,
      payment_methods = ?,
      announcement_enabled = ?,
      announcement_text = ?,
      hero_eyebrow = ?,
      hero_headline = ?,
      hero_description = ?,
      hero_image_url = ?,
      ordering_policy = ?,
      cancellation_policy = ?,
      updated_at = ?
    WHERE id = 'default'
  `);

  stmt.run(
    merged.store_name,
    merged.logo_url,
    merged.description,
    merged.whatsapp_number,
    merged.phone_number,
    merged.email,
    merged.instagram_handle,
    merged.instagram_url,
    merged.address,
    merged.city,
    merged.postal_code,
    merged.latitude,
    merged.longitude,
    merged.google_maps_embed_url,
    merged.google_maps_share_url,
    merged.business_hours,
    merged.pickup_instructions,
    merged.delivery_areas,
    merged.delivery_fee_base,
    merged.free_delivery_threshold,
    merged.min_order_amount,
    merged.min_preorder_days,
    JSON.stringify(merged.payment_methods),
    merged.announcement_enabled ? 1 : 0,
    merged.announcement_text,
    merged.hero_eyebrow,
    merged.hero_headline,
    merged.hero_description,
    merged.hero_image_url,
    merged.ordering_policy,
    merged.cancellation_policy,
    now
  );

  return merged;
}

// -------------------------------------------------------------
// 2. CATEGORIES
// -------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const db = getSQLiteDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all() as any[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || '',
    display_order: Number(r.display_order),
    is_active: Boolean(r.is_active),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function upsertCategory(cat: Partial<Category>): Promise<Category> {
  const db = getSQLiteDb();
  const now = new Date().toISOString();
  const id = cat.id || `cat_${Date.now()}`;
  const slug =
    cat.slug ||
    (cat.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE categories SET
        name = ?,
        slug = ?,
        description = ?,
        display_order = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ?
    `).run(cat.name || '', slug, cat.description || '', cat.display_order ?? 0, cat.is_active !== false ? 1 : 0, now, id);
  } else {
    db.prepare(`
      INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cat.name || '', slug, cat.description || '', cat.display_order ?? 0, cat.is_active !== false ? 1 : 0, now, now);
  }

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    display_order: Number(row.display_order),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = getSQLiteDb();
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return true;
}

// -------------------------------------------------------------
// 3. PRODUCTS & VARIANTS
// -------------------------------------------------------------
export async function getProducts(filters?: {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  availableOnly?: boolean;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  const db = getSQLiteDb();
  let sql = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
  const params: any[] = [];

  if (filters?.availableOnly) {
    sql += ' AND p.is_available = 1';
  }
  if (filters?.featuredOnly) {
    sql += ' AND p.is_featured = 1';
  }
  if (filters?.categoryId) {
    sql += ' AND p.category_id = ?';
    params.push(filters.categoryId);
  }
  if (filters?.categorySlug) {
    sql += ' AND c.slug = ?';
    params.push(filters.categorySlug);
  }
  if (filters?.search) {
    sql += ' AND (p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY p.display_order ASC, p.name ASC';

  const rows = db.prepare(sql).all(...params) as any[];
  const variantStmt = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC, price ASC');

  return rows.map((r) => {
    const rawVariants = variantStmt.all(r.id) as any[];
    const variants: ProductVariant[] = rawVariants.map((v) => ({
      id: v.id,
      product_id: v.product_id,
      name: v.name,
      price: Number(v.price),
      is_default: Boolean(v.is_default),
      is_available: Boolean(v.is_available),
      display_order: Number(v.display_order),
      created_at: v.created_at,
    }));

    return {
      id: r.id,
      category_id: r.category_id,
      name: r.name,
      slug: r.slug,
      short_description: r.short_description,
      description: r.description,
      base_price: Number(r.base_price),
      main_image: r.main_image,
      gallery: JSON.parse(r.gallery || '[]'),
      is_available: Boolean(r.is_available),
      is_featured: Boolean(r.is_featured),
      badge: r.badge || '',
      min_preorder_days: Number(r.min_preorder_days || 0),
      prep_time_hours: Number(r.prep_time_hours || 0),
      allergens: r.allergens || '',
      storage_instructions: r.storage_instructions || '',
      display_order: Number(r.display_order || 0),
      created_at: r.created_at,
      updated_at: r.updated_at,
      variants,
      category: r.category_name
        ? {
            id: r.category_id,
            name: r.category_name,
            slug: r.category_slug,
            description: '',
            display_order: 0,
            is_active: true,
          }
        : undefined,
    };
  });
}

export async function getProduct(idOrSlug: string): Promise<Product | null> {
  const db = getSQLiteDb();
  const row = db
    .prepare(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? OR p.slug = ?'
    )
    .get(idOrSlug, idOrSlug) as any;

  if (!row) return null;

  const rawVariants = db
    .prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC, price ASC')
    .all(row.id) as any[];

  const variants: ProductVariant[] = rawVariants.map((v) => ({
    id: v.id,
    product_id: v.product_id,
    name: v.name,
    price: Number(v.price),
    is_default: Boolean(v.is_default),
    is_available: Boolean(v.is_available),
    display_order: Number(v.display_order),
    created_at: v.created_at,
  }));

  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    description: row.description,
    base_price: Number(row.base_price),
    main_image: row.main_image,
    gallery: JSON.parse(row.gallery || '[]'),
    is_available: Boolean(row.is_available),
    is_featured: Boolean(row.is_featured),
    badge: row.badge || '',
    min_preorder_days: Number(row.min_preorder_days || 0),
    prep_time_hours: Number(row.prep_time_hours || 0),
    allergens: row.allergens || '',
    storage_instructions: row.storage_instructions || '',
    display_order: Number(row.display_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    variants,
    category: row.category_name
      ? {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: '',
          display_order: 0,
          is_active: true,
        }
      : undefined,
  };
}

export async function upsertProduct(
  prod: Partial<Product>,
  variants?: Partial<ProductVariant>[]
): Promise<Product> {
  const db = getSQLiteDb();
  const now = new Date().toISOString();
  const id = prod.id || `prod_${Date.now()}`;
  const slug =
    prod.slug ||
    (prod.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE products SET
        category_id = ?,
        name = ?,
        slug = ?,
        short_description = ?,
        description = ?,
        base_price = ?,
        main_image = ?,
        gallery = ?,
        is_available = ?,
        is_featured = ?,
        badge = ?,
        min_preorder_days = ?,
        prep_time_hours = ?,
        allergens = ?,
        storage_instructions = ?,
        display_order = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      prod.category_id || null,
      prod.name || '',
      slug,
      prod.short_description || '',
      prod.description || '',
      prod.base_price ?? 0,
      prod.main_image || '',
      JSON.stringify(prod.gallery || []),
      prod.is_available !== false ? 1 : 0,
      prod.is_featured ? 1 : 0,
      prod.badge || '',
      prod.min_preorder_days ?? 1,
      prod.prep_time_hours ?? 24,
      prod.allergens || '',
      prod.storage_instructions || '',
      prod.display_order ?? 0,
      now,
      id
    );
  } else {
    db.prepare(`
      INSERT INTO products (
        id, category_id, name, slug, short_description, description, base_price,
        main_image, gallery, is_available, is_featured, badge, min_preorder_days,
        prep_time_hours, allergens, storage_instructions, display_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      prod.category_id || null,
      prod.name || '',
      slug,
      prod.short_description || '',
      prod.description || '',
      prod.base_price ?? 0,
      prod.main_image || '',
      JSON.stringify(prod.gallery || []),
      prod.is_available !== false ? 1 : 0,
      prod.is_featured ? 1 : 0,
      prod.badge || '',
      prod.min_preorder_days ?? 1,
      prod.prep_time_hours ?? 24,
      prod.allergens || '',
      prod.storage_instructions || '',
      prod.display_order ?? 0,
      now,
      now
    );
  }

  // Handle variants if provided
  if (variants && Array.isArray(variants)) {
    // Delete variants removed or replace
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);

    const insertVar = db.prepare(`
      INSERT INTO product_variants (id, product_id, name, price, is_default, is_available, display_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    variants.forEach((v, idx) => {
      const varId = v.id || `var_${Date.now()}_${idx}`;
      insertVar.run(
        varId,
        id,
        v.name || 'Pilihan Standar',
        v.price ?? prod.base_price ?? 0,
        v.is_default ? 1 : idx === 0 ? 1 : 0,
        v.is_available !== false ? 1 : 0,
        v.display_order ?? idx + 1,
        now
      );
    });
  }

  const result = await getProduct(id);
  if (!result) throw new Error('Failed to retrieve upserted product');
  return result;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getSQLiteDb();
  db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return true;
}

// -------------------------------------------------------------
// 4. CAMPAIGNS
// -------------------------------------------------------------
export async function getCampaigns(): Promise<Campaign[]> {
  const db = getSQLiteDb();
  const rows = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all() as any[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    subtitle: r.subtitle || '',
    description: r.description,
    banner_image: r.banner_image,
    cta_text: r.cta_text,
    cta_link: r.cta_link,
    start_date: r.start_date,
    end_date: r.end_date,
    is_active: Boolean(r.is_active),
    featured_product_ids: JSON.parse(r.featured_product_ids || '[]'),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function getActiveCampaign(): Promise<Campaign | null> {
  const db = getSQLiteDb();
  const row = db.prepare('SELECT * FROM campaigns WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1').get() as any;
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle || '',
    description: row.description,
    banner_image: row.banner_image,
    cta_text: row.cta_text,
    cta_link: row.cta_link,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: Boolean(row.is_active),
    featured_product_ids: JSON.parse(row.featured_product_ids || '[]'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function upsertCampaign(camp: Partial<Campaign>): Promise<Campaign> {
  const db = getSQLiteDb();
  const now = new Date().toISOString();
  const id = camp.id || `camp_${Date.now()}`;
  const slug =
    camp.slug ||
    (camp.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const existing = db.prepare('SELECT id FROM campaigns WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE campaigns SET
        title = ?,
        slug = ?,
        subtitle = ?,
        description = ?,
        banner_image = ?,
        cta_text = ?,
        cta_link = ?,
        start_date = ?,
        end_date = ?,
        is_active = ?,
        featured_product_ids = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      camp.title || '',
      slug,
      camp.subtitle || '',
      camp.description || '',
      camp.banner_image || '',
      camp.cta_text || 'Pesan Sekarang',
      camp.cta_link || '/produk',
      camp.start_date || null,
      camp.end_date || null,
      camp.is_active !== false ? 1 : 0,
      JSON.stringify(camp.featured_product_ids || []),
      now,
      id
    );
  } else {
    db.prepare(`
      INSERT INTO campaigns (
        id, title, slug, subtitle, description, banner_image, cta_text, cta_link,
        start_date, end_date, is_active, featured_product_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      camp.title || '',
      slug,
      camp.subtitle || '',
      camp.description || '',
      camp.banner_image || '',
      camp.cta_text || 'Pesan Sekarang',
      camp.cta_link || '/produk',
      camp.start_date || null,
      camp.end_date || null,
      camp.is_active !== false ? 1 : 0,
      JSON.stringify(camp.featured_product_ids || []),
      now,
      now
    );
  }

  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id) as any;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    description: row.description,
    banner_image: row.banner_image,
    cta_text: row.cta_text,
    cta_link: row.cta_link,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: Boolean(row.is_active),
    featured_product_ids: JSON.parse(row.featured_product_ids || '[]'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// -------------------------------------------------------------
// 5. ORDERS & CHECKOUT (WITH STRICT SERVER VALIDATION)
// -------------------------------------------------------------
export interface CreateOrderInput {
  customer_id?: string;
  customer_name: string;
  customer_whatsapp: string;
  order_type: 'pickup' | 'delivery';
  delivery_address?: string;
  fulfillment_date: string; // YYYY-MM-DD
  fulfillment_time_slot: string;
  customer_notes?: string;
  payment_method_id: string;
  payment_status?: 'Belum Dibayar' | 'Dibayar' | 'Dibatalkan';
  idempotency_key?: string;
  items: Array<{
    product_id: string;
    variant_id: string;
    quantity: number;
  }>;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const db = getSQLiteDb();
  const settings = await getBusinessSettings();

  // Idempotency check (CHK-17)
  if (input.idempotency_key) {
    const existing = db.prepare('SELECT id FROM orders WHERE idempotency_key = ?').get(input.idempotency_key) as any;
    if (existing && existing.id) {
      const existingOrder = await getOrder(existing.id);
      if (existingOrder) {
        return { success: true, order: existingOrder };
      }
    }
  }

  // Basic Validation
  if (!input.customer_name?.trim()) {
    return { success: false, error: 'Nama pelanggan wajib diisi.' };
  }
  if (!input.customer_whatsapp?.trim()) {
    return { success: false, error: 'Nomor WhatsApp wajib diisi.' };
  }
  if (!input.fulfillment_date) {
    return { success: false, error: 'Tanggal pengambilan/pengiriman wajib dipilih.' };
  }
  if (!input.fulfillment_time_slot) {
    return { success: false, error: 'Slot waktu wajib dipilih.' };
  }
  if (input.order_type === 'delivery' && !input.delivery_address?.trim()) {
    return { success: false, error: 'Alamat pengiriman wajib diisi untuk opsi Delivery.' };
  }
  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Keranjang belanja kosong.' };
  }

  // Date lead time validation
  const targetDate = new Date(`${input.fulfillment_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { success: false, error: 'Tanggal pesanan tidak boleh di masa lampau.' };
  }

  // Verify products & recalculate price strictly from DB
  let subtotal = 0;
  let maxRequiredPreorderDays = settings.min_preorder_days;
  const verifiedItems: Array<{
    id: string;
    product_id: string;
    product_name: string;
    variant_id: string;
    variant_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }> = [];

  for (const item of input.items) {
    const prod = (await getProduct(item.product_id)) as Product | null;
    if (!prod) {
      return { success: false, error: `Produk ID ${item.product_id} tidak ditemukan.` };
    }
    if (!prod.is_available) {
      return { success: false, error: `Produk "${prod.name}" saat ini sedang tidak tersedia.` };
    }

    if (prod.min_preorder_days > maxRequiredPreorderDays) {
      maxRequiredPreorderDays = prod.min_preorder_days;
    }

    const variant = prod.variants?.find((v) => v.id === item.variant_id);
    if (!variant) {
      return { success: false, error: `Varian tidak ditemukan untuk produk "${prod.name}".` };
    }
    if (!variant.is_available) {
      return { success: false, error: `Varian "${variant.name}" untuk "${prod.name}" sedang tidak tersedia.` };
    }

    const qty = Math.max(1, Math.floor(item.quantity));
    const unitPrice = variant.price;
    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    verifiedItems.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      product_id: prod.id,
      product_name: prod.name,
      variant_id: variant.id,
      variant_name: variant.name,
      unit_price: unitPrice,
      quantity: qty,
      total_price: itemTotal,
    });
  }

  // Check minimum preorder days
  if (diffDays < maxRequiredPreorderDays) {
    return {
      success: false,
      error: `Pemesanan menu pilihan Anda memerlukan waktu persiapan minimal ${maxRequiredPreorderDays} hari sebelumnya.`,
    };
  }

  // Check minimum order amount
  if (settings.min_order_amount > 0 && subtotal < settings.min_order_amount) {
    return {
      success: false,
      error: `Minimum pemesanan adalah Rp ${settings.min_order_amount.toLocaleString('id-ID')}. Subtotal Anda saat ini Rp ${subtotal.toLocaleString('id-ID')}.`,
    };
  }

  // Calculate delivery fee
  let deliveryFee = 0;
  if (input.order_type === 'delivery') {
    if (settings.free_delivery_threshold > 0 && subtotal >= settings.free_delivery_threshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = settings.delivery_fee_base;
    }
  }

  const totalAmount = subtotal + deliveryFee;

  // Resolve payment method name & initial payment status (D-01, D-04, PAY-02)
  let paymentMethodName = input.payment_method_id;
  if (input.payment_method_id === 'gateway_qris') {
    paymentMethodName = 'QRIS Instan (Terverifikasi Otomatis)';
  } else if (input.payment_method_id === 'bank_bca') {
    paymentMethodName = 'Transfer Bank BCA (1234-5678-90)';
  } else if (input.payment_method_id === 'bank_mandiri') {
    paymentMethodName = 'Transfer Bank Mandiri (987-654-321-0123)';
  } else if (input.payment_method_id === 'pickup_cash') {
    paymentMethodName = 'Bayar di Counter Toko (Pick-up)';
  } else {
    const paymentMethod = settings.payment_methods.find((p) => p.id === input.payment_method_id);
    if (paymentMethod) paymentMethodName = paymentMethod.name;
  }

  const isAutoPaid = input.payment_status === 'Dibayar';
  const initialPaymentStatus = isAutoPaid ? 'Dibayar' : (input.payment_status || 'Belum Dibayar');

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const orderNumber = generateOrderNumber();
  const publicToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const now = new Date().toISOString();

  // Save order to SQLite
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_id, customer_name, customer_whatsapp, order_type, delivery_address,
      fulfillment_date, fulfillment_time_slot, customer_notes, subtotal, delivery_fee,
      total_amount, payment_method_id, payment_method_name, order_status, payment_status,
      internal_notes, cancellation_reason, idempotency_key, public_token, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  insertOrder.run(
    orderId,
    orderNumber,
    input.customer_id || null,
    input.customer_name.trim(),
    input.customer_whatsapp.trim(),
    input.order_type,
    input.delivery_address?.trim() || '',
    input.fulfillment_date,
    input.fulfillment_time_slot,
    input.customer_notes?.trim() || '',
    subtotal,
    deliveryFee,
    totalAmount,
    input.payment_method_id,
    paymentMethodName,
    'Baru',
    initialPaymentStatus,
    '',
    '',
    input.idempotency_key || null,
    publicToken,
    now,
    now
  );

  // Save order items snapshot
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, variant_id, variant_name,
      unit_price, quantity, total_price, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of verifiedItems) {
    insertItem.run(
      item.id,
      orderId,
      item.product_id,
      item.product_name,
      item.variant_id,
      item.variant_name,
      item.unit_price,
      item.quantity,
      item.total_price,
      now
    );
  }

  const savedOrder = await getOrder(orderId);
  if (!savedOrder) {
    return { success: false, error: 'Gagal memuat pesanan setelah tersimpan.' };
  }

  return { success: true, order: savedOrder };
}

export async function getOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: Order[]; total: number }> {
  const db = getSQLiteDb();
  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (filters?.status && filters.status !== 'all') {
    whereClause += ' AND order_status = ?';
    params.push(filters.status);
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    whereClause += ' AND payment_status = ?';
    params.push(filters.paymentStatus);
  }
  if (filters?.search) {
    whereClause += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_whatsapp LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }
  if (filters?.startDate) {
    whereClause += ' AND fulfillment_date >= ?';
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    whereClause += ' AND fulfillment_date <= ?';
    params.push(filters.endDate);
  }

  const countRow = db.prepare(`SELECT count(*) as total FROM orders ${whereClause}`).get(...params) as any;
  const total = countRow ? Number(countRow.total) : 0;

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  const orderRows = db
    .prepare(`SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as any[];

  const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC');

  const orders: Order[] = orderRows.map((o) => {
    const rawItems = itemStmt.all(o.id) as any[];
    const items: OrderItem[] = rawItems.map((it) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id,
      product_name: it.product_name,
      variant_id: it.variant_id,
      variant_name: it.variant_name,
      unit_price: Number(it.unit_price),
      quantity: Number(it.quantity),
      total_price: Number(it.total_price),
      created_at: it.created_at,
    }));

    return {
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_whatsapp: o.customer_whatsapp,
      order_type: o.order_type,
      delivery_address: o.delivery_address || '',
      fulfillment_date: o.fulfillment_date,
      fulfillment_time_slot: o.fulfillment_time_slot,
      customer_notes: o.customer_notes || '',
      subtotal: Number(o.subtotal),
      delivery_fee: Number(o.delivery_fee),
      total_amount: Number(o.total_amount),
      payment_method_id: o.payment_method_id,
      payment_method_name: o.payment_method_name,
      order_status: o.order_status,
      payment_status: o.payment_status,
      internal_notes: o.internal_notes || '',
      cancellation_reason: o.cancellation_reason || '',
      idempotency_key: o.idempotency_key || undefined,
      public_token: o.public_token || undefined,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items,
    };
  });

  return { orders, total };
}

export async function getOrder(idOrNumberOrToken: string): Promise<Order | null> {
  const db = getSQLiteDb();
  const o = db
    .prepare('SELECT * FROM orders WHERE id = ? OR order_number = ? OR public_token = ?')
    .get(idOrNumberOrToken, idOrNumberOrToken, idOrNumberOrToken) as any;
  if (!o) return null;

  const rawItems = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC').all(o.id) as any[];
  const items: OrderItem[] = rawItems.map((it) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id,
    product_name: it.product_name,
    variant_id: it.variant_id,
    variant_name: it.variant_name,
    unit_price: Number(it.unit_price),
    quantity: Number(it.quantity),
    total_price: Number(it.total_price),
    created_at: it.created_at,
  }));

  return {
    id: o.id,
    order_number: o.order_number,
    customer_id: o.customer_id || undefined,
    customer_name: o.customer_name,
    customer_whatsapp: o.customer_whatsapp,
    order_type: o.order_type,
    delivery_address: o.delivery_address || '',
    fulfillment_date: o.fulfillment_date,
    fulfillment_time_slot: o.fulfillment_time_slot,
    customer_notes: o.customer_notes || '',
    subtotal: Number(o.subtotal),
    delivery_fee: Number(o.delivery_fee),
    total_amount: Number(o.total_amount),
    payment_method_id: o.payment_method_id,
    payment_method_name: o.payment_method_name,
    order_status: o.order_status,
    payment_status: o.payment_status,
    internal_notes: o.internal_notes || '',
    cancellation_reason: o.cancellation_reason || '',
    idempotency_key: o.idempotency_key || undefined,
    public_token: o.public_token || undefined,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items,
  };
}

export async function updateOrderStatus(
  id: string,
  updates: {
    order_status?: OrderStatus;
    payment_status?: PaymentStatus;
    internal_notes?: string;
    cancellation_reason?: string;
  }
): Promise<Order | null> {
  const db = getSQLiteDb();
  const existing = await getOrder(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const newOrderStatus = updates.order_status || existing.order_status;
  const newPaymentStatus = updates.payment_status || existing.payment_status;
  const newInternalNotes = updates.internal_notes !== undefined ? updates.internal_notes : existing.internal_notes;
  const newCancelReason = updates.cancellation_reason !== undefined ? updates.cancellation_reason : existing.cancellation_reason;

  db.prepare(`
    UPDATE orders SET
      order_status = ?,
      payment_status = ?,
      internal_notes = ?,
      cancellation_reason = ?,
      updated_at = ?
    WHERE id = ?
  `).run(newOrderStatus, newPaymentStatus, newInternalNotes, newCancelReason, now, existing.id);

  return getOrder(existing.id);
}

// -------------------------------------------------------------
// 6. FAQS
// -------------------------------------------------------------
export async function getFAQs(category?: string): Promise<FAQ[]> {
  const db = getSQLiteDb();
  let sql = 'SELECT * FROM faqs WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }
  sql += ' ORDER BY display_order ASC, created_at ASC';

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    category: r.category || 'Umum',
    display_order: Number(r.display_order),
    is_active: Boolean(r.is_active),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function upsertFAQ(faq: Partial<FAQ>): Promise<FAQ> {
  const db = getSQLiteDb();
  const now = new Date().toISOString();
  const id = faq.id || `faq_${Date.now()}`;

  const existing = db.prepare('SELECT id FROM faqs WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE faqs SET
        question = ?,
        answer = ?,
        category = ?,
        display_order = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ?
    `).run(faq.question || '', faq.answer || '', faq.category || 'Umum', faq.display_order ?? 0, faq.is_active !== false ? 1 : 0, now, id);
  } else {
    db.prepare(`
      INSERT INTO faqs (id, question, answer, category, display_order, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, faq.question || '', faq.answer || '', faq.category || 'Umum', faq.display_order ?? 0, faq.is_active !== false ? 1 : 0, now, now);
  }

  const row = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id) as any;
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    display_order: Number(row.display_order),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function deleteFAQ(id: string): Promise<boolean> {
  const db = getSQLiteDb();
  db.prepare('DELETE FROM faqs WHERE id = ?').run(id);
  return true;
}

// -------------------------------------------------------------
// 7. DASHBOARD OVERVIEW METRICS (BASED ON REAL DB DATA)
// -------------------------------------------------------------
export async function getDashboardOverview() {
  const db = getSQLiteDb();

  const totalOrdersRow = db.prepare('SELECT count(*) as count FROM orders').get() as any;
  const newOrdersRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Baru'").get() as any;
  const inProgressRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status IN ('Dikonfirmasi', 'Diproses', 'Siap Diambil/Dikirim')").get() as any;
  const completedRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Selesai'").get() as any;
  const pendingConfRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status = 'Menunggu Konfirmasi'").get() as any;

  // Real revenue calculated from paid or completed orders
  const revenueRow = db.prepare("SELECT sum(total_amount) as revenue FROM orders WHERE payment_status = 'Dibayar' OR order_status = 'Selesai'").get() as any;

  const outOfStockRow = db.prepare('SELECT count(*) as count FROM products WHERE is_available = 0').get() as any;

  const { orders: recentOrders } = await getOrders({ limit: 6 });
  const activeCampaign = await getActiveCampaign();

  return {
    totalOrders: totalOrdersRow ? Number(totalOrdersRow.count) : 0,
    newOrders: newOrdersRow ? Number(newOrdersRow.count) : 0,
    inProgressOrders: inProgressRow ? Number(inProgressRow.count) : 0,
    completedOrders: completedRow ? Number(completedRow.count) : 0,
    pendingConfirmationOrders: pendingConfRow ? Number(pendingConfRow.count) : 0,
    totalRevenue: revenueRow && revenueRow.revenue ? Number(revenueRow.revenue) : 0,
    outOfStockCount: outOfStockRow ? Number(outOfStockRow.count) : 0,
    recentOrders,
    activeCampaign,
  };
}

// -------------------------------------------------------------
// 8. CUSTOMER ACCOUNTS & DASHBOARD
// -------------------------------------------------------------

export async function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}): Promise<{ success: boolean; customer?: Customer; error?: string }> {
  const db = getSQLiteDb();
  const email = data.email.trim().toLowerCase();

  // Validate
  if (!data.name?.trim()) return { success: false, error: 'Nama lengkap wajib diisi.' };
  if (!email || !email.includes('@')) return { success: false, error: 'Alamat email tidak valid.' };
  if (!data.phone?.trim()) return { success: false, error: 'Nomor WhatsApp wajib diisi.' };
  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Kata sandi minimal 6 karakter.' };
  }

  // Check unique email
  const existing = db.prepare('SELECT id FROM customers WHERE LOWER(email) = ?').get(email);
  if (existing) {
    return { success: false, error: 'Alamat email ini sudah terdaftar. Silakan masuk.' };
  }

  const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = hashPassword(data.password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO customers (id, name, email, phone, password_hash, address, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name.trim(),
    email,
    data.phone.trim(),
    passwordHash,
    data.address?.trim() || '',
    now,
    now
  );

  const customer = await getCustomerById(id);
  if (!customer) return { success: false, error: 'Gagal membuat akun pelanggan.' };
  return { success: true, customer };
}

export async function verifyCustomer(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; customer?: Customer; error?: string }> {
  const db = getSQLiteDb();
  const email = emailInput.trim().toLowerCase();

  const row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(email) as any;
  if (!row) {
    return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
  }

  const hash = hashPassword(passwordInput);
  if (hash !== row.password_hash) {
    return { success: false, error: 'Email atau kata sandi tidak sesuai.' };
  }

  return {
    success: true,
    customer: {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
  };
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const db = getSQLiteDb();
  const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const db = getSQLiteDb();
  const row = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?').get(email.trim().toLowerCase()) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function updateCustomerProfile(
  id: string,
  updates: { name?: string; phone?: string; address?: string }
): Promise<Customer | null> {
  const db = getSQLiteDb();
  const existing = await getCustomerById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = updates.name !== undefined ? updates.name.trim() : existing.name;
  const phone = updates.phone !== undefined ? updates.phone.trim() : existing.phone;
  const address = (updates.address !== undefined ? updates.address.trim() : existing.address) || '';

  db.prepare(`
    UPDATE customers SET name = ?, phone = ?, address = ?, updated_at = ? WHERE id = ?
  `).run(name, phone, address, now, id);

  return getCustomerById(id);
}

export async function getCustomerOrders(customerId: string, phone?: string): Promise<Order[]> {
  const db = getSQLiteDb();
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params: any[] = [];

  if (phone && phone.trim()) {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const partialPhone = cleanPhone.slice(-8); // match last 8 digits
    sql += ' AND (customer_whatsapp LIKE ? OR customer_whatsapp = ?)';
    params.push(`%${partialPhone}%`, phone.trim());
  }

  sql += ' ORDER BY created_at DESC LIMIT 50';

  const orderRows = db.prepare(sql).all(...params) as any[];
  const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC');

  return orderRows.map((o) => {
    const rawItems = itemStmt.all(o.id) as any[];
    const items: OrderItem[] = rawItems.map((it) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id,
      product_name: it.product_name,
      variant_id: it.variant_id,
      variant_name: it.variant_name,
      unit_price: Number(it.unit_price),
      quantity: Number(it.quantity),
      total_price: Number(it.total_price),
      created_at: it.created_at,
    }));

    return {
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name,
      customer_whatsapp: o.customer_whatsapp,
      order_type: o.order_type,
      delivery_address: o.delivery_address || '',
      fulfillment_date: o.fulfillment_date,
      fulfillment_time_slot: o.fulfillment_time_slot,
      customer_notes: o.customer_notes || '',
      subtotal: Number(o.subtotal),
      delivery_fee: Number(o.delivery_fee),
      total_amount: Number(o.total_amount),
      payment_method_id: o.payment_method_id,
      payment_method_name: o.payment_method_name,
      order_status: o.order_status,
      payment_status: o.payment_status,
      internal_notes: o.internal_notes || '',
      cancellation_reason: o.cancellation_reason || '',
      created_at: o.created_at,
      updated_at: o.updated_at,
      items,
    };
  });
}

