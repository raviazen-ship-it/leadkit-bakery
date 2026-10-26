import { cookies, headers } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  CUSTOMER_COOKIE_NAME,
  verifySessionToken,
  verifyCustomerSessionToken,
  type AdminSession,
  type CustomerSession,
} from './auth-tokens';

export * from './auth-tokens';

/**
 * Server-side check if current request has authenticated admin session
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return verifySessionToken(token);
}

/**
 * Set admin session cookie
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Remove admin session cookie (logout)
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Server-side check if current request has authenticated customer session
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;

  if (!token) {
    const headerList = await headers();
    const authHeader = headerList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return verifyCustomerSessionToken(token);
}

/**
 * Set customer session cookie
 */
export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

/**
 * Remove customer session cookie (logout)
 */
export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}
