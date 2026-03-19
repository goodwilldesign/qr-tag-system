import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, Check, AlertCircle } from 'lucide-react';

const SETTINGS_SCHEMA = [
  { key: 'site_name', label: 'Site Name', placeholder: 'TagLink', type: 'text' },
  { key: 'site_tagline', label: 'Site Tagline', placeholder: 'Smart QR Tags for Everything', type: 'text' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@taglink.app', type: 'email' },
  { key: 'support_phone', label: 'Support Phone', placeholder: '+91 9876543210', type: 'tel' },
  { key: 'store_cod_enabled', label: 'COD (Cash on Delivery)', type: 'toggle' },
  { key: 'razorpay_enabled', label: 'Razorpay Payments Enabled', type: 'toggle' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
  { key: 'announcement_banner', label: 'Announcement Banner Text', placeholder: 'e.g. Free delivery this week!', type: 'text' },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('site_settings').select('key, value');
      const map = {};
      (data || []).forEach(row => { map[row.key] = row.value; });
      setSettings(map);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({
        key, value: String(value), updated_at: new Date().toISOString()
      }));
      const { error: dbErr } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
      if (dbErr) throw dbErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-48 bg-slate-100 rounded-xl animate-pulse" />
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-violet-500" /> Site Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your TagLink site globally.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {SETTINGS_SCHEMA.map(({ key, label, placeholder, type }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-slate-900 text-sm font-semibold">{label}</p>
              <p className="text-slate-400 text-xs font-mono">{key}</p>
            </div>
            {type === 'toggle' ? (
              <button onClick={() => setSettings(s => ({ ...s, [key]: s[key] === 'true' ? 'false' : 'true' }))}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${settings[key] === 'true' ? 'bg-violet-600' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] === 'true' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            ) : (
              <input type={type} value={settings[key] || ''} placeholder={placeholder}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                className="w-56 border border-slate-200 text-slate-900 placeholder-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-500 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50 ${
          saved ? 'bg-emerald-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
        }`}>
        {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Settings</>}
      </button>
    </div>
  );
}
