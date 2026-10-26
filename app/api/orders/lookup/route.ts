import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/db/repository';

// Sliding-window in-memory rate limiter per IP / identifier (SEC-06, T-ACC-04)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // Max 10 attempts per minute

  const record = rateLimitMap.get(ip);
  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check (SEC-06, T-ACC-04)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local_guest';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terlalu banyak percobaan pelacakan. Silakan tunggu 1 menit sebelum mencoba kembali.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, order_number, phone } = body;

    // 2. Direct Token Lookup (ACC-04, SEC-07: Unguessable 128-bit public token)
    if (token && typeof token === 'string') {
      const order = await getOrder(token.trim());
      if (!order || order.public_token !== token.trim()) {
        return NextResponse.json(
          { success: false, error: 'Tautan atau token pelacakan tidak valid atau telah kedaluwarsa.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, order, access_method: 'token' });
    }

    // 3. Order Number + Phone Suffix Lookup (ACC-04)
    if (!order_number || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nomor pesanan dan 4 digit terakhir nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const order = await getOrder(order_number.trim());
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan atau informasi verifikasi tidak cocok.' },
        { status: 404 }
      );
    }

    // Verify phone suffix matches at least the last 4 digits
    const orderPhoneClean = order.customer_whatsapp.replace(/\D/g, '');
    const inputPhoneClean = phone.toString().trim().replace(/\D/g, '');

    const phoneSuffix = inputPhoneClean.slice(-4);
    if (!phoneSuffix || phoneSuffix.length < 4 || !orderPhoneClean.endsWith(phoneSuffix)) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan atau informasi verifikasi tidak cocok.' },
        { status: 404 }
      );
    }

    // Redact sensitive personal data (PII) for guest phone lookup (ACC-04, SEC-07, SEC-09)
    const maskedName = order.customer_name
      ? order.customer_name.charAt(0) + '***'
      : 'Pelanggan';
    const maskedPhone = orderPhoneClean.length > 4
      ? orderPhoneClean.slice(0, 3) + '****' + orderPhoneClean.slice(-4)
      : '****';
    const maskedAddress = order.delivery_address
      ? 'Area Pengiriman Terverifikasi (Detail disamarkan untuk privasi)'
      : undefined;

    const redactedOrder = {
      ...order,
      customer_name: maskedName,
      customer_whatsapp: maskedPhone,
      delivery_address: maskedAddress,
    };

    return NextResponse.json({
      success: true,
      order: redactedOrder,
      is_redacted: true,
      access_method: 'phone_suffix',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses pelacakan pesanan.' },
      { status: 500 }
    );
  }
}
