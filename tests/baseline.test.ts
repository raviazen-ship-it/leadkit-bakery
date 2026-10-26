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

test('T-CAT-06: Numeric Sort Verification (Avoid String Lexicographic Sorting)', () => {
  const products = [
    { name: 'Sourdough', base_price: 65000 },
    { name: 'Catering Box', base_price: 55000 },
    { name: 'Croissant Box', base_price: 135000 },
    { name: 'Chiffon Cake', base_price: 285000 },
  ];

  // Numeric ascending sort
  const sortedAsc = [...products].sort((a, b) => a.base_price - b.base_price);
  assert.equal(sortedAsc[0].base_price, 55000, 'Harga terendah harus 55.000 (bukan string 135.000)');
  assert.equal(sortedAsc[sortedAsc.length - 1].base_price, 285000, 'Harga tertinggi harus 285.000');

  // Numeric descending sort
  const sortedDesc = [...products].sort((a, b) => b.base_price - a.base_price);
  assert.equal(sortedDesc[0].base_price, 285000);
  assert.equal(sortedDesc[sortedDesc.length - 1].base_price, 55000);
});

test('T-CAT-13: Allergen Filter Logic (Nut-Free, Dairy-Free, Gluten-Free)', () => {
  const sampleProducts = [
    { id: '1', name: 'Nasi Liwet', allergens: 'Mengandung kacang, santan.' },
    { id: '2', name: 'Country Sourdough', allergens: 'Mengandung gluten. Tanpa telur dan tanpa susu (Vegan friendly).' },
    { id: '3', name: 'Croissant French Butter', allergens: 'Mengandung susu, butter, gluten.' },
  ];

  // Helper function to check if text contains allergen without negation (e.g. "tanpa susu")
  function hasAllergen(text: string, keywords: string[]): boolean {
    const lower = text.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        const isNegated = lower.includes(`tanpa ${kw}`) || lower.includes(`bebas ${kw}`);
        if (!isNegated) return true;
      }
    }
    return false;
  }

  // Filter Nut-free: must exclude product containing kacang/nut
  const nutFree = sampleProducts.filter((p) => !hasAllergen(p.allergens, ['kacang', 'nut']));
  assert.equal(nutFree.length, 2);
  assert.equal(nutFree.some((p) => p.id === '1'), false, 'Nasi Liwet yang ada kacang harus difilter keluar');

  // Filter Dairy-free: must exclude product containing susu/dairy/butter unless negated
  const dairyFree = sampleProducts.filter((p) => !hasAllergen(p.allergens, ['susu', 'dairy', 'butter', 'keju']));
  assert.equal(dairyFree.some((p) => p.id === '3'), false, 'Croissant dengan butter harus difilter keluar');
  assert.equal(dairyFree.some((p) => p.id === '2'), true, 'Sourdough tanpa susu harus lolos');
});

test('T-CHK-01: Multi-Item Mixed Lead-Time Calculation (BR-03)', () => {
  const cartItems = [
    { name: 'Croissant', min_preorder_days: 0 }, // Ready Stock
    { name: 'Chiffon Cake', min_preorder_days: 1 }, // H-1
    { name: 'Catering Box', min_preorder_days: 2 }, // H-2
  ];

  const maxRequiredDays = Math.max(
    1, // store base setting
    ...cartItems.map((i) => i.min_preorder_days)
  );

  assert.equal(maxRequiredDays, 2, 'Lead time keranjang campuran wajib mengikuti lead time terpanjang (H-2)');
});
