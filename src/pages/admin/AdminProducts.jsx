import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Package, Plus, Pencil, Trash2, X, Check, Eye, EyeOff,
  ChevronDown, Tag, AlertCircle, Download
} from 'lucide-react';

const DEFAULT_PRODUCTS = [
  { name: 'Premium Metal Pet Tag', category: 'Tags', emoji: '🏷️', description: 'Durable stainless steel tag with laser-engraved QR code. Waterproof, scratch-proof, and built to last.', price: 499, originalPrice: 799, badge: 'Best Seller', badgeColor: 'bg-amber-500', features: ['Stainless Steel', 'Waterproof', 'Laser Engraved', 'Lifetime QR'], color: 'amber', hasSize: false, is_active: true },
  { name: 'Smart Luggage Tag', category: 'Tags', emoji: '🧳', description: 'Flexible PVC luggage tag with integrated QR code. Perfect for travel bags, suitcases and backpacks.', price: 349, originalPrice: 549, badge: 'Popular', badgeColor: 'bg-blue-500', features: ['Flexible PVC', 'Name Window', 'Clip Included', '5 Color Options'], color: 'blue', hasSize: false, is_active: true },
  { name: 'QR Sticker Pack (5 pcs)', category: 'Stickers', emoji: '📌', description: 'Weather-resistant vinyl QR stickers. Stick on laptops, helmets, bikes, or any gear you want to protect.', price: 199, originalPrice: 299, badge: 'Value Pack', badgeColor: 'bg-emerald-500', features: ['5 Stickers', 'UV resistant', 'Waterproof', 'Any Surface'], color: 'emerald', hasSize: false, is_active: true },
  { name: 'TagLink Classic T-Shirt', category: 'Apparel', emoji: '👕', description: 'Premium 100% cotton T-shirt with a scannable QR code printed on the sleeve. Great for kids and outdoor enthusiasts.', price: 799, originalPrice: 1099, badge: 'New Arrival', badgeColor: 'bg-violet-500', features: ['100% Cotton', 'QR on Sleeve', 'Sizes S–XXL', '5 Colors'], color: 'violet', hasSize: true, is_active: true },
  { name: 'TagLink Smart Cap', category: 'Apparel', emoji: '🧢', description: 'Adjustable cap with a discreet QR tag patch on the side. Stylish and functional for everyday use.', price: 599, originalPrice: 899, badge: null, badgeColor: null, features: ['Adjustable', 'QR Side Patch', 'Unisex', '4 Colors'], color: 'rose', hasSize: false, is_active: true },
  { name: 'TagLink Silicone Wristband', category: 'Accessories', emoji: '💪', description: 'Soft, medical-grade silicone wristband with embedded QR code. Perfect for kids, elderly or medical use cases.', price: 299, originalPrice: 499, badge: 'Kids Friendly', badgeColor: 'bg-pink-500', features: ['Medical Silicone', 'Waterproof', 'Hypoallergenic', 'QR Embedded'], color: 'pink', hasSize: true, is_active: true },
  { name: 'QR Keychain Tag', category: 'Tags', emoji: '🔑', description: 'Compact hard-plastic QR keychain. Attach to keys, wallets, or bags for quick identification.', price: 249, originalPrice: 399, badge: null, badgeColor: null, features: ['Hard Plastic', 'Keychain Loop', 'Compact Design', 'Durable Print'], color: 'slate', hasSize: false, is_active: true },
  { name: 'TagLink Starter Kit', category: 'Bundles', emoji: '🎁', description: 'Everything you need to get started: 1 metal tag + 1 luggage tag + 5 stickers. Best value bundle.', price: 899, originalPrice: 1349, badge: '🔥 Best Value', badgeColor: 'bg-red-500', features: ['1 Metal Tag', '1 Luggage Tag', '5 Stickers', 'Premium Box'], color: 'indigo', hasSize: false, is_active: true },
];


const COLOR_OPTIONS = ['amber', 'blue', 'emerald', 'violet', 'rose', 'pink', 'slate', 'indigo', 'red', 'orange'];
const BADGE_COLOR_OPTIONS = [
  { label: 'Amber (Best Seller)', value: 'bg-amber-500' },
  { label: 'Blue (Popular)', value: 'bg-blue-500' },
  { label: 'Emerald (Value)', value: 'bg-emerald-500' },
  { label: 'Violet (New)', value: 'bg-violet-500' },
  { label: 'Red (Hot)', value: 'bg-red-500' },
  { label: 'Pink (Limited)', value: 'bg-pink-500' },
];
const CATEGORIES = ['Tags', 'Stickers', 'Apparel', 'Accessories', 'Bundles'];

const EMPTY_FORM = {
  name: '', category: 'Tags', emoji: '🏷️', description: '',
  price: '', originalPrice: '', badge: '', badgeColor: 'bg-amber-500',
  features: '', color: 'amber', hasSize: false, is_active: true,
  image_url: '',
};

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(
    product
      ? { ...product, features: Array.isArray(product.features) ? product.features.join(', ') : product.features || '', image_url: product.image_url || '' }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setUploading(true);
    setError('');
    const ext = file.name.split('.').pop();
    const fileName = `product-${Date.now()}.${ext}`;
    const { data, error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });
    if (uploadErr) { setError('Upload failed: ' + uploadErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    set('image_url', publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.originalPrice || !form.description) {
      setError('Name, description, price and original price are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      category: form.category,
      emoji: form.emoji || '🏷️',
      image_url: form.image_url || null,
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      badge: form.badge.trim() || null,
      badgeColor: form.badge.trim() ? form.badgeColor : null,
      features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      color: form.color,
      hasSize: form.hasSize,
      is_active: form.is_active,
    };

    let err;
    if (product?.id) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', product.id));
    } else {
      ({ error: err } = await supabase.from('products').insert([payload]));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-violet-500" />
            <h3 className="font-bold text-slate-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X size={18} /></button>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-4">
          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Product Image</label>
            <div className="flex gap-3">
              {/* Preview */}
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden">
                {form.image_url
                  ? <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                  : <span className="text-4xl">{form.emoji || '🏷️'}</span>
                }
              </div>
              <div className="flex-1 space-y-2">
                <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-all text-sm font-semibold ${
                  uploading ? 'border-violet-300 bg-violet-50 text-violet-400' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-500 hover:text-violet-600'
                }`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading
                    ? <><span className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /> Uploading…</>
                    : <><span className="text-lg">📁</span> {form.image_url ? 'Change Image' : 'Upload Image'}</>
                  }
                </label>
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
                  placeholder="Or paste image URL…"
                  className="w-full border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-violet-400 placeholder-slate-300" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Fallback emoji:</span>
                  <input value={form.emoji} onChange={e => set('emoji', e.target.value)} maxLength={4}
                    className="w-12 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-violet-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 block mb-1">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Premium Metal Pet Tag"
                className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 cursor-pointer">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              placeholder="Durable product with QR code…"
              className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none" />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Selling Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="499"
                className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Original / MRP (₹) *</label>
              <input type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="799"
                className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            </div>
          </div>

          {/* Badge + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Badge Text (optional)</label>
              <input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="Best Seller"
                className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Badge Color</label>
              <select value={form.badgeColor} onChange={e => set('badgeColor', e.target.value)}
                className="w-full border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 cursor-pointer" disabled={!form.badge}>
                {BADGE_COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Card Color + Features */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Card Theme Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all bg-${c}-400 ${form.color === c ? 'border-slate-800 scale-110' : 'border-transparent hover:border-slate-400'}`}
                  title={c} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">Selected: <strong>{form.color}</strong></p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Feature Tags (comma separated)</label>
            <input value={form.features} onChange={e => set('features', e.target.value)}
              placeholder="Stainless Steel, Waterproof, Laser Engraved, Lifetime QR"
              className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            <p className="text-[10px] text-slate-400 mt-0.5">Comma-separated, e.g: "Waterproof, UV resistant, Compact"</p>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {[
              { key: 'hasSize', label: 'Has Size Options (S/M/L/XL)' },
              { key: 'is_active', label: 'Visible in Store' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                <button type="button" onClick={() => set(key, !form[key])}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form[key] ? 'bg-violet-600' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-slate-600 font-medium">{label}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? 'Saving…' : <><Check size={15} /> {product ? 'Save Changes' : 'Add Product'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm Move to Trash Modal ────────────────── */
function ConfirmTrashModal({ product, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">Move to Trash?</h3>
          <p className="text-slate-500 text-sm mb-1">
            <span className="font-semibold text-slate-700">"{product.name}"</span> will be hidden from the store.
          </p>
          <p className="text-slate-400 text-xs mb-6">You can restore it anytime from the Trash tab.</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-all">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl text-sm transition-all">
              <Trash2 size={14} /> Move to Trash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [tab, setTab] = useState('active'); // 'active' | 'trash'
  const [editing, setEditing] = useState(null);
  const [confirmTrash, setConfirmTrash] = useState(null);
  const [working, setWorking] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    // Try fetching with deleted_at filter (requires migration)
    const [res1, res2] = await Promise.all([
      supabase.from('products').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('products').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
    ]);

    const colMissing = res1.error?.code === '42703' || res2.error?.code === '42703';

    if (colMissing) {
      // deleted_at column not added yet — show all products, no trash support yet
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setTrash([]);
    } else {
      setProducts(res1.data || []);
      setTrash(res2.data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const seedDefaults = async () => {
    setSeeding(true);
    const { error } = await supabase.from('products').insert(DEFAULT_PRODUCTS);
    setSeeding(false);
    if (error) { alert('Seed failed: ' + error.message); return; }
    fetchProducts();
  };

  const toggleActive = async (product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  };

  // Bulk select helpers
  const activeList = tab === 'active' ? products : trash;
  const toggleSelect = (id) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAll = () =>
    setSelected(selected.size === activeList.length ? new Set() : new Set(activeList.map(p => p.id)));
  const isAllSelected = activeList.length > 0 && selected.size === activeList.length;

  // Bulk move to trash
  const bulkMoveToTrash = async () => {
    if (selected.size === 0) return;
    setBulkWorking(true);
    const ids = [...selected];
    await supabase.from('products').update({ deleted_at: new Date().toISOString(), is_active: false }).in('id', ids);
    setSelected(new Set());
    setBulkWorking(false);
    fetchProducts();
  };

  // Bulk restore from trash
  const bulkRestore = async () => {
    if (selected.size === 0) return;
    setBulkWorking(true);
    const ids = [...selected];
    await supabase.from('products').update({ deleted_at: null }).in('id', ids);
    setSelected(new Set());
    setBulkWorking(false);
    fetchProducts();
  };

  // Bulk permanent delete (trash tab only)
  const bulkDeletePermanently = async () => {
    if (selected.size === 0) return;
    setBulkWorking(true);
    const ids = [...selected];
    await supabase.from('products').delete().in('id', ids);
    setSelected(new Set());
    setBulkWorking(false);
    fetchProducts();
  };

  // Soft delete — move to trash
  const moveToTrash = async (product) => {
    setWorking(product.id);
    await supabase.from('products').update({ deleted_at: new Date().toISOString(), is_active: false }).eq('id', product.id);
    setWorking(null);
    setConfirmTrash(null);
    fetchProducts();
  };

  // Restore from trash
  const restoreProduct = async (id) => {
    setWorking(id);
    await supabase.from('products').update({ deleted_at: null }).eq('id', id);
    setWorking(null);
    fetchProducts();
  };

  // Permanent delete (only from trash view)
  const deletePermanently = async (id) => {
    setWorking(id);
    await supabase.from('products').delete().eq('id', id);
    setWorking(null);
    fetchProducts();
  };

  const discount = (p) => Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package size={22} className="text-violet-500" /> Products
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{products.length} active · {trash.length} in trash</p>
        </div>
        <div className="flex items-center gap-2">
          {products.length === 0 && tab === 'active' && (
            <button onClick={seedDefaults} disabled={seeding}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">
              <Download size={16} /> {seeding ? 'Importing…' : 'Import Default Products'}
            </button>
          )}
          {tab === 'active' && (
            <button onClick={() => setEditing({})}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-all">
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'active', label: `Active (${products.length})`, icon: Package },
          { key: 'trash', label: `Trash (${trash.length})`, icon: Trash2 },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={() => setSelected(new Set())}
            className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
            Deselect All
          </button>
          {tab === 'active' ? (
            <button onClick={bulkMoveToTrash} disabled={bulkWorking}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
              <Trash2 size={14} />
              {bulkWorking ? 'Moving…' : `Trash ${selected.size}`}
            </button>
          ) : (
            <>
              <button onClick={bulkRestore} disabled={bulkWorking}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
                ↩ {bulkWorking ? 'Restoring…' : `Restore ${selected.size}`}
              </button>
              <button onClick={bulkDeletePermanently} disabled={bulkWorking}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
                <Trash2 size={14} />
                {bulkWorking ? 'Deleting…' : `Delete Forever`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : activeList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
          {tab === 'active' ? (
            <>
              <Package size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-lg">No products yet.</p>
              <p className="text-slate-400 text-sm mt-1 mb-6">Import all 8 existing TagLink products in one click, or add your own.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={seedDefaults} disabled={seeding}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-sm transition-all disabled:opacity-50">
                  <Download size={16} /> {seeding ? 'Importing…' : '⚡ Import Default Products (8)'}
                </button>
                <button onClick={() => setEditing({})}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-3 rounded-xl text-sm shadow-sm transition-all">
                  <Plus size={15} /> Add Manually
                </button>
              </div>
            </>
          ) : (
            <>
              <Trash2 size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold">Trash is empty</p>
              <p className="text-slate-400 text-sm mt-1">Deleted products will appear here for recovery.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Select All row */}
          <div className="flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isAllSelected} onChange={selectAll}
                className="w-4 h-4 rounded accent-violet-600 cursor-pointer" />
              <span className="text-xs font-semibold text-slate-500">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </label>
            <span className="text-xs text-slate-400">{activeList.length} {tab === 'trash' ? 'in trash' : 'products'}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeList.map(product => (
            <div key={product.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                selected.has(product.id)
                  ? 'border-violet-400 ring-2 ring-violet-200'
                  : tab === 'trash' ? 'border-red-100 opacity-75' : product.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'
              }`}>
              {/* Checkbox */}
              <div className="flex items-center px-4 pt-3 pb-0">
                <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)}
                  className="w-4 h-4 rounded accent-violet-600 cursor-pointer" />
              </div>
              {/* Card Header */}
              <div className="relative p-5 flex items-center gap-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center border border-slate-200">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                    : <span className="text-3xl">{product.emoji || '🏷️'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5">
                    <p className="font-bold text-slate-900 text-sm leading-snug truncate flex-1">{product.name}</p>
                    {product.badge && (
                      <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded-full shrink-0 ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{product.category}</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-violet-700 font-black text-sm">₹{product.price?.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 text-xs line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-600 text-[10px] font-bold">{discount(product)}% off</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {Array.isArray(product.features) && product.features.length > 0 && (
                <div className="px-4 py-2 flex flex-wrap gap-1.5">
                  {product.features.slice(0, 3).map(f => (
                    <span key={f} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                  {product.features.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{product.features.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="px-4 py-3 flex items-center gap-2 border-t border-slate-100 bg-slate-50">
                {tab === 'active' ? (
                  <>
                    <button onClick={() => toggleActive(product)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${product.is_active ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-500 bg-slate-200 hover:bg-slate-300'}`}>
                      {product.is_active ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
                    </button>
                    <button onClick={() => setEditing(product)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-all">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setConfirmTrash(product)} disabled={working === product.id}
                      className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      title="Move to Trash">
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-slate-400 flex-1">
                      Deleted {new Date(product.deleted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <button onClick={() => restoreProduct(product.id)} disabled={working === product.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                      ↩ Restore
                    </button>
                    <button onClick={() => deletePermanently(product.id)} disabled={working === product.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      title="Delete Forever">
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Confirm Trash Modal */}
      {confirmTrash && (
        <ConfirmTrashModal
          product={confirmTrash}
          onConfirm={() => moveToTrash(confirmTrash)}
          onCancel={() => setConfirmTrash(null)}
        />
      )}

      {/* Edit / Add Modal */}
      {editing !== null && (
        <ProductForm
          product={Object.keys(editing).length === 0 ? null : editing}
          onSave={() => { setEditing(null); fetchProducts(); }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
