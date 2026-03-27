import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { QrCode, User, LogOut, LayoutDashboard, ShoppingBag, Shield, BookOpen, Mail, MapPin, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import ChatWidget from '../components/support/ChatWidget';

export default function Layout() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = ['/login', '/signup'].includes(location.pathname);

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

  // Scroll listener for seamless header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    const handlePWA = () => setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleScroll();
    handleResize();
    handlePWA();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Pages that handle their own padding
  const isLandingPage = location.pathname === '/';
  const isFullWidthPage = ['/', '/blog'].includes(location.pathname);

  // Hide footer on task-focused pages
  const hideFooter = [
    '/dashboard', '/login', '/profile', '/checkout'
  ].includes(location.pathname) || location.pathname.startsWith('/tag/edit/');

  // Mobile/PWA specific visibility
  const hideNavbar = isLoginPage && (isPWA || isMobile);
  const showBottomNav = session && !isLoginPage;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <nav className={`navbar ${(scrolled || !isLandingPage) ? 'navbar-scrolled' : ''} ${hideNavbar ? 'hidden' : ''}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto flex flex-row justify-between items-center">
          <Link to="/" className="nav-brand shrink-0">
            <QrCode className="h-6 w-6 text-violet-600" />
            <span className={session ? 'hidden xs:inline' : ''}>GetURQR</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {session ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/store" className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm">
                    <ShoppingBag size={16} />
                    <span className="hidden sm:inline">Store</span>
                  </Link>
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
                </div>
                <button onClick={handleLogout} className="btn btn-danger p-2 sm:px-3 sm:py-2">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              !['/login', '/signup'].includes(location.pathname) && (
                <Link to="/login" className="btn btn-primary px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full shadow-lg shadow-violet-200">Log In</Link>
              )
            )}
          </div>
        </div>
      </nav>

      <main className={`w-full flex-1 ${isLandingPage || hideNavbar ? '' : 'mt-16'} ${isFullWidthPage ? '' : (showBottomNav ? 'px-4 sm:px-6 lg:px-8 pt-4 pb-24' : 'px-4 sm:px-6 lg:px-8 pt-4 pb-12')}`}>
        <Outlet />
      </main>

      {/* ── Mobile Bottom Navigation ────────────────── */}
      {showBottomNav && (
        <div className="bottom-nav">
          <Link to="/dashboard" className={`bottom-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/store" className={`bottom-nav-item ${location.pathname === '/store' ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            <span>Store</span>
          </Link>
          <Link to="/profile" className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={20} />
            <span>Profile</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`bottom-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              <Shield size={20} />
              <span>Admin</span>
            </Link>
          )}
        </div>
      )}

      {/* ── Beautiful Footer ──────────────────────────── */}
      {!hideFooter && (
        <footer className="bg-slate-900 text-slate-300 w-full">
        {/* Main Footer Grid */}
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-5">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-2 bg-violet-600 rounded-xl group-hover:bg-violet-500 transition-colors">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">GetURQR</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
                Smart QR tags that connect the physical world to digital safety. Protect what matters most — pets, kids, vehicles, and property.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="mailto:support@geturqr.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors">
                  <Mail size={14} /> support@geturqr.com
                </a>
              </div>
            </div>

            {/* Products Column */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Products</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">🐶 Pet Tags</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">👶 Child Safety Tags</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">🚗 Vehicle / Parking Tags</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">🔔 Doorbell Tags</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">🏠 House Rental Tags</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">🏨 Hotel Tags</Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/blog" className="hover:text-violet-400 transition-colors">Blog</Link></li>
                <li><Link to="/#pricing" className="hover:text-violet-400 transition-colors">Pricing</Link></li>
                <li><Link to="/store" className="hover:text-violet-400 transition-colors">Store</Link></li>
                <li><Link to="/login" className="hover:text-violet-400 transition-colors">Create Free Tag</Link></li>
              </ul>
            </div>

            {/* CTA Column */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Get Started</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Create your first digital QR tag completely free. No credit card required.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-violet-900/30">
                Create Your Free Tag →
              </Link>
              <div className="flex items-start gap-2 text-xs text-slate-500 pt-2">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>Available worldwide · Free shipping on physical tags</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800">
          <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} GetURQR · All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
      )}

      <ChatWidget />
    </div>
  );
}
