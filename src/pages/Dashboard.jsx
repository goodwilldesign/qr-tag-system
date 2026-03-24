import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Tag, CarFront, Hotel, Bell, Baby, KeySquare, Trash2, Download, Package, QrCode, Pencil, Eye, MapPin, AlertTriangle, CheckCircle2, Activity, Clock, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import TagPrintModal from '../components/TagPrintModal';

const TAG_TYPES = [
  { id: 'dog',      label: 'Pet Tag',   icon: <Tag size={18} /> },
  { id: 'kids',     label: 'Kid Tag',   icon: <Baby size={18} /> },
  { id: 'rental',   label: 'Rental',    icon: <KeySquare size={18} /> },
  { id: 'doorbell', label: 'Doorbell',  icon: <Bell size={18} /> },
  { id: 'parking',  label: 'Parking',   icon: <CarFront size={18} /> },
  { id: 'hotel',    label: 'Hotel',     icon: <Hotel size={18} /> },
  { id: 'electronics', label: 'Gadget',  icon: <Smartphone size={18} /> },
];

const TYPE_COLORS = {
  dog:      'bg-amber-50 text-amber-700 border-amber-200',
  kids:     'bg-pink-50 text-pink-700 border-pink-200',
  rental:   'bg-blue-50 text-blue-700 border-blue-200',
  doorbell: 'bg-violet-50 text-violet-700 border-violet-200',
  parking:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  hotel:    'bg-rose-50 text-rose-700 border-rose-200',
  electronics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchTags(session.user.id);
    });
  }, []);

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

      // Group scans by tag
      const enrichedTags = tagsData.map(tag => {
        const myScans = (scansData || []).filter(s => s.tag_id === tag.id);
        const latestLoc = myScans.find(s => s.latitude && s.longitude);
        return {
          ...tag,
          scanCount: myScans.length,
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
    } else {
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
      const isAvailable = tag.data?.rental_status === 'Available';
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
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-5 py-2.5 shadow-sm shrink-0">
          <Plus size={18} /> Create New Tag
        </button>
      </div>

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
      <div className="grid sm:grid-cols-3 gap-6">
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

                        {/* Row 1: Info + Actions */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          {/* Tag Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-base ${colorClass}`}>
                              {typeInfo.icon}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5 text-sm">
                                  {tag.title}
                                {tag.type === 'doorbell' && tag.data?.dnd_mode && <span className="text-[9px] font-black uppercase tracking-wider text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-md">DND</span>}
                                {tag.type === 'rental' && <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${tag.data?.rental_status === 'Available' ? 'text-emerald-600 bg-emerald-100' : 'text-red-600 bg-red-100'}`}>{tag.data?.rental_status || 'Booked'}</span>}
                              </h3>
                              <p className="text-xs text-slate-400 uppercase tracking-widest">{typeInfo.label}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Scans count */}
                            <div className="text-center w-10 mr-1 pr-2 border-r border-slate-200 cursor-help" title="Total Scans">
                              <p className="text-sm font-bold text-slate-700 leading-none">{tag.scanCount || 0}</p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase">Scans</p>
                            </div>
                            {/* Desktop toggle in action bar */}
                            {toggleCfg && <div className="hidden sm:flex items-center gap-2 mr-1 border-r border-slate-200 pr-2">
                               <div className="flex flex-col items-end">
                                  <span className={`text-[9px] font-bold uppercase leading-none mb-0.5 ${toggleCfg.active ? 'text-slate-700' : 'text-slate-400'}`}>{toggleCfg.label}</span>
                                  <button onClick={() => handleTagToggle(tag)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${toggleCfg.active ? toggleCfg.activeColor : toggleCfg.inactiveColor}`}>
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${toggleCfg.active ? 'translate-x-4' : 'translate-x-1'}`} />
                                  </button>
                               </div>
                             </div>}
                            <button 
                              onClick={() => handleToggleLost(tag)}
                              className={`p-2 rounded-lg transition-colors ${tag.is_lost ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                              title={tag.is_lost ? 'Deactivate Lost Mode' : 'Activate Lost Mode'}
                            >
                              <AlertTriangle size={15} fill={tag.is_lost ? 'currentColor' : 'none'} />
                            </button>
                            <Link to={`/tag/edit/${tag.id}`} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit"><Pencil size={15} /></Link>
                            <a href={tagUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={15} /></a>
                            <button onClick={() => handleDownload(tag)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Print & Download"><Download size={15} /></button>
                            <button onClick={() => setDeleteTarget({ id: tag.id, title: tag.title })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
                          </div>
                        </div>

                        {/* Row 2 (mobile only): Toggle switch */}
                        {toggleCfg && (
                          <div className="sm:hidden flex items-center justify-between px-1 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-500 font-medium">{toggleCfg.label === toggleCfg.label && `Status: `}<strong className="text-slate-700">{toggleCfg.label}</strong></span>
                            <button onClick={() => handleTagToggle(tag)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toggleCfg.active ? toggleCfg.activeColor : toggleCfg.inactiveColor}`}>
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${toggleCfg.active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        )}

                        {/* Hidden QR for download */}
                        <div className="absolute -top-[9999px] left-0 pointer-events-none" aria-hidden="true">
                          <QRCodeSVG id={`qr-${tag.id}`} value={tagUrl} size={512} />
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
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
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
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
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
        </div>
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
