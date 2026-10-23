import crypto from 'crypto';
import { cookies, headers } from 'next/headers';

const SESSION_COOKIE_NAME = 'bakery_admin_session';
const SECRET = process.env.JWT_SECRET || 'leadkit_bakery_secure_session_token_key_2026';
const DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123456';

export interface AdminSession {
  role: 'admin';
  username: string;
  expiresAt: number;
}

/**
 * Hash password with SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET).update(password).digest('hex');
}

/**
 * Validate given password against configured admin password
 */
export function verifyPassword(inputPassword: string): boolean {
  return inputPassword === DEFAULT_PASSWORD;
}

/**
 * Generate HMAC signature for session payload
 */
function signPayload(payloadString: string): string {
  return crypto.createHmac('sha256', SECRET).update(payloadString).digest('base64url');
}

/**
 * Create a signed admin session token (valid for 7 days)
 */
export function createSessionToken(): string {
  const session: AdminSession = {
    role: 'admin',
    username: 'admin',
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = signPayload(payloadStr);
  return `${payloadStr}.${signature}`;
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = signPayload(payloadStr);

    if (signature !== expectedSig) return null;

    const json = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const session: AdminSession = JSON.parse(json);

    if (session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

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
    secure: false, // Allows local http:// and https:// environments
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
