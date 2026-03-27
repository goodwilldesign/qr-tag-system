import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { QrCode, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(location.pathname === '/signup');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo('Account created! Check your email to confirm, then log in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-slate-900 mb-2">
            <QrCode className="h-7 w-7 text-violet-600" />GetURQR
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSignUp ? 'Start generating smart QR tags for free.' : 'Sign in to manage your QR tags.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-lg">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          {info && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{info}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" className="form-input pl-10" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} className="form-input pl-10 pr-10"
                  placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3 mt-2 shadow-sm" disabled={loading}>
              {loading ? 'Please wait…' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button className="font-semibold text-violet-600 hover:underline" onClick={() => { setIsSignUp(!isSignUp); setError(''); setInfo(''); }}>
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
