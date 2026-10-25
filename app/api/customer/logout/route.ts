import { NextResponse } from 'next/server';
import { clearCustomerSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearCustomerSessionCookie();
    return NextResponse.json({ success: true, message: 'Berhasil keluar.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Gagal logout.' }, { status: 500 });
  }
}
