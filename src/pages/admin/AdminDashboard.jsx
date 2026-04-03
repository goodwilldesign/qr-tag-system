import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Tag, ShoppingBag, TrendingUp, Activity, Clock,
  QrCode, MessageSquare, Zap, BarChart2, Award
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    violet:  'bg-violet-50 border-violet-200 text-violet-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-600',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
    rose:    'bg-rose-50 border-rose-200 text-rose-600',
    fuchsia: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600',
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

const TAG_TYPE_COLORS = {
  dog:         { bar: 'bg-amber-400',   label: '🐶 Pet' },
  kids:        { bar: 'bg-pink-400',    label: '👶 Child' },
  rental:      { bar: 'bg-blue-400',    label: '🔑 Rental' },
  doorbell:    { bar: 'bg-violet-400',  label: '🔔 Doorbell' },
  parking:     { bar: 'bg-emerald-400', label: '🚗 Parking' },
  hotel:       { bar: 'bg-rose-400',    label: '🏨 Hotel' },
  electronics: { bar: 'bg-indigo-400',  label: '💻 Asset' },
  business:    { bar: 'bg-fuchsia-400', label: '📇 Digital Card' },
  plant:       { bar: 'bg-green-400',   label: '🪴 Plant' },
  keychain:    { bar: 'bg-slate-400',   label: '🔑 Keychain' },
};

export default function AdminDashboard() {
  const [stats, setStats]             = useState({ users: 0, tags: 0, orders: 0, revenue: 0, scans: 0, messages: 0, newUsersWeek: 0, newTagsToday: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [tagTypes, setTagTypes]       = useState([]);
  const [topTags, setTopTags]         = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);

      const [
        usersRes, tagsRes, ordersRes, scansRes, messagesRes,
        newUsersRes, newTagsRes, tagTypesRes, topTagsRes
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tags').select('id', { count: 'exact', head: true }),
        supabase.from('store_orders').select('id, total_price, status, product_name, customer_name, created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('tag_scans').select('id', { count: 'exact', head: true }),
        supabase.from('tag_messages').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', oneWeekAgo),
        supabase.from('tags').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('tags').select('type'),
        supabase.from('tag_scans').select('tag_id, tags(title, type)').limit(100),
      ]);

      // Tag type breakdown
      const typeCounts = {};
      (tagTypesRes.data || []).forEach(t => {
        typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
      });
      const totalTags = Object.values(typeCounts).reduce((a, b) => a + b, 0);
      const sortedTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({ type, count, pct: totalTags ? Math.round((count / totalTags) * 100) : 0 }));

      // Top scanned tags leaderboard
      const scanTagMap = {};
      (topTagsRes.data || []).forEach(s => {
        if (!s.tag_id) return;
        if (!scanTagMap[s.tag_id]) scanTagMap[s.tag_id] = { count: 0, title: s.tags?.title || 'Untitled', type: s.tags?.type };
        scanTagMap[s.tag_id].count++;
      });
      const topTagsList = Object.entries(scanTagMap)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([id, v]) => ({ id, ...v }));

      const orders = ordersRes.data || [];
      const revenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total_price || 0), 0);

      setStats({
        users: usersRes.count || 0,
        tags: tagsRes.count || 0,
        orders: orders.length,
        revenue,
        scans: scansRes.count || 0,
        messages: messagesRes.count || 0,
        newUsersWeek: newUsersRes.count || 0,
        newTagsToday: newTagsRes.count || 0,
      });
      setRecentOrders(orders);
      setTagTypes(sortedTypes);
      setTopTags(topTagsList);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Platform Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Live overview of your GetURQR platform.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"       value={stats.users}    icon={Users}         color="violet" sub={`+${stats.newUsersWeek} this week`} />
            <StatCard label="Total Tags"        value={stats.tags}     icon={Tag}           color="blue"   sub={`+${stats.newTagsToday} today`} />
            <StatCard label="Total QR Scans"    value={stats.scans}    icon={QrCode}        color="emerald" />
            <StatCard label="Messages Received" value={stats.messages} icon={MessageSquare} color="fuchsia" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Store Orders" value={stats.orders}   icon={ShoppingBag} color="amber" />
            <StatCard label="Revenue"      value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={TrendingUp} color="rose" sub="Paid orders only" />
            <StatCard label="New Users"    value={stats.newUsersWeek}  icon={Zap}   color="violet" sub="Last 7 days" />
            <StatCard label="Tags Today"   value={stats.newTagsToday}  icon={Activity} color="blue" sub="Created today" />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag Type Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart2 size={16} className="text-violet-500" />
            <h2 className="font-bold text-slate-900 text-sm">Tag Type Breakdown</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : tagTypes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No tags yet.</div>
          ) : (
            <div className="p-5 space-y-3">
              {tagTypes.map(({ type, count, pct }) => {
                const meta = TAG_TYPE_COLORS[type] || { bar: 'bg-slate-300', label: type };
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-700 font-medium">{meta.label}</span>
                      <span className="text-xs text-slate-400 font-mono">{count} tag{count !== 1 ? 's' : ''} · {pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-2.5 rounded-full ${meta.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 Most Scanned Tags */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <h2 className="font-bold text-slate-900 text-sm">Top 5 Most Scanned Tags</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : topTags.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No scan data yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topTags.map((tag, i) => {
                const meta = TAG_TYPE_COLORS[tag.type] || { label: tag.type };
                return (
                  <div key={tag.id} className="px-5 py-3 flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{tag.title}</p>
                      <p className="text-xs text-slate-400">{meta.label}</p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 font-bold text-sm shrink-0">
                      <QrCode size={13} className="text-slate-400" /> {tag.count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
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
