'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Palette,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  ExternalLink,
  Database,
  ChefHat,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { name: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
    { name: 'Kelola Pesanan', href: '/admin/pesanan', icon: ShoppingBag },
    { name: 'Lembar Produksi', href: '/admin/produksi', icon: ChefHat },
    { name: 'Kelola Produk', href: '/admin/produk', icon: Package },
    { name: 'Tampilan Website', href: '/admin/tampilan', icon: Palette },
    { name: 'Pengaturan Bisnis', href: '/admin/pengaturan', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Top Navbar for Admin */}
      <div className="lg:hidden bg-cocoa-800 text-cream-100 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-caramel-400" />
          <span className="font-serif font-bold text-base">Aura Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded text-cream-100/80 hover:text-white"
            title="Lihat Website Publik"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded text-cream-100 hover:bg-cocoa-900"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-espresso-950/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-cocoa-900 text-cream-100 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-cocoa-800">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-caramel-500 text-cream-100 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold block leading-tight">
                    Aura Bakery
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-caramel-400 font-semibold block">
                    Admin Dashboard
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden text-cream-100/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Link to Public Site */}
            <div className="mt-4 pt-3 border-t border-cocoa-800/60">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between text-xs text-caramel-300 hover:text-caramel-200 transition-colors"
              >
                <span>Lihat Website Toko</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-caramel-500 text-cream-100 shadow-sm'
                      : 'text-cream-100/70 hover:bg-cocoa-800 hover:text-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Storage Mode & Logout */}
        <div className="p-4 border-t border-cocoa-800 space-y-3">
          <div className="p-3 rounded-xl bg-cocoa-800/60 border border-cocoa-700 text-[11px] text-cream-100/80 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-caramel-300">
              <Database className="w-3.5 h-3.5" />
              <span>Database Status</span>
            </div>
            <p className="text-[10px] text-cream-100/60 leading-tight">
              Aktif: Mode Database Lokal (SQLite) / Supabase Ready.
            </p>
          </div>

          <button
            type="button"
            disabled={loggingOut}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cocoa-800 hover:bg-red-950/40 text-cream-100/80 hover:text-red-300 text-xs font-semibold transition-colors border border-cocoa-700"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Keluar...' : 'Keluar (Logout)'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
