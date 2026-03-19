import { Outlet, Link, useNavigate } from 'react-router-dom';
import { QrCode, User, LogOut, LayoutDashboard, ShoppingBag, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import ChatWidget from '../components/support/ChatWidget';

export default function Layout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', s.user.id).single();
        setIsAdmin(profile?.role === 'admin');
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setIsAdmin(false);
    });
    return () => subscription.unsubscribe();
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto flex flex-row justify-between items-center">
          <Link to="/" className="nav-brand shrink-0">
            <QrCode className="h-6 w-6 text-violet-600" />
            <span>TagLink</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/blog" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Blog</span>
            </Link>
            <Link to="/store" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm">
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Store</span>
            </Link>
            {session ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm border-violet-400 text-violet-600 hover:bg-violet-50">
                    <Shield size={16} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link to="/profile" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  <User size={16} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-danger p-2 sm:px-3 sm:py-2">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary px-5 py-2 text-sm">Log In</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-8 mx-auto mt-lg pb-12">
        <Outlet />
      </main>

      <ChatWidget />
    </>
  );
}

