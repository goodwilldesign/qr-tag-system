import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Ticket, Plus, Copy, Check, Trash2, ToggleLeft, ToggleRight, X, Tag, Percent, BadgeDollarSign, Calendar, Hash } from 'lucide-react';

function StatusBadge({ code }) {
  const now = new Date();
  if (!code.is_active) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Inactive</span>;
  if (code.expires_at && new Date(code.expires_at) < now) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Expired</span>;
  if (code.max_uses && code.uses_count >= code.max_uses) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Maxed Out</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>;
}

const EMPTY_FORM = { code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '', is_active: true };

export default function AdminPromoCodes() {
  const [codes, setCodes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(null);
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => { fetchCodes(); }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setCodes(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value) return setError('Code and discount value are required.');
    setSaving(true); setError('');
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
    };
    const { error: err } = await supabase.from('promo_codes').insert([payload]);
    if (err) { setError(err.message); setSaving(false); return; }
    setModalOpen(false);
    setForm(EMPTY_FORM);
    fetchCodes();
    setSaving(false);
  };

  const toggleActive = async (code) => {
    await supabase.from('promo_codes').update({ is_active: !code.is_active }).eq('id', code.id);
    setCodes(prev => prev.map(c => c.id === code.id ? { ...c, is_active: !c.is_active } : c));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    setDeleting(id);
    await supabase.from('promo_codes').delete().eq('id', id);
    setCodes(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Ticket size={22} className="text-violet-500" /> Promo Codes
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{codes.length} code{codes.length !== 1 ? 's' : ''} configured</p>
        </div>
        <button onClick={() => { setModalOpen(true); setForm(EMPTY_FORM); setError(''); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm shadow-violet-200 transition-all">
          <Plus size={16} /> New Code
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : codes.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">No promo codes yet</p>
            <p className="text-slate-400 text-sm mb-4">Create your first code to offer discounts.</p>
            <button onClick={() => setModalOpen(true)} className="bg-violet-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl">Create Code</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Code', 'Discount', 'Uses', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 font-mono text-sm tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">{code.code}</span>
                        <button onClick={() => copyCode(code.code)} title="Copy Code"
                          className="text-slate-400 hover:text-violet-600 transition-colors">
                          {copied === code.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        {code.discount_type === 'percent' ? <Percent size={13} className="text-violet-500" /> : <BadgeDollarSign size={13} className="text-emerald-500" />}
                        {code.discount_type === 'percent' ? `${code.discount_value}%` : `₹${code.discount_value}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Hash size={12} className="text-slate-400" />
                        {code.uses_count}{code.max_uses ? ` / ${code.max_uses}` : ' / ∞'}
                      </div>
                      {code.max_uses && (
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1">
                          <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (code.uses_count / code.max_uses) * 100)}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {code.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(code.expires_at).toLocaleDateString('en-IN')}
                        </div>
                      ) : <span className="text-slate-300">Never</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge code={code} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(code)} title={code.is_active ? 'Deactivate' : 'Activate'}
                          className="text-slate-400 hover:text-violet-600 transition-colors">
                          {code.is_active ? <ToggleRight size={20} className="text-violet-500" /> : <ToggleLeft size={20} />}
                        </button>
                        <button onClick={() => handleDelete(code.id)} disabled={deleting === code.id}
                          className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Ticket size={16} className="text-violet-500" /> New Promo Code</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Code</label>
                <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. LAUNCH50" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-wider outline-none focus:border-violet-400 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Discount Type</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-violet-400">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Value</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                    placeholder={form.discount_type === 'percent' ? '10' : '50'} min="0" required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Max Uses</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="Unlimited" min="1"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm disabled:opacity-50 transition-all">
                  {saving ? 'Creating…' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
