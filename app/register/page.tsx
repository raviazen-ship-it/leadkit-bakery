'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, address }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Pendaftaran gagal. Periksa kembali isian Anda.');
        return;
      }

      // Successfully registered & session cookie created -> push to account dashboard
      router.push('/akun');
      router.refresh();
    } catch (err) {
      setError('Terjadi kendala jaringan saat mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-100 text-caramel-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aura Artisan Privilege</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-cocoa-800">
              Daftar Akun Baru
            </h1>
            <p className="text-xs sm:text-sm text-espresso-900/70 font-light">
              Buat akun untuk menyimpan alamat pengiriman dan memantau status pesanan kapan pun.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-oat-200 shadow-sm space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Alamat Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="siti@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Kata Sandi *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cocoa-800 uppercase tracking-wider mb-1.5">
                  Alamat Pengiriman Default (Opsional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah/kantor, patokan..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-espresso-900/70 border-t border-oat-100">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-bold text-caramel-700 hover:text-caramel-800 underline">
                Masuk di Sini
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
