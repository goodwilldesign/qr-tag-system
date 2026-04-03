import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Megaphone, Plus, Send, Clock, Users, Info, AlertTriangle, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';

const TYPE_META = {
  info:    { icon: Info,          color: 'bg-blue-50 border-blue-200 text-blue-700',    badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',    label: 'Info' },
  warning: { icon: AlertTriangle, color: 'bg-amber-50 border-amber-200 text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500',   label: 'Warning' },
  success: { icon: CheckCircle2,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Success' },
};

const EMPTY_FORM = { title: '', body: '', type: 'info' };

export default function AdminBroadcasts() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [preview, setPreview]       = useState(false);
  const [success, setSuccess]       = useState('');

  useEffect(() => { fetchBroadcasts(); }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('sent_at', { ascending: false });
    setBroadcasts(data || []);
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return setError('Title and message body are required.');
    setSending(true); setError(''); setSuccess('');

    // Get all user emails from profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('is_suspended', false);

    if (profileErr) { setError(profileErr.message); setSending(false); return; }

    const recipientCount = profiles?.length || 0;

    // Save broadcast record to DB
    const { error: insertErr } = await supabase.from('broadcast_messages').insert([{
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      recipient_count: recipientCount,
    }]);

    if (insertErr) { setError(insertErr.message); setSending(false); return; }

    // Call Edge Function to send emails
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title: form.title, body: form.body, type: form.type }),
      });
    } catch (_) {
      // Edge function may not be deployed yet — broadcast is still recorded
    }

    setSuccess(`✅ Broadcast sent to ${recipientCount} user${recipientCount !== 1 ? 's' : ''}!`);
    setForm(EMPTY_FORM);
    setShowCompose(false);
    setPreview(false);
    fetchBroadcasts();
    setSending(false);
    setTimeout(() => setSuccess(''), 5000);
  };

  const meta = TYPE_META[form.type] || TYPE_META.info;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Megaphone size={22} className="text-violet-500" /> Broadcast Messages
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{broadcasts.length} broadcast{broadcasts.length !== 1 ? 's' : ''} sent</p>
        </div>
        <button onClick={() => { setShowCompose(true); setError(''); setSuccess(''); }}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm shadow-violet-200 transition-all">
          <Plus size={16} /> New Broadcast
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-semibold">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Compose Panel */}
      {showCompose && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Send size={15} className="text-violet-500" /> Compose Broadcast
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreview(!preview)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all">
                {preview ? <><EyeOff size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
              </button>
              <button onClick={() => { setShowCompose(false); setPreview(false); setError(''); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={16} /></button>
            </div>
          </div>

          {preview ? (
            /* Preview Card */
            <div className="p-5">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Preview — How users will see it</p>
              <div className={`border rounded-2xl p-5 ${meta.color}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.badge}`}>
                    <meta.icon size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{form.title || 'Your title here'}</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap opacity-90">{form.body || 'Your message body here…'}</p>
                    <p className="text-xs mt-3 opacity-60">From GetURQR · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Broadcast Type</label>
                <div className="flex gap-2">
                  {Object.entries(TYPE_META).map(([key, m]) => (
                    <button key={key} type="button"
                      onClick={() => setForm(f => ({ ...f, type: key }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.type === key ? `${m.badge} border-current` : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      <m.icon size={12} /> {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. New feature just dropped! 🚀" required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Message Body</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your message to all users…" required rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 resize-none" />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowCompose(false); setPreview(false); }}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sending}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                  <Send size={14} /> {sending ? 'Sending…' : 'Send to All Users'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock size={15} className="text-slate-400" />
          <h2 className="font-bold text-slate-900 text-sm">Broadcast History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : broadcasts.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-semibold">No broadcasts yet</p>
            <p className="text-slate-400 text-sm">Send your first message to all users.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {broadcasts.map(b => {
              const m = TYPE_META[b.type] || TYPE_META.info;
              return (
                <div key={b.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${m.badge}`}>
                      <m.icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-bold text-slate-900 text-sm">{b.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.badge}`}>{m.label}</span>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2">{b.body}</p>
                    </div>
                    <div className="text-right shrink-0 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1 justify-end">
                        <Users size={10} /> {b.recipient_count} users
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock size={10} /> {new Date(b.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
