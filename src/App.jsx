import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Layouts
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';

// Public/Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
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
import AdminBlog from './pages/admin/AdminBlog';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSupport from './pages/admin/AdminSupport';
import AdminTemplates from './pages/admin/AdminTemplates';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import AdminBroadcasts from './pages/admin/AdminBroadcasts';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="container mt-xl text-center">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Main App Layout ─────────────── */}
        <Route path="/" element={<Layout />}>
          <Route index element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="signup" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />

          {/* Public Routes */}
          <Route path="tag/:id" element={<TagView />} />
          <Route path="store" element={<Store />} />
          <Route path="blog" element={<Blog />} />

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
          <Route path="blog" element={<AdminBlog />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="broadcasts" element={<AdminBroadcasts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
