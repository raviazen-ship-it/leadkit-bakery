import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'bakery_admin_session';
export const CUSTOMER_COOKIE_NAME = 'bakery_customer_session';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR (SEC-01): JWT_SECRET wajib dikonfigurasi di environment production!');
    }
    return 'leadkit_bakery_dev_session_token_key_2026';
  }
  return secret;
}

export interface AdminSession {
  role: 'admin';
  username: string;
  expiresAt: number;
}

export interface CustomerSession {
  role: 'customer';
  customerId: string;
  name: string;
  email: string;
  expiresAt: number;
}

/**
 * Hash password with SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', getJwtSecret()).update(password).digest('hex');
}

/**
 * Validate given password against configured admin password
 */
export function verifyPassword(inputPassword: string): boolean {
  const configuredPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!configuredPassword) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR (SEC-01): ADMIN_DEFAULT_PASSWORD wajib dikonfigurasi di production!');
    }
    return inputPassword === 'admin123456';
  }
  return inputPassword === configuredPassword;
}

/**
 * Generate HMAC signature for session payload
 */
export function signPayload(payloadString: string): string {
  return crypto.createHmac('sha256', getJwtSecret()).update(payloadString).digest('base64url');
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
 * Verify admin session token
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
 * Create a signed customer session token (valid for 30 days)
 */
export function createCustomerSessionToken(customer: { id: string; name: string; email: string }): string {
  const session: CustomerSession = {
    role: 'customer',
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  const payloadStr = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = signPayload(payloadStr);
  return `${payloadStr}.${signature}`;
}

/**
 * Verify customer session token
 */
export function verifyCustomerSessionToken(token: string | undefined): CustomerSession | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = signPayload(payloadStr);

    if (signature !== expectedSig) return null;

    const json = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const session: CustomerSession = JSON.parse(json);

    if (session.role !== 'customer' || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
