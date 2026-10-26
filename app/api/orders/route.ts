import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/db/repository';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idempotencyHeader = req.headers.get('x-idempotency-key');
    if (idempotencyHeader && !body.idempotency_key) {
      body.idempotency_key = idempotencyHeader;
    }
    const result = await createOrder(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan Anda berhasil dicatat!',
      order: result.order,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memproses pesanan.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;

    const result = await getOrders({
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
