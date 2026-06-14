import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Lock, Eye, EyeOff } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: check session or listen to event
    supabase.auth.getSession().then(({ data: { session } }) => {
      // User must be logged in (which happens automatically via recovery link) to update password
      if (!session) {
        setError('You must be logged in or use a valid recovery link to update your password.');
      }
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-slate-900 mb-2">
            <QrCode className="h-7 w-7 text-violet-600" />GetURQR
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">Update Password</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your new password below.</p>
        </div>

        <div className="glass-card p-8 shadow-lg">
          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
          {message && <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{message}</div>}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} className="form-input pl-10 pr-10"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 mt-2 shadow-sm" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
