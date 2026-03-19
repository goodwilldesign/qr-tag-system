import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Truck, ShieldCheck, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/login'); return; }
        const { data, error } = await supabase.from('tags').select('*')
          .eq('id', id).eq('user_id', session.user.id).single();
        if (error || !data) throw new Error('Tag not found');
        setTag(data);
      } catch { navigate('/dashboard'); }
      finally { setLoading(false); }
    };
    fetchTag();
  }, [id, navigate]);

  const handleMockCheckout = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert("Demo: In production, you'd be redirected to Stripe Checkout here to pay $9.99.");
      navigate('/dashboard');
    }, 1500);
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="glass-card p-8 flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h1>

          <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <div className="h-14 w-14 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <Package className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Premium Physical Tag</p>
              <p className="text-sm text-slate-500">Linked to "{tag?.title}"</p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle size={11} /> Lifetime Updates Included
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm border-t border-slate-200 pt-5 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-600">Engraved Metal Tag (1×)</span>
              <span className="font-semibold text-slate-900">$9.99</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-slate-600"><Truck size={14} /> Global Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Taxes</span>
              <span className="text-slate-400">At checkout</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-between items-center mt-auto">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-2xl font-extrabold text-violet-700">$9.99</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-600" /> Payment Details
          </h2>

          <form onSubmit={handleMockCheckout} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Jane Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <textarea className="form-input min-h-[90px]" placeholder="123 Main St, Apt 4B&#10;City, State 12345" required />
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
              <span>You'll be redirected to Razorpay's secure checkout to complete payment.</span>
            </div>

            <button type="submit" className="btn btn-primary w-full py-4 text-base mt-2" disabled={processing}>
              {processing ? 'Redirecting to Razorpay…' : 'Proceed to Checkout →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
