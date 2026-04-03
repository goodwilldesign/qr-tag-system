import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard, ShoppingBag, FileText, Users, Settings,
  QrCode, LogOut, ChevronRight, Shield, Menu, X, Package, Image, Ticket, Megaphone
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin', label: 'Analytics', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/store', label: 'Store Orders', icon: ShoppingBag },
  { path: '/admin/blog', label: 'AI Blog', icon: FileText },
  { path: '/admin/support', label: 'Support Tickets', icon: FileText },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/templates', label: 'Print Templates', icon: Image },
  { path: '/admin/promo-codes', label: 'Promo Codes', icon: Ticket },
  { path: '/admin/broadcasts', label: 'Broadcasts', icon: Megaphone },
  { path: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessError, setAccessError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session: s }, error: sessionError } = await supabase.auth.getSession();
      if (!s || sessionError) { navigate('/login'); return; }
      setSession(s);
      
      // Fetch profile role
      const { data: profile, error: dbError } = await supabase
        .from('profiles').select('role').eq('id', s.user.id).single();
      
      if (dbError) {
        setAccessError(`Database Error: ${dbError.message}\nUser ID: ${s.user.id}`);
        setLoading(false);
        return;
      }

      if (profile?.role !== 'admin') {
        setAccessError(`Access Denied. Your profile role is "${profile?.role || 'null'}" instead of "admin".\nAccount: ${s.user.email}`);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-500 mb-6">You don't have permission to view the admin panel. Here is the exact reason:</p>
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-left font-mono text-sm whitespace-pre-wrap overflow-auto mb-6">
            {accessError}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
              Return to Dashboard
            </button>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all">
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 shadow-sm ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm leading-none">GetURQR</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={9} className="text-violet-500" />
                <p className="text-[9px] text-violet-500 font-bold uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive(path, exact)
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {isActive(path, exact) && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {session?.user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 text-xs font-semibold truncate">{session?.user?.email}</p>
              <p className="text-violet-500 text-[10px] font-bold">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-medium transition-all">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-slate-900 font-extrabold text-sm">Admin Panel</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
