import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSessionToken, setAdminSessionCookie } from '@/lib/auth';

// Rate Limiter for Admin Authentication (SEC-03, SEC-06)
const loginAttemptMap = new Map<string, { count: number; resetAt: number }>();

function checkAdminRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 5; // Max 5 failed attempts per minute

  const record = loginAttemptMap.get(ip);
  if (!record || now > record.resetAt) {
    loginAttemptMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local_admin';

    // Rate limiting check
    if (!checkAdminRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu 1 menit.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password wajib diisi.' }, { status: 400 });
    }

    // Validate username if provided (default: 'admin')
    const cleanUsername = (username || 'admin').toString().trim().toLowerCase();
    const validUsernames = ['admin', 'owner', 'chef', 'kitchen'];

    if (!validUsernames.includes(cleanUsername)) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    // Success -> Clear rate limiter for this IP
    loginAttemptMap.delete(ip);

    const token = createSessionToken(cleanUsername);
    await setAdminSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: { role: cleanUsername === 'owner' ? 'owner' : 'admin', username: cleanUsername },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
