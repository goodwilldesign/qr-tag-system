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
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

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
        navigate(returnUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-start py-4 sm:py-8 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 text-2xl font-black text-slate-900 mb-1 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#002b80] to-[#38b6ff] flex items-center justify-center text-white shadow-sm shadow-[#002b80]/20">
              <QrCode className="h-5 w-5 text-white stroke-[2.2]" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#002b80]">
              Get<span className="text-[#38b6ff]">UR</span>QR
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002b80] mt-3 tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            {isSignUp ? 'Start generating smart QR tags for free.' : 'Sign in to manage your QR tags.'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 shadow-xl border border-slate-200/80 rounded-3xl bg-white/95 backdrop-blur-xl">
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

            {!isSignUp && (
              <div className="text-center mt-3">
                <Link to="/reset-password" className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors">
                  Forgot your password?
                </Link>
              </div>
            )}
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
