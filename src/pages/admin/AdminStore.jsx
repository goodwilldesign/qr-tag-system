import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Search, Filter, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLOR = {
  pending:   'text-amber-700 bg-amber-100 border-amber-200',
  paid:      'text-emerald-700 bg-emerald-100 border-emerald-200',
  shipped:   'text-blue-700 bg-blue-100 border-blue-200',
  delivered: 'text-violet-700 bg-violet-100 border-violet-200',
  cancelled: 'text-red-700 bg-red-100 border-red-200',
};

export default function AdminStore() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('store_orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await supabase.from('store_orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag size={22} className="text-violet-500" /> Store Orders
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-all shadow-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, product, phone…"
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 shadow-sm" />
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5 flex-wrap shadow-sm">
          <Filter size={13} className="text-slate-400 mx-1" />
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${filter === s ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No orders match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Customer', 'Product', 'QR Tag', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-slate-900 font-semibold">{order.customer_name}</p>
                      <p className="text-slate-400 text-xs">{order.customer_phone}</p>
                      <p className="text-slate-300 text-[10px]">{order.pincode}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800">{order.product_name}</p>
                      <p className="text-slate-400 text-xs">qty: {order.quantity}{order.size ? ` · ${order.size}` : ''}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                      {order.linked_tag_id ? order.linked_tag_id.slice(0, 8) + '…' : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900 font-bold">₹{order.total_price?.toLocaleString('en-IN')}</p>
                      {order.payment_id && <p className="text-slate-400 text-[10px] font-mono">{order.payment_id.slice(0, 12)}…</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLOR[order.status] || 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <select value={order.status} disabled={updating === order.id}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-violet-400 disabled:opacity-50 shadow-sm">
                        {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
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
