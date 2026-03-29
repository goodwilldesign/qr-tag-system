import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Shield, ShieldOff, Tag, ShoppingBag, Mail } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: profiles } = await supabase
        .from('admin_users_view')
        .select('id, full_name, role, created_at, whatsapp_number, email')
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
    fetchUsers();
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdating(user.id);
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    setUpdating(null);
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.whatsapp_number?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users size={22} className="text-violet-500" /> User Management
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">{users.length} registered users</p>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 shadow-sm" />
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
                  {['User', 'Role', 'Tags', 'Orders', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {(user.full_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">{user.full_name || 'No name'}</p>
                          <p className="text-slate-500 text-xs flex items-center gap-1">
                            <Mail size={10} className="text-slate-400" />{user.email}
                          </p>
                          <p className="text-slate-400 text-xs">{user.whatsapp_number || 'No WhatsApp added'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'text-violet-700 bg-violet-100' : 'text-slate-500 bg-slate-100'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-600 text-sm">
                        <Tag size={12} className="text-slate-400" /> {user.tagCount}
                      </div>
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
                      <button onClick={() => toggleRole(user)} disabled={updating === user.id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                          user.role === 'admin'
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                        }`}>
                        {user.role === 'admin' ? <><ShieldOff size={12} /> Remove Admin</> : <><Shield size={12} /> Make Admin</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
