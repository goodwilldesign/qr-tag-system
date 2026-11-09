import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { supabase } from './lib/supabase';
import ScrollToTop from './components/ScrollToTop';

// Layouts
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';

// Public/Auth Pages
import LandingPage from './pages/LandingPage';
import LandingPage2 from './pages/LandingPage2';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import TagView from './pages/TagView';
import Store from './pages/Store';
import Blog from './pages/Blog';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import TagEditor from './pages/TagEditor';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminStore from './pages/admin/AdminStore';
import ManageBlog from './pages/admin/ManageBlog';
import CreateBlogPost from './pages/admin/CreateBlogPost';
import BlogSettings from './pages/admin/BlogSettings';
import BlogAnalytics from './pages/admin/BlogAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupport from './pages/admin/AdminSupport';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminBatchTags from './pages/admin/AdminBatchTags';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminBroadcasts from './pages/admin/AdminBroadcasts';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useLandingPage2, setUseLandingPage2] = useState(() => {
    const cached = localStorage.getItem('use_landing_page_2');
    return cached !== null ? cached === 'true' : true;
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
      } catch (err) {
        console.error("Error initializing session:", err);
      } finally {
        setLoading(false);
      }

      // Fetch site settings non-blockingly so app opens instantly without blocking the initial render
      try {
        const { data: settings } = await supabase.from('site_settings').select('key, value').eq('key', 'use_landing_page_2');
        if (settings && settings.length > 0) {
          const val = settings[0].value === 'true';
          setUseLandingPage2(val);
          localStorage.setItem('use_landing_page_2', String(val));
        }
      } catch (err) {
        console.error("Error fetching site settings:", err);
      }
    };
    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // Automatically redirect to update password page if recovering password
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/update-password';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#f4f7fb] via-[#edf2f8] to-[#f8fbff] font-sans z-50">
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#002b80] to-[#38b6ff] flex items-center justify-center text-white shadow-xl shadow-[#002b80]/20 animate-pulse">
            <QrCode className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-[#38b6ff]/20 blur-xl animate-pulse" />
        </div>
        <div className="font-black text-2xl tracking-tight text-[#002b80] mb-2">
          Get<span className="text-[#38b6ff]">UR</span>QR
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <div className="w-2 h-2 rounded-full bg-[#38b6ff] animate-ping" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Main App Layout ─────────────── */}
        <Route path="/" element={<Layout />}>
          <Route index element={!session ? (useLandingPage2 ? <LandingPage2 /> : <LandingPage />) : <Navigate to="/dashboard" replace />} />
          <Route path="login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="signup" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />

          {/* Public Routes */}
          <Route path="reset-password" element={!session ? <ResetPassword /> : <Navigate to="/dashboard" replace />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="tag/:id" element={<TagView />} />
          <Route path="store" element={<Store />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Blog />} />

          {/* Protected Routes */}
          <Route path="dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="profile" element={session ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="checkout/:id" element={session ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="tag/edit/:id" element={session ? <TagEditor /> : <Navigate to="/login" replace />} />
        </Route>

        {/* ── Admin Panel ─────────────────── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="store" element={<AdminStore />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="blog/create" element={<CreateBlogPost />} />
          <Route path="blog/edit/:id" element={<CreateBlogPost />} />
          <Route path="blog/settings" element={<BlogSettings />} />
          <Route path="blog/analytics" element={<BlogAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="batch-tags" element={<AdminBatchTags />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="broadcasts" element={<AdminBroadcasts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
