import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  PackageX,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChefHat,
} from 'lucide-react';
import { getDashboardOverview, getBusinessSettings } from '@/lib/db/repository';
import { formatRupiah, formatIndonesianDateTime } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const [overview, settings] = await Promise.all([
    getDashboardOverview(),
    getBusinessSettings(),
  ]);

  const statCards = [
    {
      title: 'Pesanan Baru',
      value: overview.newOrders,
      desc: 'Perlu dicek segera',
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Sedang Diproses',
      value: overview.inProgressOrders,
      desc: 'Tahap produksi & packing',
      icon: Clock,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pesanan Selesai',
      value: overview.completedOrders,
      desc: 'Telah diambil / terkirim',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-800 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Pendapatan Terverifikasi',
      value: formatRupiah(overview.totalRevenue),
      desc: 'Dari pesanan lunas/selesai',
      icon: TrendingUp,
      color: 'bg-caramel-50 text-cocoa-900 border-caramel-200',
      iconColor: 'text-caramel-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Dashboard Utama
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-800">
            Selamat Datang di Portal {settings.store_name}
          </h1>
          <p className="text-xs text-espresso-900/70 mt-1 font-light">
            Pantau status pesanan pelanggan dan kelola operasional toko secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/produksi"
            className="px-4 py-2.5 rounded-xl border border-oat-300 bg-white hover:bg-oat-100 text-cocoa-800 text-xs font-semibold transition-colors shadow-xs flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4 text-caramel-600" />
            <span>Lembar Produksi Dapur</span>
          </Link>
          <Link
            href="/admin/pesanan"
            className="px-4 py-2.5 rounded-xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-colors shadow-sm flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Semua Pesanan</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border ${stat.color} shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className="p-2 rounded-xl bg-white/70 shadow-xs">
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <span className="text-[11px] opacity-80 block mt-1">
                  {stat.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Alerts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Out of stock alert */}
        <div className="p-5 rounded-2xl bg-white border border-oat-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
            <PackageX className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-serif text-sm font-bold text-cocoa-800">
              Ketersediaan Stok Produk
            </h3>
            <p className="text-xs text-espresso-900/70">
              {overview.outOfStockCount > 0
                ? `Terdapat ${overview.outOfStockCount} produk yang status ketersediaannya non-aktif (habis).`
                : 'Semua produk saat ini berstatus tersedia di katalog.'}
            </p>
            <Link
              href="/admin/produk"
              className="inline-block text-xs font-semibold text-caramel-600 hover:underline pt-1"
            >
              Kelola status produk &rarr;
            </Link>
          </div>
        </div>

        {/* Active Campaign Box */}
        <div className="p-5 rounded-2xl bg-white border border-oat-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-caramel-100 text-caramel-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-serif text-sm font-bold text-cocoa-800">
              Promo Musiman Aktif
            </h3>
            <p className="text-xs text-espresso-900/70">
              {overview.activeCampaign
                ? `Campaign "${overview.activeCampaign.title}" sedang aktif di halaman Beranda.`
                : 'Belum ada campaign promo yang aktif saat ini.'}
            </p>
            <Link
              href="/admin/tampilan"
              className="inline-block text-xs font-semibold text-caramel-600 hover:underline pt-1"
            >
              Atur banner & promosi &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table / Card List */}
      <div className="bg-white rounded-3xl border border-oat-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-oat-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-cocoa-800">
              Pesanan Terbaru
            </h2>
            <p className="text-xs text-espresso-900/70">
              Daftar transaksi pelanggan terakhir yang tersimpan di database.
            </p>
          </div>
          <Link
            href="/admin/pesanan"
            className="text-xs font-semibold text-caramel-600 hover:text-caramel-700 flex items-center gap-1"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {overview.recentOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-oat-100 text-cocoa-800 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="font-serif text-base font-bold text-cocoa-800">
              Belum Ada Pesanan Masuk
            </h3>
            <p className="text-xs text-espresso-900/60 max-w-sm mx-auto">
              Pesanan pelanggan yang masuk melalui website akan otomatis tampil di sini secara real-time.
            </p>
            <Link
              href="/produk"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-caramel-500 text-cream-100 text-xs font-semibold hover:bg-caramel-600 transition-colors shadow-sm"
            >
              <span>Uji Coba Buat Pesanan di Halaman Produk</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-oat-200 text-espresso-900/60 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">No. Pesanan</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3">Jadwal</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status Pesanan</th>
                  <th className="py-3 px-3">Pembayaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-oat-100">
                {overview.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-cocoa-900">
                      <Link
                        href="/admin/pesanan"
                        className="hover:text-caramel-600 underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-cocoa-800 block">
                        {o.customer_name}
                      </span>
                      <span className="text-[11px] text-espresso-900/60 block">
                        {o.customer_whatsapp}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-medium">
                        {o.order_type === 'delivery' ? 'Pengiriman' : 'Ambil di Toko'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-espresso-900/80">
                      {o.fulfillment_date}
                      <span className="block text-[10px] text-espresso-900/60">
                        {o.fulfillment_time_slot}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-serif font-bold text-cocoa-900">
                      {formatRupiah(o.total_amount)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-cream-200 text-cocoa-800 border border-oat-300">
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
