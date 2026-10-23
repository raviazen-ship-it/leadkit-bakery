export interface BusinessSettings {
  id: string;
  store_name: string;
  logo_url: string;
  description: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  instagram_handle: string;
  instagram_url: string;
  address: string;
  city: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  google_maps_embed_url: string;
  google_maps_share_url: string;
  business_hours: string;
  pickup_instructions: string;
  delivery_areas: string;
  delivery_fee_base: number;
  free_delivery_threshold: number;
  min_order_amount: number;
  min_preorder_days: number;
  payment_methods: PaymentMethod[];
  announcement_enabled: boolean;
  announcement_text: string;
  hero_eyebrow: string;
  hero_headline: string;
  hero_description: string;
  hero_image_url: string;
  ordering_policy: string;
  cancellation_policy: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_name: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_default: boolean;
  is_available: boolean;
  display_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  base_price: number;
  main_image: string;
  gallery: string[];
  is_available: boolean;
  is_featured: boolean;
  badge: string;
  min_preorder_days: number;
  prep_time_hours: number;
  allergens: string;
  storage_instructions: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
  category?: Category;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  banner_image: string;
  cta_text: string;
  cta_link: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  featured_product_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'Baru'
  | 'Menunggu Konfirmasi'
  | 'Dikonfirmasi'
  | 'Diproses'
  | 'Siap Diambil/Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export type PaymentStatus =
  | 'Belum Dibayar'
  | 'Menunggu Verifikasi'
  | 'Dibayar'
  | 'Dikembalikan';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  variant_id: string | null;
  variant_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp: string;
  order_type: 'pickup' | 'delivery';
  delivery_address: string;
  fulfillment_date: string; // YYYY-MM-DD
  fulfillment_time_slot: string;
  customer_notes: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method_id: string;
  payment_method_name: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  internal_notes: string;
  cancellation_reason: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
}
