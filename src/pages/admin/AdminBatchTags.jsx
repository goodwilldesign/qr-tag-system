import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import SEO from '../../components/SEO';
import {
  QrCode, Plus, Download, Printer, CheckCircle2, 
  Clock, Tag, FileSpreadsheet, Sparkles, Filter, 
  Search, ShieldCheck, KeyRound, ExternalLink, X, ChevronDown, ChevronRight, Layers
} from 'lucide-react';

export default function AdminBatchTags() {
  const [batches, setBatches] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' or 'all-tags'

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [printTargetBatch, setPrintTargetBatch] = useState(null); // batch object or array of tags
  const [expandedBatch, setExpandedBatch] = useState(null);

  // Generator form state
  const [batchIdInput, setBatchIdInput] = useState('');
  const [batchCount, setBatchCount] = useState(25);
  const [defaultType, setDefaultType] = useState('dog');
  const [requirePin, setRequirePin] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');

  // Print layout settings
  const [printCols, setPrintCols] = useState(3); // 2, 3, or 4
  const [printSize, setPrintSize] = useState(130);

  const printAreaRef = useRef(null);

  useEffect(() => {
    fetchBatchData();
  }, []);

  const fetchBatchData = async () => {
    setLoading(true);
    try {
      // Fetch all tags that have a batch_id or are unclaimed
      const { data, error } = await supabase
        .from('tags')
        .select('id, title, type, is_claimed, claim_code, batch_id, created_at, claimed_at, user_id')
        .not('batch_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allBatchTags = data || [];
      setTags(allBatchTags);

      // Group by batch_id
      const batchMap = {};
      allBatchTags.forEach(t => {
        const bId = t.batch_id || 'DEFAULT_BATCH';
        if (!batchMap[bId]) {
          batchMap[bId] = {
            batch_id: bId,
            created_at: t.created_at,
            total: 0,
            claimed: 0,
            unclaimed: 0,
            tags: []
          };
        }
        batchMap[bId].total += 1;
        if (t.is_claimed) {
          batchMap[bId].claimed += 1;
        } else {
          batchMap[bId].unclaimed += 1;
        }
        batchMap[bId].tags.push(t);
      });

      setBatches(Object.values(batchMap));
    } catch (err) {
      console.error('Error fetching batch tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async (e) => {
    e.preventDefault();
    setGenError('');
    setGenSuccess('');

    const countNum = parseInt(batchCount, 10);
    if (isNaN(countNum) || countNum < 1 || countNum > 500) {
      setGenError('Count must be between 1 and 500.');
      return;
    }

    const finalBatchId = batchIdInput.trim() || `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 899 + 100)}`;

    setGenerating(true);
    try {
      const { data, error } = await supabase.rpc('generate_tag_batch', {
        p_count: countNum,
        p_batch_id: finalBatchId,
        p_default_type: defaultType,
        p_require_claim_code: requirePin
      });

      if (error) throw error;

      setGenSuccess(`Successfully generated ${countNum} pre-printed tags for batch "${finalBatchId}"!`);
      setBatchIdInput('');
      await fetchBatchData();

      setTimeout(() => {
        setShowGenerateModal(false);
        setGenSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Error generating batch:', err);
      setGenError(err.message || 'Failed to generate batch.');
    } finally {
      setGenerating(false);
    }
  };

  // Export CSV for manufacturing, laser etching, or packaging vendors
  const exportBatchCSV = (batch) => {
    const origin = window.location.origin;
    const headers = ['Tag ID', 'Serial Code', 'Scan URL', 'Category', 'Claim PIN', 'Batch ID', 'Status', 'Claimed At'];
    
    const rows = batch.tags.map(t => [
      t.id,
      t.id.substring(0, 8).toUpperCase(),
      `${origin}/tag/${t.id}`,
      t.type,
      t.claim_code || 'None',
      t.batch_id,
      t.is_claimed ? 'Claimed' : 'Unclaimed',
      t.claimed_at || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geturqr_${batch.batch_id}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSheet = (batch) => {
    setPrintTargetBatch(batch);
  };

  const triggerBrowserPrint = () => {
    window.print();
  };

  const totalPreprinted = tags.length;
  const totalClaimed = tags.filter(t => t.is_claimed).length;
  const totalUnclaimed = totalPreprinted - totalClaimed;
  const claimRate = totalPreprinted > 0 ? Math.round((totalClaimed / totalPreprinted) * 100) : 0;

  return (
    <div className="space-y-8">
      <SEO title="Pre-Printed QR Tag Batches | GetURQR Admin" noindex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
            <QrCode className="text-violet-600" /> Pre-Printed Tag Batches
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate and export batches of unclaimed QR codes for physical products, packaging, and stickers.
          </p>
        </div>

        <button
          onClick={() => { setShowGenerateModal(true); setGenError(''); setGenSuccess(''); }}
          className="btn btn-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Generate New Batch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pre-Printed</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalPreprinted}</p>
          <p className="text-xs text-slate-500 mt-1">Tags across all batches</p>
        </div>

        <div className="glass-card p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Claimed & Activated</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{totalClaimed}</p>
          <p className="text-xs text-emerald-700 font-medium mt-1">{claimRate}% adoption rate</p>
        </div>

        <div className="glass-card p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Unclaimed / In Stock</p>
          <p className="text-2xl sm:text-3xl font-black text-violet-600 mt-1">{totalUnclaimed}</p>
          <p className="text-xs text-slate-500 mt-1">Ready for retail scan</p>
        </div>

        <div className="glass-card p-5 rounded-2xl bg-white border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Batches</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{batches.length}</p>
          <p className="text-xs text-slate-500 mt-1">Production runs</p>
        </div>
      </div>

      {/* Batches Table */}
      <div className="glass-card rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Production Batches</h2>
          <span className="text-xs font-bold text-slate-500">{batches.length} Batches Found</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Loading batch records...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
              <QrCode size={28} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">No Pre-Printed Batches Yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-5">
              Generate your first batch of QR tags to produce physical stickers, pet tags, or doorbell signs.
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn btn-primary px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              <Plus size={16} /> Generate First Batch
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.map(batch => {
              const isExpanded = expandedBatch === batch.batch_id;
              const rate = batch.total > 0 ? Math.round((batch.claimed / batch.total) * 100) : 0;

              return (
                <div key={batch.batch_id} className="transition-colors hover:bg-slate-50/50">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Batch info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-slate-900 text-base">
                          {batch.batch_id}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {batch.total} Tags
                        </span>
                        {rate === 100 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Fully Claimed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Created on {new Date(batch.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full md:w-56 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-600">{batch.claimed} Claimed</span>
                        <span className="text-slate-400">{batch.unclaimed} In Stock</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => exportBatchCSV(batch)}
                        className="btn btn-secondary py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        title="Download CSV for laser etching or print vendor"
                      >
                        <FileSpreadsheet size={14} className="text-emerald-600" /> Export CSV
                      </button>

                      <button
                        onClick={() => handlePrintSheet(batch)}
                        className="btn btn-secondary py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        title="View printable sticker sheet"
                      >
                        <Printer size={14} className="text-violet-600" /> Print Sheet
                      </button>

                      <button
                        onClick={() => setExpandedBatch(isExpanded ? null : batch.batch_id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title="Toggle tag list"
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Tag Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 p-5 border-t border-slate-100 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span>Tags in Batch ({batch.tags.length})</span>
                        <span>Click any link to inspect live</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                        {batch.tags.map(t => (
                          <div
                            key={t.id}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-800">#{t.id.substring(0, 8).toUpperCase()}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                t.is_claimed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {t.is_claimed ? 'Claimed' : 'Unclaimed'}
                              </span>
                            </div>

                            <p className="text-slate-600 font-medium truncate">{t.title}</p>
                            {t.claim_code && (
                              <p className="text-[11px] text-slate-500 font-mono">
                                PIN: <strong className="text-violet-700">{t.claim_code}</strong>
                              </p>
                            )}

                            <a
                              href={`/tag/${t.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-violet-600 hover:underline flex items-center gap-1 font-semibold pt-1"
                            >
                              <span>View Scan Page</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Generate New Batch */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Generate Pre-Printed Batch</h3>
                  <p className="text-xs text-slate-400">Create unclaimed physical QR tags</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {genError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {genError}
              </div>
            )}
            {genSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} /> {genSuccess}
              </div>
            )}

            <form onSubmit={handleGenerateBatch} className="space-y-4">
              {/* Batch ID */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Batch Name / Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. PET-COLLAR-2026-A"
                  value={batchIdInput}
                  onChange={e => setBatchIdInput(e.target.value.toUpperCase())}
                  className="form-input text-sm rounded-xl uppercase font-mono"
                />
                <p className="text-[11px] text-slate-400">Leave blank to auto-generate a timestamped code.</p>
              </div>

              {/* Tag Count Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Number of Tags to Generate
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 25, 50, 100].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setBatchCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        batchCount === cnt
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cnt} Tags
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={batchCount}
                  onChange={e => setBatchCount(e.target.value)}
                  className="form-input text-sm rounded-xl"
                  placeholder="Or enter custom count (max 500)"
                />
              </div>

              {/* Default Tag Type */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Initial Tag Type Template
                </label>
                <select
                  value={defaultType}
                  onChange={e => setDefaultType(e.target.value)}
                  className="form-input text-sm rounded-xl"
                >
                  <option value="dog">🐶 Pet Tag</option>
                  <option value="parking">🚗 Vehicle / Parking Sticker</option>
                  <option value="doorbell">🔔 Smart Doorbell Plaque</option>
                  <option value="kids">👶 Child Safety ID</option>
                  <option value="rental">🔑 Rental / Homestay</option>
                  <option value="electronics">💻 Asset / Laptop</option>
                  <option value="business">📇 Business Card</option>
                  <option value="keychain">🗝️ Keychain</option>
                </select>
                <p className="text-[11px] text-slate-400">The customer can change this when they scan and claim.</p>
              </div>

              {/* Scratch-Off PIN Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requirePin}
                  onChange={e => setRequirePin(e.target.checked)}
                  className="mt-0.5 rounded text-violet-600 focus:ring-violet-500"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Generate 6-character Claim PIN</p>
                  <p className="text-slate-500 mt-0.5">
                    Recommended for retail boxes. The buyer must enter this PIN to activate the tag.
                  </p>
                </div>
              </label>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-sm justify-center shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  {generating ? 'Generating in Supabase...' : `🚀 Generate ${batchCount} Tags`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Sticker Sheet View */}
      {printTargetBatch && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl flex flex-col max-h-[95vh] shadow-2xl overflow-hidden">
            {/* Header / Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0 print:hidden">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <Printer size={18} className="text-violet-600" /> Printable Sheet: {printTargetBatch.batch_id}
                </h3>
                <p className="text-xs text-slate-500">{printTargetBatch.tags.length} QR Code Stickers</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Column layout switcher */}
                <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white text-xs font-bold">
                  {[2, 3, 4].map(c => (
                    <button
                      key={c}
                      onClick={() => setPrintCols(c)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${printCols === c ? 'bg-violet-600 text-white' : 'text-slate-600'}`}
                    >
                      {c} Cols
                    </button>
                  ))}
                </div>

                <button
                  onClick={triggerBrowserPrint}
                  className="btn btn-primary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Printer size={14} /> Print Now / Save PDF
                </button>

                <button
                  onClick={() => setPrintTargetBatch(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div ref={printAreaRef} className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:p-0 print:m-0">
              <div
                className={`grid gap-4 print:gap-4 ${
                  printCols === 2 ? 'grid-cols-2' : printCols === 3 ? 'grid-cols-3' : 'grid-cols-4'
                }`}
              >
                {printTargetBatch.tags.map(t => {
                  const scanUrl = `${window.location.origin}/tag/${t.id}`;
                  const shortId = t.id.substring(0, 8).toUpperCase();

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl border-2 border-dashed border-slate-300 print:border-slate-400 bg-white flex flex-col items-center text-center justify-between space-y-2 break-inside-avoid shadow-sm print:shadow-none"
                    >
                      {/* Top label */}
                      <div className="w-full text-center">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-tight">GetURQR Smart Tag</p>
                        <p className="font-mono text-xs font-bold text-slate-800">#{shortId}</p>
                      </div>

                      {/* QR Code SVG */}
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center">
                        <QRCodeSVG
                          value={scanUrl}
                          size={printSize}
                          level="M"
                          includeMargin={false}
                        />
                      </div>

                      {/* Bottom Instruction */}
                      <div className="w-full text-center space-y-0.5">
                        <p className="text-[10px] font-bold text-violet-700">Scan to activate</p>
                        {t.claim_code && (
                          <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
                            PIN: {t.claim_code}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
