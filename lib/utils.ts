import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah currency
 * e.g. 285000 -> "Rp 285.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string or Date to Indonesian readable format
 * e.g. "2026-10-25" -> "Minggu, 25 Oktober 2026"
 */
export function formatIndonesianDate(dateInput: string | Date): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

/**
 * Format datetime to Indonesian readable format with hours and minutes
 */
export function formatIndonesianDateTime(dateInput: string | Date): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

/**
 * Generate unique order number: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${randomChars}`;
}

/**
 * Clean phone number to WhatsApp international standard (e.g. 08123... -> 628123...)
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generate WhatsApp checkout message
 */
export function createWhatsAppOrderMessage(order: {
  order_number: string;
  customer_name: string;
  order_type: 'pickup' | 'delivery';
  fulfillment_date: string;
  fulfillment_time_slot: string;
  delivery_address?: string;
  customer_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method_name: string;
  items?: Array<{
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}): string {
  let msg = `Halo Aura Bakery & Catering, saya ingin mengonfirmasi pesanan baru:\n\n`;
  msg += `🧾 *Nomor Pesanan:* ${order.order_number}\n`;
  msg += `👤 *Nama:* ${order.customer_name}\n`;
  msg += `📦 *Metode:* ${order.order_type === 'delivery' ? 'Pengiriman (Delivery)' : 'Ambil Sendiri di Toko (Pick-up)'}\n`;
  msg += `📅 *Tanggal:* ${formatIndonesianDate(order.fulfillment_date)}\n`;
  msg += `⏰ *Waktu:* ${order.fulfillment_time_slot}\n`;

  if (order.order_type === 'delivery' && order.delivery_address) {
    msg += `📍 *Alamat:* ${order.delivery_address}\n`;
  }

  msg += `\n*Rincian Pesanan:*\n`;
  if (order.items && order.items.length > 0) {
    order.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.product_name} (${item.variant_name}) x${item.quantity} = ${formatRupiah(item.total_price)}\n`;
    });
  }

  msg += `\nSubtotal: ${formatRupiah(order.subtotal)}\n`;
  if (order.order_type === 'delivery' && order.delivery_fee > 0) {
    msg += `Ongkos Kirim: ${formatRupiah(order.delivery_fee)}\n`;
  }
  msg += `*Total Pembayaran: ${formatRupiah(order.total_amount)}*\n`;
  msg += `💳 *Metode Bayar:* ${order.payment_method_name}\n`;

  if (order.customer_notes) {
    msg += `📝 *Catatan Khusus:* ${order.customer_notes}\n`;
  }

  msg += `\nMohon informasi ketersediaan slot dan instruksi pembayaran. Terima kasih!`;
  return encodeURIComponent(msg);
}
