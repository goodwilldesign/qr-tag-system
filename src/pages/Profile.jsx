import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, Save, CheckCircle } from 'lucide-react';
import PhoneInput from '../components/PhoneInput';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setFullName(data.full_name || '');
        setWhatsappNumber(data.whatsapp_number || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: fullName,
      whatsapp_number: whatsappNumber,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading profile…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your contact details used in your QR tags.</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card p-6 flex items-center gap-5 mb-6">
        <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-violet-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{fullName || 'Your Name'}</p>
          <p className="text-sm text-slate-500">{email}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card p-8">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle size={16} /> Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" className="form-input pl-10" placeholder="Jane Doe"
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <p className="text-xs text-slate-400 -mt-1 mb-1">Enter your number without the country code — select your country from the flag.</p>
            <PhoneInput
              value={whatsappNumber}
              onChange={setWhatsappNumber}
              placeholder="9876543210"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn btn-primary px-6 py-2.5" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
