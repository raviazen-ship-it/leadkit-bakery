import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setAdminSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi.' }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: 'Password admin salah. Silakan coba lagi.' }, { status: 401 });
    }

    const token = createSessionToken();
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: { role: 'admin', username: 'admin' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan internal server.' }, { status: 500 });
  }
}
