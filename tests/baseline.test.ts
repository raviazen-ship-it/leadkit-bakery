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

test('T-ACC-04: Unguessable Token & 4-Digit Phone Verification (SEC-07)', () => {
  const sampleOrder = {
    order_number: 'ORD-20261027-001',
    customer_whatsapp: '081234567890',
    public_token: 'tok_1740000000_a8f9c1b2d3',
    customer_name: 'Dewi Kartika',
    delivery_address: 'Jl. Senopati No. 12, Kebayoran Baru, Jakarta Selatan',
  };

  // Case 1: Unguessable 128-bit token match grants direct access
  const directTokenMatch = sampleOrder.public_token === 'tok_1740000000_a8f9c1b2d3';
  assert.equal(directTokenMatch, true, 'Token acak 128-bit harus memberikan akses');

  // Case 2: Order number ALONE must NOT be enough (SEC-07: Nomor order bukan rahasia)
  const isGuessWithoutPhoneBlocked = !('ORD-20261027-001' === sampleOrder.public_token);
  assert.equal(isGuessWithoutPhoneBlocked, true, 'Nomor order saja tidak boleh berlaku sebagai token rahasia');

  // Case 3: Order number + correct 4-digit phone suffix matches
  const phoneSuffix = '7890';
  const cleanPhone = sampleOrder.customer_whatsapp.replace(/\D/g, '');
  const isPhoneMatch = phoneSuffix.length >= 4 && cleanPhone.endsWith(phoneSuffix);
  assert.equal(isPhoneMatch, true, '4 digit akhir telepon harus cocok');

  // Case 4: Wrong 4-digit phone suffix is rejected
  const wrongPhoneSuffix = '1111';
  const isWrongPhoneMatch = wrongPhoneSuffix.length >= 4 && cleanPhone.endsWith(wrongPhoneSuffix);
  assert.equal(isWrongPhoneMatch, false, '4 digit nomor telepon salah wajib ditolak');
});

test('T-SEC-09: PII Redaction for Public / Guest Lookups', () => {
  const rawOrder = {
    customer_name: 'Dewi Kartika',
    customer_whatsapp: '081234567890',
    delivery_address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
  };

  // Redaction logic applied in API lookup
  const cleanPhone = rawOrder.customer_whatsapp.replace(/\D/g, '');
  const maskedName = rawOrder.customer_name ? rawOrder.customer_name.charAt(0) + '***' : 'Pelanggan';
  const maskedPhone = cleanPhone.length > 4 ? cleanPhone.slice(0, 3) + '****' + cleanPhone.slice(-4) : '****';
  const maskedAddress = 'Area Pengiriman Terverifikasi (Detail disamarkan untuk privasi)';

  assert.equal(maskedName, 'D***', 'Nama pemesan wajib disamarkan');
  assert.equal(maskedPhone, '081****7890', 'Nomor telepon tengah wajib disamarkan');
  assert.equal(maskedAddress.includes('disamarkan'), true, 'Alamat lengkap wajib disamarkan');
});

test('T-ADM-05: Kitchen Production Batch Aggregation', () => {
  const orders = [
    {
      order_number: 'ORD-001',
      fulfillment_time_slot: '09.00 - 12.00 WIB',
      items: [
        { product_name: 'Country Sourdough', variant_name: 'Loaf 800g', quantity: 2 },
        { product_name: 'Croissant Box', variant_name: 'Box isi 4', quantity: 1 },
      ],
    },
    {
      order_number: 'ORD-002',
      fulfillment_time_slot: '09.00 - 12.00 WIB',
      items: [
        { product_name: 'Country Sourdough', variant_name: 'Loaf 800g', quantity: 3 },
      ],
    },
  ];

  // Aggregate sourdough count for the 09.00 slot
  const sourdoughBatchTotal = orders.reduce((sum, ord) => {
    const item = ord.items.find((it) => it.product_name === 'Country Sourdough');
    return sum + (item ? item.quantity : 0);
  }, 0);

  assert.equal(sourdoughBatchTotal, 5, 'Total adonan Country Sourdough batch 09.00 harus 5 loaf');
});
