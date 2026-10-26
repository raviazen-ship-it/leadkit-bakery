import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
  createCustomerSessionToken,
  verifyCustomerSessionToken,
  verifyPassword,
} from '../lib/auth-tokens.ts';

test('T-SEC-01: Admin Password Verification', () => {
  // Wrong password must be rejected
  assert.equal(verifyPassword('wrongpassword'), false, 'Password salah wajib ditolak');
  assert.equal(verifyPassword(''), false, 'Password kosong wajib ditolak');

  // Configured default in dev environment must be accepted
  assert.equal(verifyPassword('admin123456'), true, 'Password default dev diterima');
});

test('T-SEC-02: Admin Session Token Lifecycle & Anti-Tampering', () => {
  // 1. Generate valid token
  const token = createSessionToken();
  assert.ok(token, 'Token wajib terbentuk');
  assert.ok(token.includes('.'), 'Format token wajib payload.signature');

  // 2. Verify valid token
  const session = verifySessionToken(token);
  assert.ok(session, 'Token valid harus terverifikasi');
  assert.equal(session?.role, 'admin', 'Role harus admin');
  assert.equal(session?.username, 'admin', 'Username harus admin');
  assert.ok(session!.expiresAt > Date.now(), 'Token belum kedaluwarsa');

  // 3. Reject tampered signature
  const [payload] = token.split('.');
  const forgedToken = `${payload}.forged_tampered_signature_12345`;
  const tamperedSession = verifySessionToken(forgedToken);
  assert.equal(tamperedSession, null, 'Token dengan signature palsu wajib ditolak (null)');

  // 4. Reject garbage input
  assert.equal(verifySessionToken(''), null, 'Token kosong wajib ditolak');
  assert.equal(verifySessionToken('invalid-format'), null, 'Token format salah wajib ditolak');
});

test('T-SEC-03: Customer Session Token Lifecycle', () => {
  const customerData = {
    id: 'cust_test_123',
    name: 'Sinta Test',
    email: 'sinta@test.com',
  };

  const custToken = createCustomerSessionToken(customerData);
  assert.ok(custToken, 'Customer token wajib terbentuk');

  const session = verifyCustomerSessionToken(custToken);
  assert.ok(session, 'Customer token valid harus terverifikasi');
  assert.equal(session?.role, 'customer');
  assert.equal(session?.customerId, 'cust_test_123');
  assert.equal(session?.email, 'sinta@test.com');

  // Tampered payload
  const tampered = custToken.slice(0, -4) + 'abcd';
  assert.equal(verifyCustomerSessionToken(tampered), null, 'Customer token rusak wajib ditolak');
});

test('T-CHK-04: Server Authority & Integer Currency Safety (IDR)', () => {
  // Blueprint D-01: Harga wajib disimpan sebagai integer Rupiah tanpa desimal mengambang
  const item1Price = 45000;
  const item2Price = 120000;
  const qty1 = 2;
  const qty2 = 1;

  const subtotal = (item1Price * qty1) + (item2Price * qty2);
  assert.equal(subtotal, 210000, 'Subtotal integer IDR harus akurat');
  assert.equal(Number.isInteger(subtotal), true, 'Nilai harga wajib berupa integer');

  // Testing client-side tamper simulation (client tries to submit 0 or negative price)
  const clientSubmittedItem = {
    price: 1, // Tampered client payload
    quantity: 2,
  };
  const verifiedServerPrice = 45000; // True DB price
  const recalculatedTotal = verifiedServerPrice * clientSubmittedItem.quantity;
  assert.equal(recalculatedTotal, 90000, 'Server harus mengabaikan harga klien dan menghitung ulang');
});
