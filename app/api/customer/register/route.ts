import { NextResponse } from 'next/server';
import { createCustomer } from '@/lib/db/repository';
import { createCustomerSessionToken, setCustomerSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, address } = body;

    const result = await createCustomer({ name, email, phone, password, address });
    if (!result.success || !result.customer) {
      return NextResponse.json(
        { success: false, error: result.error || 'Pendaftaran gagal' },
        { status: 400 }
      );
    }

    // Generate session token and set cookie
    const token = createCustomerSessionToken({
      id: result.customer.id,
      name: result.customer.name,
      email: result.customer.email,
    });

    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: result.customer,
      message: 'Pendaftaran akun berhasil.',
    });
  } catch (err: any) {
    console.error('Customer registration error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat mendaftar.' },
      { status: 500 }
    );
  }
}
