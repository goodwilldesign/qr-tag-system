import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Shield, ShieldOff, Tag, ShoppingBag, Mail, Ban, CheckCircle2, X, ChevronRight } from 'lucide-react';

const FILTER_TABS = ['All', 'Admins', 'Suspended'];

const TAG_TYPE_EMOJI = {
  dog: '🐶', kids: '👶', rental: '🔑', doorbell: '🔔', parking: '🚗',
  hotel: '🏨', electronics: '💻', business: '📇', plant: '🪴', keychain: '🔑',
};

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [updating, setUpdating]   = useState(null);
  const [drawerUser, setDrawerUser] = useState(null);
  const [drawerTags, setDrawerTags] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from('admin_users_view')
      .select('id, full_name, role, created_at, whatsapp_number, email, is_suspended')
      .order('created_at', { ascending: false });

    if (!profiles) { setLoading(false); return; }

    const ids = profiles.map(p => p.id);
    const [tagsRes, ordersRes] = await Promise.all([
      supabase.from('tags').select('user_id').in('user_id', ids),
      supabase.from('store_orders').select('user_id').in('user_id', ids),
    ]);

    const tagCounts = {};
    const orderCounts = {};
    (tagsRes.data || []).forEach(t => { tagCounts[t.user_id] = (tagCounts[t.user_id] || 0) + 1; });
    (ordersRes.data || []).forEach(o => { orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1; });

    setUsers(profiles.map(p => ({ ...p, tagCount: tagCounts[p.id] || 0, orderCount: orderCounts[p.id] || 0 })));
    setLoading(false);
  };

  const openDrawer = async (user) => {
    setDrawerUser(user);
    setDrawerLoading(true);
    const { data } = await supabase
      .from('tags')
      .select('id, title, type, is_lost, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setDrawerTags(data || []);
    setDrawerLoading(false);
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdating(user.id + '_role');
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    if (drawerUser?.id === user.id) setDrawerUser(prev => ({ ...prev, role: newRole }));
    setUpdating(null);
  };

  const toggleSuspend = async (user) => {
    const newVal = !user.is_suspended;
    setUpdating(user.id + '_suspend');
    await supabase.from('profiles').update({ is_suspended: newVal }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_suspended: newVal } : u));
    if (drawerUser?.id === user.id) setDrawerUser(prev => ({ ...prev, is_suspended: newVal }));
    setUpdating(null);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.whatsapp_number?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === 'All' ? true :
      activeTab === 'Admins' ? u.role === 'admin' :
      activeTab === 'Suspended' ? u.is_suspended : true;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-violet-500" /> User Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {FILTER_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {tab}
              {tab === 'Admins' && <span className="ml-1.5 text-xs text-violet-500">{users.filter(u => u.role === 'admin').length}</span>}
              {tab === 'Suspended' && <span className="ml-1.5 text-xs text-red-500">{users.filter(u => u.is_suspended).length}</span>}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['User', 'Status', 'Tags', 'Orders', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          user.is_suspended ? 'bg-red-100 text-red-500' : 'bg-violet-100 text-violet-700'
                        }`}>
                          {(user.full_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">{user.full_name || 'No name'}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <Mail size={10} className="text-slate-400" />{user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${user.role === 'admin' ? 'text-violet-700 bg-violet-100' : 'text-slate-500 bg-slate-100'}`}>
                          {user.role || 'user'}
                        </span>
                        {user.is_suspended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full w-fit text-red-600 bg-red-100">suspended</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDrawer(user)} className="flex items-center gap-1 text-violet-600 hover:text-violet-800 text-sm font-semibold transition-colors">
                        <Tag size={12} className="text-slate-400" /> {user.tagCount}
                        {user.tagCount > 0 && <ChevronRight size={11} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 text-sm">
                        <ShoppingBag size={12} className="text-slate-400" /> {user.orderCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRole(user)} disabled={updating === user.id + '_role'}
                          title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                            user.role === 'admin'
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                          }`}>
                          {user.role === 'admin' ? <><ShieldOff size={12} /> Remove</> : <><Shield size={12} /> Admin</>}
                        </button>
                        <button onClick={() => toggleSuspend(user)} disabled={updating === user.id + '_suspend'}
                          title={user.is_suspended ? 'Unsuspend' : 'Suspend'}
                          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                            user.is_suspended
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                          }`}>
                          {user.is_suspended ? <><CheckCircle2 size={12} /> Restore</> : <><Ban size={12} /> Suspend</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Drawer */}
      {drawerUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerUser(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  drawerUser.is_suspended ? 'bg-red-100 text-red-500' : 'bg-violet-100 text-violet-700'
                }`}>
                  {(drawerUser.full_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{drawerUser.full_name || 'No name'}</p>
                  <p className="text-xs text-slate-400">{drawerUser.email}</p>
                </div>
              </div>
              <button onClick={() => setDrawerUser(null)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${drawerUser.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                  {drawerUser.role || 'user'}
                </span>
                {drawerUser.is_suspended && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">⛔ Suspended</span>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-slate-400 text-xs font-bold uppercase">Joined</p>
                <p className="text-slate-800">{new Date(drawerUser.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-3">Tags ({drawerUser.tagCount})</p>
                {drawerLoading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
                ) : drawerTags.length === 0 ? (
                  <p className="text-slate-400 text-sm">No tags created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {drawerTags.map(tag => (
                      <div key={tag.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-lg">{TAG_TYPE_EMOJI[tag.type] || '🏷️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{tag.title || 'Untitled'}</p>
                          <p className="text-xs text-slate-400 capitalize">{tag.type}</p>
                        </div>
                        {tag.is_lost && <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Lost</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
