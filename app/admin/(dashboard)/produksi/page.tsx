'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Calendar,
  Clock,
  ChefHat,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Order, OrderItem } from '@/types';
import { formatIndonesianDate } from '@/lib/utils';

export default function AdminProduksiPage() {
  const todayWib = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayWib);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductionOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?startDate=${selectedDate}&endDate=${selectedDate}&limit=200`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load production orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, [selectedDate]);

  // Filter out cancelled orders
  const activeOrders = orders.filter((o) => o.order_status !== 'Dibatalkan');

  // Group orders by time slot
  const slotGroups: Record<string, Order[]> = {};
  for (const ord of activeOrders) {
    const slot = ord.fulfillment_time_slot || 'Slot Standar (09.00 - 17.00 WIB)';
    if (!slotGroups[slot]) slotGroups[slot] = [];
    slotGroups[slot].push(ord);
  }

  // Aggregate items per slot
  const slotAggregates: Record<
    string,
    {
      itemKey: string;
      productName: string;
      variantName: string;
      quantity: number;
      orderNumbers: string[];
      notes: string[];
    }[]
  > = {};

  for (const [slot, slotOrders] of Object.entries(slotGroups)) {
    const map = new Map<string, {
      itemKey: string;
      productName: string;
      variantName: string;
      quantity: number;
      orderNumbers: string[];
      notes: string[];
    }>();

    for (const ord of slotOrders) {
      for (const it of ord.items || []) {
        const key = `${it.product_name}___${it.variant_name}`;
        if (!map.has(key)) {
          map.set(key, {
            itemKey: key,
            productName: it.product_name,
            variantName: it.variant_name,
            quantity: 0,
            orderNumbers: [],
            notes: [],
          });
        }
        const record = map.get(key)!;
        record.quantity += it.quantity;
        record.orderNumbers.push(ord.order_number);
        if (ord.customer_notes && !record.notes.includes(ord.customer_notes)) {
          record.notes.push(`${ord.order_number}: ${ord.customer_notes}`);
        }
      }
    }

    slotAggregates[slot] = Array.from(map.values());
  }

  // Helper to detect allergen alerts for bakery items
  const getAllergenBadges = (name: string, variant: string) => {
    const text = `${name} ${variant}`.toLowerCase();
    const badges: string[] = [];

    if (text.includes('sourdough')) {
      badges.push('Gluten Terfermentasi Alami');
    }
    if (text.includes('croissant') || text.includes('danish') || text.includes('butter') || text.includes('cheese') || text.includes('brioche') || text.includes('tart')) {
      badges.push('Susu Sapi (Dairy/Butter)');
      badges.push('Telur (Egg)');
    }
    if (text.includes('nut') || text.includes('kacang') || text.includes('almond') || text.includes('hazelnut') || text.includes('pistachio')) {
      badges.push('Kacang-kacangan (Tree Nuts/Peanuts)');
    }
    return badges;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar - Hidden during print */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-oat-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Operasional &amp; Dapur Artisan
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-900 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-caramel-600" />
            <span>Lembar Produksi Harian (ADM-05)</span>
          </h1>
          <p className="text-xs text-espresso-900/70 font-light mt-1">
            Daftar batch baking, takaran porsi, dan deteksi alergen per slot waktu untuk tim dapur Aura Bakery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-cream-50 border border-oat-300 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-caramel-600 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-cocoa-900 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchProductionOrders}
            className="p-2.5 rounded-xl border border-oat-300 hover:bg-oat-100 text-cocoa-800 transition-colors"
            title="Refresh Antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-cocoa-800 hover:bg-cocoa-900 text-cream-100 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Produksi (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-oat-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-8">
        {/* Printable Header */}
        <div className="border-b-2 border-cocoa-900 pb-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cocoa-900 uppercase tracking-tight">
              Aura Artisan Bakery &amp; Catering
            </h2>
            <span className="text-xs font-bold text-caramel-700 tracking-wider uppercase block">
              Lembar Instruksi Produksi Harian (Kitchen Batch Sheet)
            </span>
            <span className="text-xs text-espresso-900/80 block mt-0.5">
              Jadwal Produksi:{' '}
              <strong className="text-cocoa-900">{formatIndonesianDate(selectedDate)}</strong> (Waktu Indonesia Barat)
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-espresso-900/60 block">Total Pesanan Aktif</span>
            <span className="font-mono text-2xl font-bold text-cocoa-900">{activeOrders.length} Pesanan</span>
          </div>
        </div>

        {/* Content per Slot */}
        {loading ? (
          <div className="py-12 text-center text-xs text-espresso-900/60">
            Memuat jadwal antrean produksi dapur...
          </div>
        ) : Object.keys(slotGroups).length === 0 ? (
          <div className="py-12 text-center bg-cream-50 rounded-2xl border border-oat-200 text-cocoa-800 space-y-2">
            <Info className="w-6 h-6 mx-auto text-caramel-600" />
            <h3 className="font-serif text-base font-bold">Tidak Ada Antrean Produksi</h3>
            <p className="text-xs text-espresso-900/70">
              Belum ada pesanan terkonfirmasi untuk tanggal {formatIndonesianDate(selectedDate)}.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(slotAggregates).map(([slot, items]) => (
              <div key={slot} className="border border-oat-300 rounded-2xl overflow-hidden print:border-cocoa-800">
                {/* Slot Subheader */}
                <div className="bg-cocoa-900 text-cream-100 px-5 py-3 flex items-center justify-between print:bg-cocoa-900 print:text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-caramel-400" />
                    <span className="font-serif font-bold text-sm">Slot Waktu: {slot}</span>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {slotGroups[slot]?.length || 0} Pesanan ({items.reduce((acc, it) => acc + it.quantity, 0)} Pcs / Box)
                  </span>
                </div>

                {/* Batch Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-cream-100 border-b border-oat-200 text-cocoa-900 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Nama Produk &amp; Varian</th>
                        <th className="py-3 px-4 text-center w-24">Jumlah Batch</th>
                        <th className="py-3 px-4">Peringatan Alergen Kritis (CAT-10)</th>
                        <th className="py-3 px-4">Nomor Pesanan Terkait &amp; Catatan Khusus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-oat-200">
                      {items.map((it, idx) => {
                        const allergens = getAllergenBadges(it.productName, it.variantName);

                        return (
                          <tr key={it.itemKey} className="hover:bg-cream-50/50">
                            <td className="py-3 px-4 text-center font-mono font-bold text-cocoa-900">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-cocoa-900 block text-sm">
                                {it.productName}
                              </span>
                              <span className="text-[11px] text-espresso-900/70 font-semibold">
                                Varian / Ukuran: {it.variantName}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-caramel-100 text-cocoa-900 font-mono font-bold text-sm border border-caramel-300">
                                {it.quantity}x
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {allergens.length > 0 ? (
                                  allergens.map((alg, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px] border border-red-300"
                                    >
                                      <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                      <span>{alg}</span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-espresso-900/50 italic">
                                    Standar Higienis Dapur
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-espresso-900/80">
                              <div className="space-y-1">
                                <div className="text-[11px] font-mono font-bold text-caramel-700">
                                  {it.orderNumbers.join(', ')}
                                </div>
                                {it.notes.length > 0 && (
                                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-950 text-[10px] space-y-0.5">
                                    <strong className="block font-bold">Catatan Pemesan:</strong>
                                    {it.notes.map((n, nIdx) => (
                                      <div key={nIdx}>• {n}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Sign-off for Head Baker */}
        <div className="pt-8 border-t border-oat-300 flex justify-between items-end text-xs text-cocoa-900">
          <div>
            <span className="text-[10px] text-espresso-900/60 block">Standar Kualitas Aura Bakery:</span>
            <span className="font-semibold block">Suhu Pemanggangan Deck Oven 220°C - 240°C | Fermentasi Dingin Minimal 18 Jam</span>
          </div>
          <div className="text-center w-48">
            <div className="h-14 border-b border-dashed border-cocoa-400 mb-1" />
            <span className="font-bold block">Head Baker / QC On Duty</span>
            <span className="text-[10px] text-espresso-900/60">Tanda Tangan &amp; Verifikasi</span>
          </div>
        </div>
      </div>
    </div>
  );
}