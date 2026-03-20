import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function TagPrintModal({ tag, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const qrCanvasRef = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, [tag.type]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Fetch templates matching the tag's type or generic 'all'
      const { data, error } = await supabase
        .from('print_templates')
        .select('*')
        .in('type', [tag.type, 'all'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0) setSelected(data[0]);
    } catch (err) {
      console.error(err);
      setError('Could not load templates.');
    } finally {
      setLoading(false);
    }
  };

  const getTagUrl = (id) => `${window.location.origin}/tag/${id}`;
  const qrUrl = getTagUrl(tag.id);

  const handleDownload = async () => {
    if (!selected) return;
    try {
      setGenerating(true);
      
      // 1. Load the background image
      const bgImage = new Image();
      bgImage.crossOrigin = "anonymous"; // Important for external URLs
      
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = () => reject(new Error('Failed to load background image.'));
        bgImage.src = selected.bg_url;
      });

      // 2. Prepare the Canvas
      const canvas = document.createElement('canvas');
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;
      const ctx = canvas.getContext('2d');

      // 3. Draw background
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // 4. Get the QR code canvas
      const qrCanvas = qrCanvasRef.current?.querySelector('canvas');
      if (!qrCanvas) throw new Error('QR Code not ready');

      // 5. Calculate positioning based on percentages
      // qr_x and qr_y are the CENTER of the QR code
      const qrSize = (selected.qr_size / 100) * canvas.width;
      const qrX = (selected.qr_x / 100) * canvas.width - (qrSize / 2);
      const qrY = (selected.qr_y / 100) * canvas.height - (qrSize / 2);

      // 6. Draw the QR code on top
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // 7. Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TagLink_${tag.title.replace(/\s+/g, '_')}_Print.png`;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error(err);
      alert(`Error generating image: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Hidden QR Code Canvas for extraction */}
      <div ref={qrCanvasRef} style={{ display: 'none' }}>
        <QRCodeCanvas value={qrUrl} size={1024} level="H" includeMargin={false} />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Print "{tag.title}"</h3>
            <p className="text-sm text-slate-500 font-medium">Choose a template style to download</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex gap-2 items-center">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>)}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Templates Available</h3>
              <p className="text-slate-500 text-sm mb-4">You can still download the basic QR code directly.</p>
              
              <button 
                onClick={async () => {
                  try {
                    const canvas = qrCanvasRef.current?.querySelector('canvas');
                    const link = document.createElement('a');
                    link.download = `QR_${tag.title.replace(/\s+/g, '_')}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  } catch(e) {}
                }}
                className="btn btn-primary px-6 py-2.5"
              >
                Download Basic QR
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar: Template Selection */}
              <div className="w-full md:w-1/3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Available Designs</h4>
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                      selected?.id === t.id 
                        ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-500/10' 
                        : 'border-transparent bg-white shadow-sm hover:border-slate-200'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <img src={t.bg_url} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-bold truncate ${selected?.id === t.id ? 'text-violet-900' : 'text-slate-700'}`}>{t.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{t.type} tag</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Main Preview Area */}
              <div className="w-full md:w-2/3 flex flex-col">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex-1 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
                  {selected && (
                    <div className="relative w-full max-h-[50vh] flex items-center justify-center">
                      <img 
                        src={selected.bg_url} 
                        alt="Preview Background" 
                        className="max-w-full max-h-[50vh] object-contain shadow-lg rounded"
                      />
                      
                      {/* The QR Code Overlay Preview */}
                      <div 
                        className="absolute bg-white/5 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${selected.qr_x}%`, 
                          top: `${selected.qr_y}%`, 
                          width: `${selected.qr_size}%`, 
                          aspectRatio: '1/1'
                        }}
                      >
                       <QRCodeCanvas value={qrUrl} size={256} className="w-full h-full" level="H" includeMargin={false} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleDownload}
                    disabled={generating || !selected}
                    className="btn btn-primary shadow-xl shadow-violet-500/20 px-8 py-3.5 text-base font-bold rounded-2xl flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <Download size={20} />
                    {generating ? 'Generating High-Res PNG...' : 'Download Template'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
