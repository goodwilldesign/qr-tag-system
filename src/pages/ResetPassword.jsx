import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { QrCode, Mail, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setMessage('Check your email for the password reset link.');
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
          <h1 className="text-2xl font-bold text-slate-900 mt-4">Reset Password</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your email to receive a password reset link.</p>
        </div>

        <div className="glass-card p-8 shadow-lg">
          {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}
          {message && <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{message}</div>}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" className="form-input pl-10" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 mt-2 shadow-sm" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:underline inline-flex items-center gap-1">
               <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
