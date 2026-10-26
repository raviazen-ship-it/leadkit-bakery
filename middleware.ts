import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Injeksi Header Keamanan Standar (SEC-04)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 2. Proteksi Rute Admin Terpusat (SEC-02 & SEC-03)
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    const adminCookie = request.cookies.get('bakery_admin_session')?.value;
    const authHeader = request.headers.get('authorization');
    const hasBearer = authHeader && authHeader.startsWith('Bearer ');
    const hasToken = (adminCookie && adminCookie.includes('.')) || hasBearer;

    if (!hasToken) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Akses ditolak. Sesi admin diperlukan.' },
          { status: 401, headers: response.headers }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
