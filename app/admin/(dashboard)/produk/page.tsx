'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductVariant, Category } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function AdminProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBasePrice, setFormBasePrice] = useState<number>(0);
  const [formMainImage, setFormMainImage] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formMinPreorder, setFormMinPreorder] = useState(1);
  const [formPrepTime, setFormPrepTime] = useState(24);
  const [formAllergens, setFormAllergens] = useState('');
  const [formStorage, setFormStorage] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  // Variants list in form
  const [formVariants, setFormVariants] = useState<
    Array<{ id?: string; name: string; price: number; is_default: boolean; is_available: boolean }>
  >([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormShortDesc('');
    setFormDesc('');
    setFormBasePrice(100000);
    setFormMainImage('');
    setFormBadge('');
    setFormAvailable(true);
    setFormFeatured(false);
    setFormMinPreorder(1);
    setFormPrepTime(24);
    setFormAllergens('Mengandung telur, susu, gluten.');
    setFormStorage('Simpan di kulkas (4-8°C). Tahan 3 hari.');
    setFormDisplayOrder(products.length + 1);
    setFormVariants([
      { name: 'Pilihan Standar', price: 100000, is_default: true, is_available: true },
    ]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.category_id || categories[0]?.id || '');
    setFormShortDesc(p.short_description || '');
    setFormDesc(p.description || '');
    setFormBasePrice(p.base_price || 0);
    setFormMainImage(p.main_image || '');
    setFormBadge(p.badge || '');
    setFormAvailable(p.is_available);
    setFormFeatured(p.is_featured);
    setFormMinPreorder(p.min_preorder_days || 0);
    setFormPrepTime(p.prep_time_hours || 0);
    setFormAllergens(p.allergens || '');
    setFormStorage(p.storage_instructions || '');
    setFormDisplayOrder(p.display_order || 0);
    setFormVariants(
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            is_default: v.is_default,
            is_available: v.is_available,
          }))
        : [{ name: 'Pilihan Standar', price: p.base_price, is_default: true, is_available: true }]
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setFormError(null);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      setFormMainImage(data.url);
    } catch (err: any) {
      setFormError(err.message || 'Gagal upload foto.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add/Remove variant row
  const addVariantRow = () => {
    setFormVariants([
      ...formVariants,
      {
        name: `Varian Baru ${formVariants.length + 1}`,
        price: formBasePrice,
        is_default: false,
        is_available: true,
      },
    ]);
  };

  const removeVariantRow = (idx: number) => {
    if (formVariants.length <= 1) return;
    setFormVariants(formVariants.filter((_, i) => i !== idx));
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        product: {
          id: editingProduct?.id,
          category_id: formCategoryId,
          name: formName.trim(),
          short_description: formShortDesc.trim(),
          description: formDesc.trim(),
          base_price: Number(formVariants[0]?.price || formBasePrice),
          main_image: formMainImage.trim(),
          gallery: [formMainImage.trim()].filter(Boolean),
          is_available: formAvailable,
          is_featured: formFeatured,
          badge: formBadge.trim(),
          min_preorder_days: Number(formMinPreorder),
          prep_time_hours: Number(formPrepTime),
          allergens: formAllergens.trim(),
          storage_instructions: formStorage.trim(),
          display_order: Number(formDisplayOrder),
        },
        variants: formVariants.map((v, i) => ({
          id: v.id,
          name: v.name.trim(),
          price: Number(v.price),
          is_default: i === 0,
          is_available: v.is_available,
          display_order: i + 1,
        })),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan produk.');
      }

      setIsModalOpen(false);
      setSuccessToast(
        editingProduct ? 'Produk berhasil diperbarui!' : 'Produk baru berhasil ditambahkan!'
      );
      setTimeout(() => setSuccessToast(null), 3000);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessToast(`Produk "${name}" berhasil dihapus.`);
        setTimeout(() => setSuccessToast(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Toggle availability directly
  const handleToggleAvailability = async (p: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            ...p,
            is_available: !p.is_available,
          },
          variants: p.variants,
        }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat && p.category?.slug !== selectedCat) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.short_description || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-caramel-600 block">
            Katalog & Menu
          </span>
          <h1 className="font-serif text-3xl font-bold text-cocoa-800">
            Pengelolaan Produk & Varian
          </h1>
          <p className="text-xs text-espresso-900/70 mt-1 font-light">
            Tambah menu baru, perbarui harga varian, ubah foto produk, dan kelola ketersediaan stok.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-caramel-400" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-oat-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-espresso-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-oat-300 text-xs focus:outline-none focus:ring-2 focus:ring-caramel-500 bg-cream-50/50"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="w-full sm:w-56 p-2.5 rounded-xl border border-oat-300 text-xs font-medium bg-white text-cocoa-800 cursor-pointer"
        >
          <option value="all">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product List Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-espresso-900/60 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-caramel-600" />
            <span>Memuat katalog produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-oat-200">
            <p className="text-xs text-espresso-900/60">Tidak ada produk ditemukan.</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl overflow-hidden border border-oat-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Status */}
                <div className="aspect-[4/3] bg-oat-100 overflow-hidden relative">
                  {p.main_image ? (
                    <img
                      src={p.main_image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-cocoa-800/40">
                      Foto Produk
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {p.badge && (
                      <span className="bg-cocoa-800 text-cream-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        {p.badge}
                      </span>
                    )}
                    {p.is_featured && (
                      <span className="bg-caramel-500 text-cream-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        Featured
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleAvailability(p)}
                    className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md transition-colors ${
                      p.is_available
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {p.is_available ? 'Tersedia' : 'Habis'}
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sage-600 block">
                    {p.category?.name || 'Kategori'}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-cocoa-800">
                    {p.name}
                  </h3>
                  <p className="text-xs text-espresso-900/70 line-clamp-2 font-light">
                    {p.short_description || p.description}
                  </p>

                  <div className="pt-2 text-xs text-espresso-900/80 space-y-1">
                    <div className="font-serif text-base font-bold text-cocoa-900">
                      {formatRupiah(p.base_price)}
                    </div>
                    {p.variants && p.variants.length > 0 && (
                      <span className="text-[11px] text-caramel-700 block">
                        {p.variants.length} Varian: {p.variants.map((v) => `${v.name} (${formatRupiah(v.price)})`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-oat-100 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => openEditModal(p)}
                  className="flex-1 py-2 px-3 rounded-xl border border-oat-300 hover:bg-oat-100 text-cocoa-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-caramel-600" />
                  <span>Edit Produk</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream-50 rounded-3xl max-w-3xl w-full shadow-2xl border border-oat-200 overflow-hidden animate-fadeIn my-6">
            <div className="p-5 border-b border-oat-200 flex items-center justify-between bg-cocoa-800 text-cream-100">
              <h2 className="font-serif text-xl font-bold">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-cream-100/70 hover:text-white hover:bg-cocoa-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Earl Grey Chiffon Cake"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Kategori Menu *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload & Preview */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-3">
                <label className="block text-xs font-bold text-cocoa-800">
                  Foto Utama Produk
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview Box */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-oat-100 border border-oat-200 shrink-0 relative">
                    {formMainImage ? (
                      <img src={formMainImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-espresso-900/40">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Upload input or URL input */}
                  <div className="flex-1 space-y-2 w-full text-xs">
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 rounded-xl bg-cocoa-800 text-cream-100 hover:bg-cocoa-900 cursor-pointer font-semibold flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-caramel-400" />
                        <span>{uploadingImage ? 'Mengunggah...' : 'Upload File Foto (JPG/PNG)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-espresso-900/60">Atau masukkan URL Foto:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formMainImage}
                        onChange={(e) => setFormMainImage(e.target.value)}
                        className="flex-1 p-2 rounded-lg border border-oat-300 bg-cream-50/50 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Deskripsi Singkat (Ringkasan di card)
                  </label>
                  <input
                    type="text"
                    placeholder="Deskripsi satu kalimat yang menggugah selera..."
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Deskripsi Lengkap (Tampil di modal detail)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan bahan baku, keistimewaan rasa, dan penyajian..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>
              </div>

              {/* Variants & Pricing Manager */}
              <div className="p-4 rounded-2xl bg-white border border-oat-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-cocoa-800">
                      Varian & Harga Produk
                    </h3>
                    <p className="text-[11px] text-espresso-900/70">
                      Tentukan pilihan ukuran (misal 16cm vs 20cm) atau varian paket beserta harganya.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-3 py-1.5 rounded-lg border border-caramel-500 text-caramel-700 text-xs font-semibold hover:bg-caramel-50 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Varian</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formVariants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-cream-50 border border-oat-200">
                      <input
                        type="text"
                        required
                        placeholder="Nama varian (Contoh: D 16 cm)"
                        value={v.name}
                        onChange={(e) => {
                          const next = [...formVariants];
                          next[idx].name = e.target.value;
                          setFormVariants(next);
                        }}
                        className="flex-1 p-2 rounded-lg border border-oat-300 bg-white text-xs font-medium"
                      />

                      <div className="w-36 flex items-center gap-1 bg-white border border-oat-300 rounded-lg px-2 py-1.5 text-xs">
                        <span className="text-espresso-900/60 font-semibold">Rp</span>
                        <input
                          type="number"
                          required
                          value={v.price}
                          onChange={(e) => {
                            const next = [...formVariants];
                            next[idx].price = Number(e.target.value);
                            setFormVariants(next);
                          }}
                          className="w-full bg-transparent font-bold text-cocoa-900 focus:outline-none"
                        />
                      </div>

                      <label className="flex items-center gap-1 text-[11px] text-cocoa-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.is_available}
                          onChange={(e) => {
                            const next = [...formVariants];
                            next[idx].is_available = e.target.checked;
                            setFormVariants(next);
                          }}
                          className="rounded text-caramel-600"
                        />
                        <span>Aktif</span>
                      </label>

                      {formVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariantRow(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Hapus varian"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Properties */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Label Promosi (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Best Seller / Favorite / Seasonal"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Min. Pre-Order (Hari)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinPreorder}
                    onChange={(e) => setFormMinPreorder(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Waktu Persiapan (Jam)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Allergens & Storage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Keterangan Alergen
                  </label>
                  <input
                    type="text"
                    placeholder="Mengandung susu, telur, gluten..."
                    value={formAllergens}
                    onChange={(e) => setFormAllergens(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Petunjuk Penyimpanan
                  </label>
                  <input
                    type="text"
                    placeholder="Simpan di chiller 4-8°C..."
                    value={formStorage}
                    onChange={(e) => setFormStorage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-oat-300 bg-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="rounded text-caramel-600"
                  />
                  <span className="font-bold text-cocoa-800">Produk Tersedia (Stok Aktif)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded text-caramel-600"
                  />
                  <span className="font-bold text-cocoa-800">Tampilkan di Beranda (Featured)</span>
                </label>
              </div>

              {/* Submit Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-oat-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-oat-300 text-xs font-semibold text-cocoa-800 hover:bg-oat-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-cocoa-800 text-cream-100 text-xs font-semibold hover:bg-cocoa-900 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Produk</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
