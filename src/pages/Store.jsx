import { useState, useEffect } from 'react';
import { X, Star, Package, Truck, Shield, ChevronRight, Check, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Product Catalogue ─────────────────────────────────── */
const PRODUCTS = [
  {
    id: 'pet-tag-metal',
    name: 'Premium Metal Pet Tag',
    category: 'Tags',
    emoji: '🏷️',
    description: 'Durable stainless steel tag with laser-engraved QR code. Waterproof, scratch-proof, and built to last.',
    price: 499, originalPrice: 799,
    badge: 'Best Seller', badgeColor: 'bg-amber-500',
    features: ['Stainless Steel', 'Waterproof', 'Laser Engraved', 'Lifetime QR'],
    color: 'amber',
  },
  {
    id: 'luggage-tag',
    name: 'Smart Luggage Tag',
    category: 'Tags',
    emoji: '🧳',
    description: 'Flexible PVC luggage tag with integrated QR code. Perfect for travel bags, suitcases and backpacks.',
    price: 349, originalPrice: 549,
    badge: 'Popular', badgeColor: 'bg-blue-500',
    features: ['Flexible PVC', 'Name Window', 'Clip Included', '5 Color Options'],
    color: 'blue',
  },
  {
    id: 'sticker-pack',
    name: 'QR Sticker Pack (5 pcs)',
    category: 'Stickers',
    emoji: '📌',
    description: 'Weather-resistant vinyl QR stickers. Stick on laptops, helmets, bikes, or any gear you want to protect.',
    price: 199, originalPrice: 299,
    badge: 'Value Pack', badgeColor: 'bg-emerald-500',
    features: ['5 Stickers', 'UV resistant', 'Waterproof', 'Any Surface'],
    color: 'emerald',
  },
  {
    id: 'tshirt',
    name: 'GetURQR Classic T-Shirt',
    category: 'Apparel',
    emoji: '👕',
    description: 'Premium 100% cotton T-shirt with a scannable QR code printed on the sleeve. Great for kids and outdoor enthusiasts.',
    price: 799, originalPrice: 1099,
    badge: 'New Arrival', badgeColor: 'bg-violet-500',
    features: ['100% Cotton', 'QR on Sleeve', 'Sizes S–XXL', '5 Colors'],
    color: 'violet', hasSize: true,
  },
  {
    id: 'cap',
    name: 'GetURQR Smart Cap',
    category: 'Apparel',
    emoji: '🧢',
    description: 'Adjustable cap with a discreet QR tag patch on the side. Stylish and functional for everyday use.',
    price: 599, originalPrice: 899,
    features: ['Adjustable', 'QR Side Patch', 'Unisex', '4 Colors'],
    color: 'rose',
  },
  {
    id: 'wristband',
    name: 'GetURQR Silicone Wristband',
    category: 'Accessories',
    emoji: '💪',
    description: 'Soft, medical-grade silicone wristband with embedded QR code. Perfect for kids, elderly or medical use cases.',
    price: 299, originalPrice: 499,
    badge: 'Kids Friendly', badgeColor: 'bg-pink-500',
    features: ['Medical Silicone', 'Waterproof', 'Hypoallergenic', 'QR Embedded'],
    color: 'pink', hasSize: true,
  },
  {
    id: 'keychain-tag',
    name: 'QR Keychain Tag',
    category: 'Tags',
    emoji: '🔑',
    description: 'Compact hard-plastic QR keychain. Attach to keys, wallets, or bags for quick identification.',
    price: 249, originalPrice: 399,
    features: ['Hard Plastic', 'Keychain Loop', 'Compact Design', 'Durable Print'],
    color: 'slate',
  },
  {
    id: 'premium-kit',
    name: 'GetURQR Starter Kit',
    category: 'Bundles',
    emoji: '🎁',
    description: 'Everything you need to get started: 1 metal tag + 1 luggage tag + 5 stickers. Best value bundle.',
    price: 899, originalPrice: 1349,
    badge: '🔥 Best Value', badgeColor: 'bg-red-500',
    features: ['1 Metal Tag', '1 Luggage Tag', '5 Stickers', 'Premium Box'],
    color: 'indigo',
  },
];

const CATEGORIES = ['All', 'Tags', 'Stickers', 'Apparel', 'Accessories', 'Bundles'];

const COLOR_MAP = {
  amber:   'bg-amber-50 border-amber-200 text-amber-700',
  blue:    'bg-blue-50 border-blue-200 text-blue-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  violet:  'bg-violet-50 border-violet-200 text-violet-700',
  rose:    'bg-rose-50 border-rose-200 text-rose-700',
  pink:    'bg-pink-50 border-pink-200 text-pink-700',
  slate:   'bg-slate-50 border-slate-200 text-slate-700',
  indigo:  'bg-indigo-50 border-indigo-200 text-indigo-700',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const TYPE_EMOJI = { dog: '🐶', kids: '👶', rental: '🔑', doorbell: '🔔', parking: '🚗', hotel: '🏨' };

/* ── Razorpay SDK loader ─────────────────────────── */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ── Checkout Modal ──────────────────────────────── */
function CheckoutModal({ item, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', qty: 1, size: '', linked_tag_id: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');
  const [userTags, setUserTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('tags')
          .select('id, title, type')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        setUserTags(data || []);
      }
      setTagsLoading(false);
    };
    fetchTags();
  }, []);

  const total = item.price * form.qty;
  const selectedTag = userTags.find(t => t.id === form.linked_tag_id);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Create pending store order to get an ID
      const { data: orderRow, error: dbErr } = await supabase
        .from('store_orders')
        .insert([{
          user_id: session?.user?.id || null,
          product_id: item.id,
          product_name: item.name,
          quantity: form.qty,
          size: form.size || null,
          unit_price: item.price,
          total_price: total,
          customer_name: form.name,
          customer_phone: form.phone,
          shipping_address: form.address,
          pincode: form.pincode,
          linked_tag_id: form.linked_tag_id || null,
          status: 'pending',
        }])
        .select('id')
        .single();
      if (dbErr) throw new Error('Could not create order. Please try again.');
      const storeOrderId = orderRow.id;

      // 2. Call Edge Function to create Razorpay order
      const edgeRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ amount: total, receipt: storeOrderId }),
        }
      );
      const razorpayOrder = await edgeRes.json();
      if (!edgeRes.ok) throw new Error(razorpayOrder.error || 'Payment setup failed.');

      // 3. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load. Check your internet.');

      // 4. Open Razorpay modal
      const rzp = new window.Razorpay({
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'GetURQR Store',
        description: item.name,
        order_id: razorpayOrder.order_id,
        prefill: { name: form.name, contact: form.phone, email: session?.user?.email || '' },
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            // 5. Verify payment via Edge Function
            const verifyRes = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  store_order_id: storeOrderId,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');
            setPaymentId(response.razorpay_payment_id);
            setSuccess(true);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="font-bold text-slate-900 text-lg">Secure Checkout</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"><X size={20} /></button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Successful! 🎉</h3>
            <p className="text-slate-500 text-sm mb-1">Thank you, <strong>{form.name}</strong>!</p>
            <p className="text-slate-500 text-sm mb-3">Your order for <strong>{item.name}</strong> is confirmed.</p>
            {paymentId && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-500 font-mono mb-3">
                Payment ID: <span className="font-bold text-slate-700">{paymentId}</span>
              </div>
            )}
            {selectedTag && <p className="text-xs text-violet-600 mt-1 font-semibold">QR linked: {TYPE_EMOJI[selectedTag.type]} {selectedTag.title}</p>}
            <button onClick={onClose} className="mt-8 btn btn-primary px-8 py-3">Continue Shopping</button>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="p-6 space-y-5">
            {/* Order Summary */}
            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {item.image_url 
                ? <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain mix-blend-multiply shrink-0" />
                : <div className="text-4xl">{item.emoji}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-500">Unit: <span className="font-semibold text-slate-700">₹{item.price.toLocaleString('en-IN')}</span></p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button type="button" onClick={() => setForm(f => ({ ...f, qty: Math.max(1, f.qty - 1) }))} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold">−</button>
                  <span className="w-6 text-center text-sm font-semibold">{form.qty}</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, qty: Math.min(10, f.qty + 1) }))} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-bold">+</button>
                </div>
                <span className="text-sm font-bold text-violet-700">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* QR Tag Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <QrCode size={14} className="text-violet-500" />
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Link a QR Tag to this order</p>
              </div>
              {tagsLoading ? (
                <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
              ) : userTags.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                  No QR tags found. <a href="/dashboard" className="underline font-bold">Create one first</a> to link it here.
                </div>
              ) : (
                <select value={form.linked_tag_id} onChange={e => setForm(f => ({ ...f, linked_tag_id: e.target.value }))} className="form-input w-full cursor-pointer">
                  <option value="">— Select a QR Tag (optional) —</option>
                  {userTags.map(tag => (
                    <option key={tag.id} value={tag.id}>{TYPE_EMOJI[tag.type] || '🏷️'} {tag.title}</option>
                  ))}
                </select>
              )}
              {form.linked_tag_id && selectedTag && (
                <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2 text-xs text-violet-700 font-semibold">
                  <QrCode size={12} /> QR code for "{selectedTag.title}" will be engraved/printed on this item.
                </div>
              )}
            </div>

            {/* Size selector for apparel */}
            {item.hasSize && (
              <div>
                <label className="form-label">Size <span className="text-red-500">*</span></label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, size: s }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${form.size === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Details */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group col-span-2">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" required placeholder="Ramesh Kumar" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group col-span-2 sm:col-span-1">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" required placeholder="9876543210" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group col-span-2 sm:col-span-1">
                  <label className="form-label">PIN Code</label>
                  <input className="form-input" required placeholder="600001" maxLength={6} value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Delivery Address</label>
                  <textarea className="form-input" required rows={2} placeholder="House No, Street, Area, City, State" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Total Amount</p>
                <p className="text-2xl font-extrabold text-slate-900">₹{total.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-600 font-semibold">Free Shipping · Powered by Razorpay</p>
              </div>
              <button type="submit" disabled={loading || (item.hasSize && !form.size)} className="btn btn-primary px-6 py-3 text-base disabled:opacity-50">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</span>
                  : `💳 Pay ₹${total.toLocaleString('en-IN')}`
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Product Card ─────────────────────────────── */
function ProductCard({ product, onBuy }) {
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const colorClass = COLOR_MAP[product.color] || COLOR_MAP.slate;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group hover:-translate-y-1">
      <div className={`relative flex items-center justify-center min-h-[180px] border-b border-slate-100 overflow-hidden ${product.image_url ? 'bg-slate-50' : `bg-gradient-to-br ${colorClass.split(' ')[0].replace('bg-', 'from-')} to-white p-8`}`}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name}
              className="w-full h-full object-contain max-h-[180px] mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
          : <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
        }
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-black text-white px-2 py-1 rounded-full uppercase tracking-wide ${product.badgeColor}`}>{product.badge}</span>
        )}
        <span className="absolute top-3 right-3 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">{discount}% OFF</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-2">{product.name}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{product.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.features.map(f => (
            <span key={f} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>{f}</span>
          ))}
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">Free Delivery · COD Available</p>
          </div>
          <button onClick={() => onBuy(product)} className="btn btn-primary px-4 py-2.5 text-sm shadow-sm">
            Buy Now <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Store Page ───────────────────── */
export default function Store() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [buyingProduct, setBuyingProduct] = useState(null);
  const [dbProducts, setDbProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Check maintenance mode from site_settings
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'store_maintenance_mode')
      .single()
      .then(({ data }) => {
        if (data?.value === 'true') setMaintenanceMode(true);
      });
  }, []);

  // Load live products from Supabase (admin-managed)
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      // Fallback to hardcoded list if DB is empty (before first seed)
      setDbProducts(data && data.length > 0 ? data : PRODUCTS);
      setProductsLoading(false);
    };
    fetchProducts();
  }, []);

  // ── Maintenance screen ────────────────────────────────────
  if (maintenanceMode) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🛠️</div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Store Under Maintenance</h1>
          <p className="text-slate-500 text-base leading-relaxed mb-6">
            We're working hard to bring you an even better shopping experience.
            The store will be back shortly — check back in a little while!
          </p>
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 px-5 py-2.5 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Coming Back Soon
          </div>
        </div>
      </div>
    );
  }


  const filtered = activeCategory === 'All'
    ? dbProducts
    : dbProducts.filter(p => p.category === activeCategory);

  // Dynamic categories from actual products
  const activeCategories = ['All', ...new Set(dbProducts.map(p => p.category))];

  // ── SEO: inject JSON-LD schema + meta tags ───────────────
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'GetURQR Store — Premium QR Tags, Stickers & Accessories India';

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    const prevDesc = metaDesc.content;
    metaDesc.content = 'Buy premium QR tags, stickers, T-shirts, wristbands and luggage tags from GetURQR. Free delivery across India. Secure Razorpay payments. Starting at ₹199.';

    // JSON-LD Schema
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://geturqr.com/#organization',
          name: 'GetURQR',
          url: 'https://geturqr.com',
          logo: 'https://geturqr.com/logo.png',
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: 'store@geturqr.com', areaServed: 'IN' },
        },
        {
          '@type': 'ItemList',
          name: 'GetURQR Store — Premium QR Accessories',
          description: 'Premium QR-enabled tags, stickers, apparel and accessories. Free delivery across India.',
          numberOfItems: PRODUCTS.length,
          itemListElement: PRODUCTS.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: `https://geturqr.com/products/${product.id}.jpg`,
              brand: { '@type': 'Brand', name: 'GetURQR' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: product.price,
                priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
                seller: { '@type': 'Organization', name: 'GetURQR' },
                shippingDetails: {
                  '@type': 'OfferShippingDetails',
                  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'INR' },
                  deliveryTime: { '@type': 'ShippingDeliveryTime', businessDays: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'] }, handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' } },
                  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
                },
              },
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '124' },
            },
          })),
        },
        {
          '@type': 'WebPage',
          '@id': 'https://geturqr.com/store',
          url: 'https://geturqr.com/store',
          name: 'GetURQR Store — Premium QR Tags & Accessories',
          isPartOf: { '@id': 'https://geturqr.com/#organization' },
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://geturqr.com' },
              { '@type': 'ListItem', position: 2, name: 'Store', item: 'https://geturqr.com/store' },
            ],
          },
        },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'store-jsonld';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      metaDesc.content = prevDesc;
      document.getElementById('store-jsonld')?.remove();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center py-8">
        <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full uppercase tracking-widest">GetURQR Store</span>
        <h1 className="text-4xl font-extrabold text-slate-900 mt-3 mb-2">Official GetURQR Shop 🇮🇳</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Premium QR accessories to protect what matters most. Free delivery across India. Pay securely via Razorpay.</p>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
        {[
          { icon: Truck, label: 'Free Delivery', sub: 'Pan India', color: 'emerald' },
          { icon: Shield, label: 'Secure Payments', sub: 'Powered by Razorpay', color: 'blue' },
          { icon: Star, label: 'Premium Quality', sub: 'Guaranteed', color: 'amber' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm leading-none">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {activeCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              activeCategory === cat
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-violet-400 hover:text-violet-700'
            }`}>
            {cat}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({cat === 'All' ? dbProducts.length : dbProducts.filter(p => p.category === cat).length})
            </span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {productsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="font-semibold">No products in this category.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onBuy={setBuyingProduct} />
          ))}
        </div>
      )}

      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
        <p className="text-xl font-black mb-1">Need a Custom Bulk Order? 🏢</p>
        <p className="text-violet-200 text-sm mb-4">Hotels, schools, and businesses can get bulk QR tags at special prices.</p>
        <a href="mailto:store@geturqr.com" className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-violet-50 transition-colors">
          <Package size={16} /> Contact for Bulk Orders
        </a>
      </div>

      {buyingProduct && <CheckoutModal item={buyingProduct} onClose={() => setBuyingProduct(null)} />}
    </div>
  );
}
