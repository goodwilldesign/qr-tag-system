import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Tag, ShoppingBag, TrendingUp, Activity, Clock } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
  };
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${colors[color]}`}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-current/10">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-slate-900 text-3xl font-black mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  pending:   'text-amber-700 bg-amber-100',
  paid:      'text-emerald-700 bg-emerald-100',
  shipped:   'text-blue-700 bg-blue-100',
  delivered: 'text-violet-700 bg-violet-100',
  cancelled: 'text-red-700 bg-red-100',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tags: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, tagsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tags').select('id', { count: 'exact', head: true }),
        supabase.from('store_orders').select('id, total_price, status, product_name, customer_name, created_at').order('created_at', { ascending: false }).limit(8),
      ]);
      const orders = ordersRes.data || [];
      const revenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total_price || 0), 0);
      setStats({ users: usersRes.count || 0, tags: tagsRes.count || 0, orders: orders.length, revenue });
      setRecentOrders(orders);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Welcome back! Here's your site overview.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.users} icon={Users} color="violet" />
          <StatCard label="Total Tags" value={stats.tags} icon={Tag} color="blue" />
          <StatCard label="Store Orders" value={stats.orders} icon={ShoppingBag} color="amber" />
          <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={TrendingUp} color="emerald" sub="Paid orders only" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Activity size={16} className="text-violet-500" />
          <h2 className="font-bold text-slate-900 text-sm">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No orders yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm font-semibold truncate">{order.product_name}</p>
                  <p className="text-slate-400 text-xs">{order.customer_name}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] || 'text-slate-500 bg-slate-100'}`}>
                  {order.status}
                </span>
                <div className="text-right shrink-0">
                  <p className="text-slate-900 text-sm font-bold">₹{order.total_price?.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] justify-end">
                    <Clock size={9} />{new Date(order.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
