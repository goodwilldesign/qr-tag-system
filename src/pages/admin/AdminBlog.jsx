import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Sparkles, Globe, Edit, Trash2, X, Check, Lightbulb, RefreshCw, Save, Image as ImageIcon } from 'lucide-react';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function AIModal({ onClose, onCreated }) {
  const [step, setStep] = useState('topic'); // topic | titles | generating | preview
  const [topic, setTopic] = useState('');
  const [suggestedTitles, setSuggestedTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [post, setPost] = useState({ title: '', content: '', excerpt: '', cover_image_url: '', seo_title: '', seo_description: '', seo_keywords: '' });
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTitleSuggestions = async () => {
    if (!topic.trim()) return;
    setLoadingTitles(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-blog-generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ topic, mode: 'titles_only' }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate titles.');
      setSuggestedTitles(data.titles || []);
      setStep('titles');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTitles(false);
    }
  };

  const generatePost = async () => {
    const finalTitle = customTitle.trim() || selectedTitle;
    if (!finalTitle) return;
    setStep('generating');
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-blog-generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ topic: finalTitle, mode: 'full_post' }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Post generation failed.');
      setPost({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        cover_image_url: data.cover_image_url || '',
        seo_title: data.seo_title || data.title,
        seo_description: data.seo_description || data.excerpt,
        seo_keywords: data.seo_keywords || '',
      });
      setStep('preview');
    } catch (err) {
      setError(err.message);
      setStep('titles');
    }
  };

  const savePost = async (status) => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { error: dbErr } = await supabase.from('blog_posts').insert([{
      title: post.title,
      slug: slugify(post.title),
      content: post.content,
      excerpt: post.excerpt,
      cover_image_url: post.cover_image_url || null,
      seo_title: post.seo_title || null,
      seo_description: post.seo_description || null,
      seo_keywords: post.seo_keywords || null,
      status,
      author_id: session?.user?.id,
    }]);
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            <h3 className="font-bold text-slate-900">AI Blog Generator</h3>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">GPT-4 + DALL-E 3</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">

          {/* STEP 1: Topic */}
          {(step === 'topic' || step === 'titles') && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Blog Topic / Keyword</label>
              <div className="flex gap-2">
                <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchTitleSuggestions()}
                  placeholder="e.g. 'how QR tags help reunite lost pets'"
                  className="flex-1 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-violet-400" />
                <button onClick={fetchTitleSuggestions} disabled={!topic.trim() || loadingTitles}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 shrink-0">
                  {loadingTitles ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Wait…</> : <><Lightbulb size={15} /> Suggest Titles</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Title Suggestions */}
          {step === 'titles' && suggestedTitles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Titles — pick one or write your own</label>
                <button onClick={fetchTitleSuggestions} disabled={loadingTitles} className="flex items-center gap-1 text-xs text-violet-500 hover:text-violet-700 font-semibold">
                  <RefreshCw size={11} /> Re-generate
                </button>
              </div>
              <div className="space-y-2">
                {suggestedTitles.map((title, i) => (
                  <button key={i} onClick={() => { setSelectedTitle(title); setCustomTitle(''); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selectedTitle === title && !customTitle ? 'border-violet-400 bg-violet-50 text-violet-800 font-semibold' : 'border-slate-200 hover:border-violet-300 text-slate-700 hover:bg-slate-50'}`}>
                    <span className="text-slate-400 text-xs font-mono mr-2">{i + 1}.</span> {title}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Or type a custom title:</label>
                <input value={customTitle} onChange={e => { setCustomTitle(e.target.value); setSelectedTitle(''); }}
                  placeholder="Write your own title…"
                  className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-violet-400" />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
              <button onClick={generatePost} disabled={!selectedTitle && !customTitle.trim()}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-40">
                <Sparkles size={15} /> Generate Full Post + Cover Image
              </button>
            </div>
          )}

          {/* Generating */}
          {step === 'generating' && (
            <div className="py-14 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <div>
                <p className="text-slate-900 font-bold">Writing your post with GPT-4…</p>
                <p className="text-slate-400 text-sm mt-1">Also generating the cover image with DALL-E 3</p>
              </div>
            </div>
          )}

          {/* STEP 3: Preview + SEO */}
          {step === 'preview' && (
            <div className="space-y-4">
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt="cover" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
              )}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Title</label>
                  <input value={post.title} onChange={e => setPost(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Excerpt</label>
                  <input value={post.excerpt} onChange={e => setPost(p => ({ ...p, excerpt: e.target.value }))}
                    className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Content (Markdown)</label>
                  <textarea value={post.content} onChange={e => setPost(p => ({ ...p, content: e.target.value }))} rows={8}
                    className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400 resize-none font-mono text-xs" />
                </div>
              </div>

              {/* SEO Fields */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={14} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">SEO Metadata (Auto-filled by AI)</p>
                </div>
                <div>
                  <label className="text-xs text-emerald-700 font-semibold block mb-1">SEO Title (55–60 chars)</label>
                  <input value={post.seo_title} onChange={e => setPost(p => ({ ...p, seo_title: e.target.value }))}
                    className="w-full border border-emerald-300 bg-white text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                  <p className="text-[10px] text-emerald-500 mt-0.5">{post.seo_title.length} / 60 chars</p>
                </div>
                <div>
                  <label className="text-xs text-emerald-700 font-semibold block mb-1">Meta Description (150–160 chars)</label>
                  <textarea value={post.seo_description} onChange={e => setPost(p => ({ ...p, seo_description: e.target.value }))} rows={2}
                    className="w-full border border-emerald-300 bg-white text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
                  <p className="text-[10px] text-emerald-500 mt-0.5">{post.seo_description.length} / 160 chars</p>
                </div>
                <div>
                  <label className="text-xs text-emerald-700 font-semibold block mb-1">Focus Keywords (comma separated)</label>
                  <input value={post.seo_keywords} onChange={e => setPost(p => ({ ...p, seo_keywords: e.target.value }))}
                    className="w-full border border-emerald-300 bg-white text-slate-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => savePost('draft')} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                  <Edit size={14} /> Save as Draft
                </button>
                <button onClick={() => savePost('published')} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
                  <Globe size={14} /> Publish Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Edit Modal ─────────────────────────────────────────── */
function EditModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: post.title || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    cover_image_url: post.cover_image_url || '',
    seo_title: post.seo_title || '',
    seo_description: post.seo_description || '',
    seo_keywords: post.seo_keywords || '',
    status: post.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    const { error: dbErr } = await supabase
      .from('blog_posts')
      .update({ ...form, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })
      .eq('id', post.id);
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onSaved();
    onClose();
  };

  const field = (label, key, type = 'text', rows = null, hint = '') => (
    <div>
      <label className="text-xs font-bold text-slate-500 block mb-1">{label}{hint && <span className="text-slate-400 font-normal ml-1">{hint}</span>}</label>
      {rows
        ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={rows}
            className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400 resize-none font-mono text-xs" />
        : <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
      }
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit size={18} className="text-violet-500" />
            <h3 className="font-bold text-slate-900">Edit Post</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="cover" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
          )}

          {field('Title', 'title')}
          {field('Excerpt / Summary', 'excerpt')}
          {field('Cover Image URL', 'cover_image_url', 'url')}
          {field('Content (Markdown)', 'content', 'text', 12)}

          {/* SEO */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Globe size={13} /> SEO Metadata
            </p>
            {field('SEO Title', 'seo_title', 'text', null, '(max 60 chars)')}
            {field('Meta Description', 'seo_description', 'text', null, '(max 160 chars)')}
            {field('Focus Keywords', 'seo_keywords', 'text', null, '(comma separated)')}
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-bold text-slate-500">Status</label>
            <div className="flex gap-2">
              {['draft', 'published'].map(s => (
                <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    form.status === s ? (s === 'published' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white') : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
              {saving ? 'Saving…' : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const toggleSelect = (id) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const selectAll = () =>
    setSelected(selected.size === posts.length ? new Set() : new Set(posts.map(p => p.id)));

  const toggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await supabase.from('blog_posts').update({ status: newStatus }).eq('id', post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
  };

  const deletePost = async (id) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    const ids = [...selected];
    await supabase.from('blog_posts').delete().in('id', ids);
    setPosts(prev => prev.filter(p => !ids.includes(p.id)));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const isAllSelected = posts.length > 0 && selected.size === posts.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText size={22} className="text-violet-500" /> AI Blog
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{posts.length} posts · GPT-4 + DALL-E 3 + SEO Optimized</p>
        </div>
        <button onClick={() => setShowAI(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
          <Sparkles size={15} /> Generate with AI
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg animate-in fade-in">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={() => setSelected(new Set())}
            className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
            Deselect All
          </button>
          <button onClick={bulkDelete} disabled={bulkDeleting}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
            <Trash2 size={14} />
            {bulkDeleting ? 'Deleting…' : `Delete ${selected.size} Post${selected.size > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 text-center">
          <Sparkles size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No posts yet.</p>
          <p className="text-slate-400 text-sm mt-1">Click "Generate with AI" to create your first SEO-optimized blog post.</p>
        </div>
      ) : (
        <>
          {/* Select All row */}
          <div className="flex items-center gap-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={isAllSelected} onChange={selectAll}
                className="w-4 h-4 rounded accent-violet-600 cursor-pointer" />
              <span className="text-xs font-semibold text-slate-500">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </label>
            <span className="text-xs text-slate-400">{posts.length} posts</span>
          </div>

          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id}
                className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 hover:border-violet-200 transition-all ${selected.has(post.id) ? 'border-violet-300 bg-violet-50/40 ring-1 ring-violet-200' : 'border-slate-200'}`}>
                {/* Checkbox */}
                <div className="flex items-start pt-0.5">
                  <input type="checkbox" checked={selected.has(post.id)} onChange={() => toggleSelect(post.id)}
                    className="w-4 h-4 rounded accent-violet-600 cursor-pointer mt-0.5" />
                </div>

                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt="" className="w-20 h-14 object-cover rounded-xl shrink-0 border border-slate-100" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-slate-900 font-bold text-sm leading-snug">{post.title}</h3>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>
                      {post.seo_keywords && (
                        <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">🔍 {post.seo_keywords}</p>
                      )}
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => setEditingPost(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-700 transition-colors">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => toggleStatus(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors">
                      {post.status === 'published' ? <><Check size={12} /> Unpublish</> : <><Globe size={12} /> Publish</>}
                    </button>
                    <button onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                    <span className="text-slate-300 text-[10px] ml-auto">{new Date(post.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAI && <AIModal onClose={() => setShowAI(false)} onCreated={fetchPosts} />}
      {editingPost && <EditModal post={editingPost} onClose={() => setEditingPost(null)} onSaved={fetchPosts} />}
    </div>
  );
}
