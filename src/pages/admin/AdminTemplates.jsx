import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Save, Image as ImageIcon, Settings, X, Tag, QrCode } from 'lucide-react';

const TAG_TYPES = [
  { id: 'all',      label: 'All Types (Default)' },
  { id: 'dog',      label: 'Pet Tag' },
  { id: 'kids',     label: 'Child Tag' },
  { id: 'rental',   label: 'Rental' },
  { id: 'doorbell', label: 'Doorbell' },
  { id: 'parking',  label: 'Parking' },
  { id: 'hotel',    label: 'Hotel' },
];

export default function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    id: null,
    name: '',
    type: 'all',
    bg_url: '',
    qr_x: 50,
    qr_y: 50,
    qr_size: 20
  });

  const previewRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('print_templates').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('print-templates')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('print-templates')
        .getPublicUrl(fileName);

      setForm(prev => ({ ...prev, bg_url: publicUrl }));
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.bg_url) return alert('Name and Background Image are required.');

    setSaving(true);
    try {
      if (form.id) {
        const { error } = await supabase.from('print_templates').update(form).eq('id', form.id);
        if (error) throw error;
      } else {
        const { id, ...insertData } = form;
        const { error } = await supabase.from('print_templates').insert([insertData]);
        if (error) throw error;
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase.from('print_templates').delete().eq('id', id);
      if (error) throw error;
      fetchTemplates();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const openModal = (t = null) => {
    if (t) {
      setForm(t);
    } else {
      setForm({ id: null, name: '', type: 'all', bg_url: '', qr_x: 50, qr_y: 50, qr_size: 20 });
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold border-b border-rose-200 pb-2 inline-block">Print Templates</h2>
          <p className="text-sm text-slate-500 mt-2">Manage dynamic, downloadable designs for users to print.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus size={16} /> New Template
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>)}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Templates Found</h3>
          <p className="text-slate-500 text-sm mb-4">Upload a custom design to get started.</p>
          <button onClick={() => openModal()} className="btn btn-primary px-4 py-2 text-sm">Create Template</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="relative aspect-auto h-48 bg-slate-100 overflow-hidden border-b border-slate-200">
                <img src={t.bg_url} alt={t.name} className="w-full h-full object-contain" />
                <div 
                  className="absolute bg-black/80 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded shadow-2xl"
                  style={{
                    left: `${t.qr_x}%`, top: `${t.qr_y}%`, width: `${t.qr_size}%`, aspectRatio: '1/1'
                  }}
                >
                  <QrCode size={24} className="text-white opacity-50" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 truncate pr-4">{t.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{t.type}</span>
                </div>
                
                <div className="mt-auto pt-4 flex gap-2">
                  <button onClick={() => openModal(t)} className="flex-1 btn btn-secondary py-1.5 text-xs inline-flex items-center gap-1 justify-center">
                    <Settings size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="btn hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 py-1.5 px-3 rounded-xl transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">{form.id ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"><X size={18} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Side */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Template Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-rose-400 text-sm" placeholder="e.g. Standard Parking Tag" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tag Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-rose-400 text-sm bg-white">
                    {TAG_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                    <span>Background Image</span>
                  </label>
                  <div className="flex gap-2">
                    <label className={`flex-1 border-2 border-dashed rounded-xl px-4 py-2 cursor-pointer flex justify-center items-center gap-2 text-sm font-semibold transition-colors ${uploading ? 'bg-slate-50 text-slate-400 border-slate-200' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}>
                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </label>
                    <input type="text" value={form.bg_url} onChange={e => setForm({...form, bg_url: e.target.value})} placeholder="Or Paste URL" className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-900 text-sm mb-4">QR Code Positioning</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-slate-600"><span>X Position (Horizontal)</span> <span className="font-mono">{form.qr_x}%</span></div>
                      <input type="range" min="0" max="100" step="0.5" value={form.qr_x} onChange={e => setForm({...form, qr_x: parseFloat(e.target.value)})} className="w-full accent-rose-500" />
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-slate-600"><span>Y Position (Vertical)</span> <span className="font-mono">{form.qr_y}%</span></div>
                      <input type="range" min="0" max="100" step="0.5" value={form.qr_y} onChange={e => setForm({...form, qr_y: parseFloat(e.target.value)})} className="w-full accent-rose-500" />
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-slate-600"><span>QR Box Size</span> <span className="font-mono">{form.qr_size}%</span></div>
                      <input type="range" min="5" max="80" step="0.5" value={form.qr_size} onChange={e => setForm({...form, qr_size: parseFloat(e.target.value)})} className="w-full accent-rose-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Preview Side */}
              <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-4 relative min-h-[300px]">
                {form.bg_url ? (
                  <div className="relative w-full max-h-full flex items-center justify-center" ref={previewRef}>
                    <img src={form.bg_url} alt="template layout" className="max-w-full max-h-[60vh] object-contain shadow-sm border border-slate-200 bg-white" />
                    
                    {/* The overlaid QR Code Proxy */}
                    <div 
                      className="absolute bg-black/80 flex items-center justify-center opacity-80 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 transition-all shadow-2xl border-2 border-dashed border-white cursor-crosshair"
                      style={{
                        left: `${form.qr_x}%`, top: `${form.qr_y}%`, width: `${form.qr_size}%`, aspectRatio: '1/1'
                      }}
                    >
                      <QrCode className="text-white opacity-50 w-1/2 h-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary px-5 py-2">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn bg-rose-600 text-white hover:bg-rose-700 px-6 py-2 shadow-lg shadow-rose-200 flex items-center gap-2">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
