'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username admin.');
      return;
    }

    if (!password) {
      setErrorMsg('Silakan masukkan password admin.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Username atau password salah. Silakan coba lagi.');
      }

      // Success -> navigate to /admin
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-oat-200 shadow-xl space-y-6 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-cocoa-800 text-cream-100 mx-auto flex items-center justify-center shadow-md">
            <Store className="w-6 h-6 text-caramel-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-cocoa-800">
            Login Portal Admin Aura Bakery
          </h1>
          <p className="text-xs text-espresso-900/70 font-light">
            Masuk dengan akun staf untuk mengelola pesanan, katalog produk, dan antrean dapur.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-espresso-900 mb-1.5">
              Username Staf / Admin
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: admin atau owner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500 font-mono"
              />
              <User className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-espresso-900 mb-1.5">
              Password Akses
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan password admin..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-oat-300 bg-cream-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-caramel-500"
              />
              <Lock className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso-900/50 hover:text-espresso-900"
                aria-label="Lihat password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 focus:ring-2 focus:ring-cocoa-700 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Otorisasi...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center border-t border-oat-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-cocoa-800/70 hover:text-cocoa-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Toko</span>
          </Link>
        </div>
      </div>
    </div>
  );
}