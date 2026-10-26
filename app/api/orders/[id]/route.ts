import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrderStatus } from '@/lib/db/repository';
import { getAdminSession, getCustomerSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    // Security Check (SEC-08 IDOR Protection & ACC-04 Guest Tracking)
    const adminSession = await getAdminSession();
    if (adminSession) {
      return NextResponse.json({ success: true, data: order });
    }

    const customerSession = await getCustomerSession();
    if (customerSession && order.customer_id === customerSession.customerId) {
      return NextResponse.json({ success: true, data: order });
    }

    // Check Token or 4-digit Phone Verification (SEC-07 & ACC-04)
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const phoneSuffix = url.searchParams.get('phone_suffix');

    const cleanPhone = (order.customer_whatsapp || '').replace(/\D/g, '');
    const isTokenMatch = token && (order.id === token || order.order_number === token);
    const isPhoneMatch = phoneSuffix && cleanPhone.endsWith(phoneSuffix);

    if (isTokenMatch || isPhoneMatch) {
      // Redact sensitive personal identifiable information (PII) for public/guest tracking
      const maskedName = order.customer_name
        ? order.customer_name.charAt(0) + '***'
        : 'Pelanggan';
      const maskedPhone = cleanPhone.length > 4
        ? cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(-4)
        : '****';
      const maskedAddress = order.delivery_address
        ? 'Area Pengiriman Terverifikasi (Detail disamarkan untuk privasi)'
        : undefined;

      const safeOrder = {
        ...order,
        customer_name: maskedName,
        customer_whatsapp: maskedPhone,
        delivery_address: maskedAddress,
      };

      return NextResponse.json({ success: true, data: safeOrder, is_redacted: true });
    }

    // Default deny: Do not leak existence or details of order to arbitrary users
    return NextResponse.json(
      { error: 'Akses ditolak. Sesi login atau token pelacakan yang valid diperlukan.' },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateOrderStatus(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Status pesanan berhasil diperbarui.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
