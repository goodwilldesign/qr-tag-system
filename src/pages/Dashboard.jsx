import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Tag, CarFront, Hotel, Bell, Baby, KeySquare, Trash2, Download, Package, QrCode, Pencil, Eye, MapPin, AlertTriangle, CheckCircle2, Activity, Clock, Smartphone, MessageSquare, X, Briefcase, Leaf, Wallet, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TagPrintModal from '../components/TagPrintModal';

const TAG_TYPES = [
  { id: 'dog',      label: 'Pet Tag',   icon: <Tag size={18} /> },
  { id: 'kids',     label: 'Kid Tag',   icon: <Baby size={18} /> },
  { id: 'rental',   label: 'Rental',    icon: <KeySquare size={18} /> },
  { id: 'doorbell', label: 'Doorbell',  icon: <Bell size={18} /> },
  { id: 'parking',  label: 'Parking',   icon: <CarFront size={18} /> },
  { id: 'hotel',    label: 'Hotel',     icon: <Hotel size={18} /> },
  { id: 'electronics', label: 'Asset',  icon: <Smartphone size={18} /> },
  { id: 'business',    label: 'Digital Card', icon: <Briefcase size={18} /> },
  { id: 'plant',       label: 'Plant Care',   icon: <Leaf size={18} /> },
  { id: 'keychain',    label: 'Keychain',     icon: <Wallet size={18} /> },
];

const TYPE_COLORS = {
  dog:      'bg-amber-50 text-amber-700 border-amber-200',
  kids:     'bg-pink-50 text-pink-700 border-pink-200',
  rental:   'bg-blue-50 text-blue-700 border-blue-200',
  doorbell: 'bg-violet-50 text-violet-700 border-violet-200',
  parking:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  hotel:    'bg-rose-50 text-rose-700 border-rose-200',
  electronics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  business:    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  plant:       'bg-green-50 text-green-700 border-green-200',
  keychain:    'bg-slate-100 text-slate-700 border-slate-300',
};

export default function Dashboard() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTagType, setNewTagType] = useState('dog');
  const [newTagTitle, setNewTagTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [printTag, setPrintTag] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  
  // Messages Modal state
  const [messagesTarget, setMessagesTarget] = useState(null);
  const [tagMessages, setTagMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  // Analytics Modal state  
  const [statsTarget, setStatsTarget] = useState(null);
  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lostAlertSent, setLostAlertSent] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTags(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (messagesTarget) {
      setLoadingMessages(true);
      supabase.from('tag_messages').select('*').eq('tag_id', messagesTarget.id).order('created_at', { ascending: false })
        .then(({ data }) => {
          setTagMessages(data || []);
          const unreadIds = (data || []).filter(m => !m.is_read).map(m => m.id);
          if (unreadIds.length > 0) {
            supabase.from('tag_messages').update({ is_read: true }).in('id', unreadIds).then(() => {
               setTags(prev => prev.map(t => t.id === messagesTarget.id ? { ...t, unreadCount: 0 } : t));
            });
          }
          setLoadingMessages(false);
        });
    } else {
      setTagMessages([]);
    }
  }, [messagesTarget]);

  const fetchTags = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Fetch tags
      const { data: tagsData, error: tagsErr } = await supabase
        .from('tags').select('*').eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (tagsErr) throw tagsErr;

      if (!tagsData || tagsData.length === 0) {
        setTags([]);
        return;
      }

      // 2. Fetch scan counts and locations
      const tagIds = tagsData.map(t => t.id);
      const { data: scansData, error: scansErr } = await supabase
        .from('tag_scans').select('tag_id, latitude, longitude, scanned_at')
        .in('tag_id', tagIds)
        .order('scanned_at', { ascending: false });

      if (scansErr) throw scansErr;

      // 3. Fetch messages
      const { data: msgsData } = await supabase
        .from('tag_messages').select('tag_id, is_read')
        .in('tag_id', tagIds);

      // Group scans & messages by tag
      const enrichedTags = tagsData.map(tag => {
        const myScans = (scansData || []).filter(s => s.tag_id === tag.id);
        const myMsgs = (msgsData || []).filter(m => m.tag_id === tag.id && !m.is_read);
        const latestLoc = myScans.find(s => s.latitude && s.longitude);
        return {
          ...tag,
          scanCount: myScans.length,
          unreadCount: myMsgs.length,
          lastLocation: latestLoc ? { lat: latestLoc.latitude, lng: latestLoc.longitude, time: latestLoc.scanned_at } : null
        };
      });

      setTags(enrichedTags);
      
      // Enrich scans for the recent feed
      const enrichedScans = (scansData || []).map(scan => {
        const tag = tagsData.find(t => t.id === scan.tag_id);
        return {
          ...scan,
          tagTitle: tag ? tag.title : 'Deleted Tag',
          tagType: tag ? tag.type : 'unknown'
        };
      });
      setRecentScans(enrichedScans.slice(0, 5)); // Keep last 5 scans for the UI

    } catch (err) {
      console.error('Error fetching tags:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagTitle.trim()) return;
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('tags')
        .insert([{ user_id: session.user.id, title: newTagTitle, type: newTagType, data: {} }])
        .select();
      if (error) throw error;
      setTags([data[0], ...tags]);
      setIsModalOpen(false);
      setNewTagTitle('');
    } catch (err) {
      console.error('Error creating tag:', err.message);
      alert('Error creating tag. Ensure the Supabase setup SQL has been run.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError('');
    const { error } = await supabase.from('tags').delete().eq('id', deleteTarget.id);
    if (error) {
      console.error('Delete error:', error);
      setDeleteError(`Could not delete tag: ${error.message}`);
    } else {
      setTags(prev => prev.filter(t => t.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleToggleLost = async (tag) => {
    const newStatus = !tag.is_lost;
    const { error } = await supabase.from('tags').update({ is_lost: newStatus }).eq('id', tag.id);
    if (!error) {
      setTags(prev => prev.map(t => t.id === tag.id ? { ...t, is_lost: newStatus } : t));
      // If activating lost mode & emergency contacts exist → call edge function
      if (newStatus && tag.emergency_contacts?.length > 0) {
        try {
          const { data: { session: s } } = await supabase.auth.getSession();
          const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lost-mode-alert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s?.access_token}` },
            body: JSON.stringify({ tag_id: tag.id }),
          });
          if (res.ok) {
            setLostAlertSent(tag.id);
            setTimeout(() => setLostAlertSent(null), 5000);
          }
        } catch (_) { /* silent */ }
      }
    } else if (error) {
      alert("Failed to update Lost Mode. Make sure you ran the SQL migration.");
    }
  };

  // Per-type secondary toggle stored in data JSON (no migration needed)
  const getTagToggleConfig = (tag) => {
    if (tag.type === 'hotel' || tag.type === 'parking') return null;
    if (tag.type === 'doorbell') {
      const isDnd = tag.data?.dnd_mode === true;
      return { label: isDnd ? 'Do Not Disturb' : 'Available', active: isDnd, activeColor: 'bg-violet-500', inactiveColor: 'bg-slate-300' };
    }
    if (tag.type === 'rental') {
      const status = tag.data?.rental_status || 'Available';
      const isAvailable = status === 'Available';
      return { label: isAvailable ? 'Available' : 'Booked', active: isAvailable, activeColor: 'bg-emerald-500', inactiveColor: 'bg-red-400' };
    }
    return null;
  };

  const handleTagToggle = async (tag) => {
    const cfg = getTagToggleConfig(tag);
    if (!cfg) return;
    
    let updatedData = { ...tag.data };
    if (tag.type === 'doorbell') {
      updatedData.dnd_mode = !cfg.active;
    } else if (tag.type === 'rental') {
      updatedData.rental_status = cfg.active ? 'Booked' : 'Available';
    }
    const { error } = await supabase.from('tags').update({ data: updatedData }).eq('id', tag.id);
    if (!error) {
      setTags(prev => prev.map(t => t.id === tag.id ? { ...t, data: updatedData } : t));
    }
  };

  const handleDownload = (tag) => {
    setPrintTag(tag);
  };

  const getTagUrl = (id) => `${window.location.origin}/tag/${id}`;

  const openStats = async (tag) => {
    setStatsTarget(tag);
    setStatsLoading(true);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('tag_scans')
      .select('scanned_at, latitude, longitude')
      .eq('tag_id', tag.id)
      .gte('scanned_at', thirtyDaysAgo)
      .order('scanned_at', { ascending: false });
    setStatsData(data || []);
    setStatsLoading(false);
  };

  const totalTags = tags.length;
  const activeTags = tags.filter(t => t.is_active !== false).length;
  const totalScans = tags.reduce((sum, t) => sum + (t.scanCount || 0), 0);

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your active QR tags and view scan activity.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="hidden sm:flex btn btn-primary px-5 py-2.5 shadow-sm shrink-0">
          <Plus size={18} /> Create New Tag
        </button>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button onClick={() => setIsModalOpen(true)} className="fab" aria-label="Create New Tag">
        <Plus size={28} />
      </button>

      {/* Delete Error Banner */}
      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-1">Delete Failed</p>
            <p>{deleteError}</p>
            <p className="mt-2 text-xs text-red-500">Run the SQL fix in Supabase SQL Editor — see instructions below.</p>
          </div>
          <button onClick={() => setDeleteError('')} className="ml-auto text-red-400 hover:text-red-600 shrink-0 text-lg leading-none">✕</button>
        </div>
      )}

      {/* Summary Metrics Row */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{totalTags}</p>
            <p className="text-sm text-slate-500">Tags registered</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <QrCode size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{activeTags}</p>
            <p className="text-sm text-slate-500">Active QR codes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{totalScans}</p>
            <p className="text-sm text-slate-500">Total scans</p>
          </div>
        </div>
      </div>

      {/* Main Content Split View */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading your tags…</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: MY TAGS LIST */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">My Tags</h2>
            </div>
            
            <div className="p-4 flex-1">
              {tags.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-500">
                    <QrCode size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Tags Yet</h3>
                  <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">
                    Add your first tag to generate a QR code.
                  </p>
                  <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-6 py-2">
                    <Plus size={16} /> Add Your First Tag
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {tags.map((tag) => {
                    const typeInfo = TAG_TYPES.find(t => t.id === tag.type) || TAG_TYPES[0];
                    const tagUrl = getTagUrl(tag.id);
                    const colorClass = TYPE_COLORS[tag.type] || 'bg-slate-100 text-slate-700 border-slate-200';
                    const toggleCfg = getTagToggleConfig(tag);

                    return (
                      <div key={tag.id} className={`relative flex flex-col gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${
                        (tag.type === 'doorbell' && tag.data?.dnd_mode) ? 'border-violet-200 bg-violet-50/30' :
                        (tag.type === 'rental' && tag.data?.rental_status === 'Available') ? 'border-emerald-200 bg-emerald-50/30' :
                        'border-slate-100 bg-white hover:border-slate-200'}`}>

                        {/* Row 1: Info + Lost Mode Toggle (Mobile) / Scans (Desktop) */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          {/* Left: Icon + Text */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-base ${colorClass}`}>
                              {typeInfo.icon}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5 text-sm">
                                {tag.title}
                              </h3>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">{typeInfo.label}</p>
                            </div>
                          </div>

                          {/* Right: Lost Mode Toggle (Mobile) / Scans (Desktop) */}
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-center pr-4 border-r border-slate-200">
                               <p className="text-sm font-bold text-slate-700 leading-none">{tag.scanCount || 0}</p>
                               <p className="text-[9px] text-slate-400 font-semibold uppercase">Scans</p>
                            </div>

                            {/* Mobile Toggle / Action Group */}
                            <div className="flex items-center gap-2">
                              {tag.type !== 'rental' && (
                                <div className="flex flex-col items-end">
                                  <button onClick={() => handleToggleLost(tag)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${tag.is_lost ? 'bg-red-500' : 'bg-slate-300'}`}>
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${tag.is_lost ? 'translate-x-[1.1rem]' : 'translate-x-1'}`} />
                                  </button>
                                  <span className={`text-[8px] font-black uppercase mt-0.5 ${tag.is_lost ? 'text-red-600' : 'text-slate-400'}`}>
                                    {tag.is_lost ? 'Lost' : 'Safe'}
                                  </span>
                                </div>
                              )}
                              
                              {toggleCfg && (
                                <div className="flex flex-col items-end">
                                  <button onClick={() => handleTagToggle(tag)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${toggleCfg.active ? toggleCfg.activeColor : toggleCfg.inactiveColor}`}>
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${toggleCfg.active ? 'translate-x-[1.1rem]' : 'translate-x-1'}`} />
                                  </button>
                                  <span className={`text-[8px] font-black uppercase mt-0.5 ${toggleCfg.active ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {toggleCfg.label}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Action Buttons (Mobile: Horizontal Bar) */}
                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-1" >
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-2">
                               {tag.scanCount || 0} Scans
                             </p>
                             {tag.expires_at && (() => {
                               const expired = new Date(tag.expires_at) < new Date();
                               return (
                                 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${expired ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                   {expired ? '🔴 Expired' : `⏳ ${new Date(tag.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                 </span>
                               );
                             })()}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => openStats(tag)} title="View Analytics" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><BarChart2 size={16} /></button>
                            <button onClick={() => setMessagesTarget(tag)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors relative">
                              <MessageSquare size={16} />
                              {tag.unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                            </button>
                            <Link to={`/tag/edit/${tag.id}`} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"><Pencil size={16} /></Link>
                            <a href={tagUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></a>
                            <button onClick={() => handleDownload(tag)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={16} /></button>
                            <button onClick={() => setDeleteTarget({ id: tag.id, title: tag.title })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {/* Hidden QR for download — now with custom colors */}
                        <div className="absolute -top-[9999px] left-0 pointer-events-none" aria-hidden="true">
                          <QRCodeSVG
                            id={`qr-${tag.id}`}
                            value={tagUrl}
                            size={512}
                            fgColor={tag.qr_color || '#000000'}
                            bgColor={tag.qr_bg_color || '#ffffff'}
                            imageSettings={tag.qr_logo_url ? { src: tag.qr_logo_url, height: 80, width: 80, excavate: true } : undefined}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RECENT SCANS */}
          <div className="lg:w-80 xl:w-96 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full lg:sticky lg:top-8">
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-slate-900">Recent Scans</h2>
            </div>
            
            <div className="flex-1 bg-white">
              {recentScans.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Activity size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">No scans yet</h3>
                  <p className="text-xs text-slate-500">Scans will appear here when someone scans a QR code.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentScans.map((scan, idx) => (
                    <div key={scan.id || idx} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{scan.tagTitle}</p>
                        <p className="text-xs text-slate-400 mt-1 placeholder-slate-400">
                          {scan.latitude ? "Location captured" : "Location not captured"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        {timeAgo(scan.scanned_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Tag?</h2>
            <p className="text-slate-500 text-sm text-center mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary flex-1 py-2.5">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Messages Modal */}
      {messagesTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 border-none leading-none">Messages</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{messagesTarget.title}</p>
                </div>
              </div>
              <button onClick={() => setMessagesTarget(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white min-h-[300px]">
              {loadingMessages ? (
                <div className="text-center py-10 text-slate-400 font-medium">Loading messages...</div>
              ) : tagMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1">No messages yet</h3>
                  <p className="text-slate-500 text-sm">When someone leaves a message for this tag, you'll see it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tagMessages.map(msg => (
                    <div key={msg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      {!msg.is_read && <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">New</div>}
                      <p className="font-bold text-slate-900 mb-0.5">{msg.sender_name}</p>
                      {msg.sender_contact && <p className="text-xs text-blue-600 font-medium mb-3">{msg.sender_contact}</p>}
                      <div className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 border border-slate-100 rounded-lg">{msg.message}</div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-3">{timeAgo(msg.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Modal */}

      {/* Lost Mode Alert Toast */}
      {lostAlertSent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-fade-in">
          🚨 Emergency alert sent to your contacts!
        </div>
      )}

      {/* Analytics Modal */}
      {statsTarget && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 leading-none">Tag Analytics</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{statsTarget.title}</p>
                </div>
              </div>
              <button onClick={() => { setStatsTarget(null); setStatsData([]); }} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {statsLoading ? (
                <div className="text-center py-10 text-slate-400">Loading analytics…</div>
              ) : (
                <>
                  {/* Total scans + since */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                      <p className="text-4xl font-black text-blue-700">{statsTarget.scanCount || 0}</p>
                      <p className="text-xs font-bold text-blue-500 uppercase mt-1">Total Scans (All Time)</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-4xl font-black text-slate-700">{statsData.length}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1">Last 30 Days</p>
                    </div>
                  </div>

                  {/* 30-day bar chart */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Scans — Last 30 Days</h3>
                    {(() => {
                      const days = Array.from({ length: 30 }, (_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0,0,0,0);
                        return { date: d, label: d.getDate(), count: 0 };
                      });
                      statsData.forEach(s => {
                        const d = new Date(s.scanned_at); d.setHours(0,0,0,0);
                        const idx = days.findIndex(day => day.date.toDateString() === d.toDateString());
                        if (idx >= 0) days[idx].count++;
                      });
                      const maxCount = Math.max(...days.map(d => d.count), 1);
                      return (
                        <div className="flex items-end gap-0.5 h-24 w-full">
                          {days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                              <div
                                className="w-full rounded-t-sm bg-blue-200 group-hover:bg-blue-500 transition-colors cursor-default"
                                style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '4px' : '1px' }}
                              />
                              {day.count > 0 && (
                                <span className="absolute -top-5 text-[9px] font-bold text-blue-600 hidden group-hover:block bg-white px-1 rounded shadow">{day.count}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>30 days ago</span><span>Today</span>
                    </div>
                  </div>

                  {/* Scan locations */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Scan Locations</h3>
                    {statsData.filter(s => s.latitude).length === 0 ? (
                      <p className="text-slate-400 text-sm">No location data captured yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {statsData.filter(s => s.latitude).map((s, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                            <MapPin size={14} className="text-red-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-700 text-xs font-mono">{Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}</p>
                            </div>
                            <p className="text-[10px] text-slate-400 shrink-0">{new Date(s.scanned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}


      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Create New Tag</h2>

            <form onSubmit={handleCreateTag}>
              <div className="form-group mb-5">
                <label className="form-label">Tag Name / Title</label>
                <input type="text" className="form-input" value={newTagTitle}
                  onChange={(e) => setNewTagTitle(e.target.value)}
                  placeholder="e.g. Max's Collar, Room 201" required autoFocus />
              </div>

              <div className="form-group mb-7">
                <label className="form-label mb-2 block">Tag Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TAG_TYPES.map((type) => (
                    <button key={type.id} type="button" onClick={() => setNewTagType(type.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all text-left font-medium ${
                        newTagType === type.id
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}>
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-5 py-2.5">Cancel</button>
                <button type="submit" className="btn btn-primary px-5 py-2.5" disabled={isCreating}>
                  {isCreating ? 'Creating…' : '✓ Generate Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* NEW PRINT MODAL */}
      {printTag && (
        <TagPrintModal
          tag={printTag}
          onClose={() => setPrintTag(null)}
        />
      )}
    </div>
  );
}
