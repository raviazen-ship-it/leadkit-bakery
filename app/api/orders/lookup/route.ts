import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/db/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_number, phone } = body;

    if (!order_number || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nomor pesanan dan nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const order = await getOrder(order_number.trim());
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan dengan nomor tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Verify phone matches (last 6 digits match to avoid strict formatting issues)
    const orderPhoneClean = order.customer_whatsapp.replace(/\D/g, '');
    const inputPhoneClean = phone.trim().replace(/\D/g, '');

    if (!orderPhoneClean.endsWith(inputPhoneClean.slice(-6)) && !inputPhoneClean.endsWith(orderPhoneClean.slice(-6))) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp tidak cocok dengan data pemesan.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat melacak pesanan.' },
      { status: 500 }
    );
  }
}
