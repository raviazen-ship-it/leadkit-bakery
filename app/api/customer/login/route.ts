import { NextResponse } from 'next/server';
import { verifyCustomer } from '@/lib/db/repository';
import { createCustomerSessionToken, setCustomerSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await verifyCustomer(email, password);
    if (!result.success || !result.customer) {
      return NextResponse.json(
        { success: false, error: result.error || 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const token = createCustomerSessionToken({
      id: result.customer.id,
      name: result.customer.name,
      email: result.customer.email,
    });

    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: result.customer,
      message: 'Login berhasil.',
    });
  } catch (err: any) {
    console.error('Customer login error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat login.' },
      { status: 500 }
    );
  }
}
