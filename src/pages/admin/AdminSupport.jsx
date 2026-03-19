import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LifeBuoy, Filter, Search, CheckCircle2, Clock, MessageSquare, Mail, User, Bot, Phone } from 'lucide-react';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'open' | 'resolved' | 'info' | 'all'
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    
    // Ignore 42P01 error (table doesn't exist yet)
    const { data, error } = await query;
    if (error && error.code !== '42P01') {
      console.error('Error fetching tickets:', error);
    }
    
    setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const toggleStatus = async (ticket) => {
    const newStatus = ticket.status === 'open' ? 'resolved' : 'open';
    const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticket.id);
    if (!error) {
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === ticket.id) setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchEmail = t.user_email?.toLowerCase().includes(q);
      const matchIssue = t.issue_summary?.toLowerCase().includes(q);
      const matchName  = t.visitor_name?.toLowerCase().includes(q);
      const matchPhone = t.visitor_whatsapp?.toLowerCase().includes(q);
      if (!matchEmail && !matchIssue && !matchName && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      
      {/* Left List Pane */}
      <div className="w-1/3 min-w-[320px] bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
            <LifeBuoy className="text-violet-500" /> Support Tickets
          </h1>
          
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Search email or issue..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto gap-0.5">
            {['all', 'open', 'info', 'resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-1 capitalize text-xs font-bold py-1.5 rounded-md transition-all whitespace-nowrap px-2 ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {f === 'info' ? 'Chats' : f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500 font-bold text-sm">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <button key={ticket.id} onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTicket?.id === ticket.id ? 'bg-violet-50 border-violet-200 ring-1 ring-violet-500 border-transparent shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                    ticket.status === 'info' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status === 'info' ? 'CHAT' : ticket.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1">{ticket.issue_summary || 'Needs Assistance'}</h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {ticket.user_email || ticket.visitor_name || 'Anonymous Contact'}
                  {ticket.visitor_whatsapp && <span className="ml-2 text-slate-400">({ticket.visitor_whatsapp})</span>}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        {selectedTicket ? (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">{selectedTicket.issue_summary}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><User size={16} /> {selectedTicket.visitor_name || selectedTicket.user_email || 'Anonymous Contact'}</span>
                    {selectedTicket.user_email && <span className="flex items-center gap-1.5"><Mail size={16} /> {selectedTicket.user_email}</span>}
                    {selectedTicket.visitor_whatsapp && <span className="flex items-center gap-1.5"><Phone size={16} /> {selectedTicket.visitor_whatsapp}</span>}
                    <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => toggleStatus(selectedTicket)}
                   className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-xl transition-all ${selectedTicket.status === 'open' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                  {selectedTicket.status === 'open' ? <><CheckCircle2 size={16} /> Mark Resolved</> : 'Reopen Ticket'}
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <MessageSquare size={14} /> AI Chat Transcript
              </h3>
              
              <div className="space-y-6">
                {(Array.isArray(selectedTicket.transcript) ? selectedTicket.transcript : []).map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">{msg.role === 'user' ? 'User' : 'AI Assistant'}</span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-white border text-slate-800 rounded-tl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Footer Area */}
            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
               <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const msg = e.target.elements.replyMsg.value.trim();
                    if (!msg) return;

                    const btn = document.getElementById('replyBtn');
                    btn.disabled = true;
                    btn.innerHTML = 'Sending...';

                    try {
                      const { data, error } = await supabase.functions.invoke('reply-ticket', {
                        body: { ticket_id: selectedTicket.id, reply_message: msg }
                      });
                      
                      if (error) throw error;
                      if (data.error) throw new Error(data.error);

                      // Update local state with the new transcript
                      setSelectedTicket(prev => ({ ...prev, transcript: data.updatedTranscript }));
                      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, transcript: data.updatedTranscript } : t));
                      e.target.reset();
                    } catch (err) {
                      alert("Error sending reply: " + err.message);
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = 'Send Reply & Email User';
                    }
                  }}
                  className="flex flex-col gap-3"
               >
                 <textarea 
                   name="replyMsg"
                   rows="3"
                   placeholder={`Write a reply to ${selectedTicket.user_email}...`}
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none shadow-inner"
                 ></textarea>
                 <div className="flex items-center justify-between">
                   <p className="text-xs text-slate-400 font-medium font-mono flex items-center gap-1.5"><Mail size={12} /> Email will be sent via Resend API</p>
                   <button id="replyBtn" type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
                     Send Reply & Email User
                   </button>
                 </div>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-slate-500">Select a ticket to view the chat transcript</p>
            <p className="text-sm mt-1">Both Open and Resolved tickets will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
