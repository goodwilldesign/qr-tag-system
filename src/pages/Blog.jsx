import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, Share2, Clock, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Render markdown-like content to basic HTML (for DB posts)
function renderContent(content) {
  if (!content) return null;
  return content.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} className="font-bold text-slate-900 mt-8 text-2xl">{block.slice(3)}</h2>;
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter(l => l.startsWith('- '));
      return (
        <ul key={i} className="list-disc ml-6 mt-4 space-y-3">
          {items.map((item, j) => {
            const text = item.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return <li key={j} dangerouslySetInnerHTML={{ __html: text }} />;
          })}
        </ul>
      );
    }
    if (block.startsWith('**') && block.endsWith('**')) {
      return <p key={i} className="mt-4 font-bold text-slate-800 text-xl">{block.slice(2, -2)}</p>;
    }
    return <p key={i} className="mt-4 text-slate-600 leading-relaxed">{block.replace(/\*(.*?)\*/g, '$1')}</p>;
  });
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // SEO
  useEffect(() => {
    document.title = activePost
      ? `${activePost.title} - GetURQR Blog`
      : 'GetURQR Blog - Modern QR Safety Insights';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = activePost?.seo_description || activePost?.excerpt
      || 'Read the latest guides and feature updates about securing your family, property, and luggage using GetURQR smart QR tags.';

    const scriptId = 'blog-schema-jsonld';
    let schema = document.getElementById(scriptId);
    if (!schema) { schema = document.createElement('script'); schema.id = scriptId; schema.type = 'application/ld+json'; document.head.appendChild(schema); }

    schema.textContent = JSON.stringify(activePost ? {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: activePost.seo_title || activePost.title,
      image: activePost.cover_image_url,
      datePublished: activePost.created_at,
      description: activePost.seo_description || activePost.excerpt,
      author: { '@type': 'Organization', name: 'GetURQR' }
    } : {
      '@context': 'https://schema.org', '@type': 'Blog',
      name: 'GetURQR Blog',
      blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, image: p.cover_image_url, datePublished: p.created_at }))
    });

    window.scrollTo(0, 0);
    return () => { if (schema) schema.remove(); };
  }, [activePost, posts]);

  // ── Single Post View ──────────────────────────────────────
  if (activePost) {
    const related = posts.filter(p => p.id !== activePost.id).slice(0, 3);
    const readTime = Math.max(1, Math.ceil((activePost.content?.split(' ').length || 0) / 200)) + ' min read';

    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        <button onClick={() => setActivePost(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 font-semibold transition-colors mt-8">
          <ArrowLeft size={20} /> Back to all articles
        </button>

        <div className="space-y-6 text-center">
          <div className="flex justify-center items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700">
              <Clock size={14} /> {readTime}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(activePost.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {activePost.title}
          </h1>
        </div>

        {activePost.cover_image_url && (
          <div className="w-full h-80 md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
            <img src={activePost.cover_image_url} alt={activePost.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-slate prose-lg md:prose-xl max-w-3xl mx-auto prose-p:text-slate-600 prose-li:text-slate-600">
          {renderContent(activePost.content)}
        </div>

        <div className="max-w-3xl mx-auto border-t border-b border-slate-100 py-8 flex justify-between items-center">
          <p className="font-bold text-slate-900">Found this helpful?</p>
          <button onClick={() => navigator.share?.({ title: activePost.title, url: window.location.href })}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors">
            <Share2 size={18} /> Share Article
          </button>
        </div>

        {related.length > 0 && (
          <div className="max-w-4xl mx-auto pt-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Read next</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(post => (
                <div key={post.id} onClick={() => setActivePost(post)}
                  className="group cursor-pointer bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col">
                  {post.cover_image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-violet-600 mb-2 uppercase tracking-widest">
                      {Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200))} min read
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Grid / Main View ──────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 py-12 md:py-20 bg-gradient-to-b from-violet-50/50 to-transparent rounded-[3rem] mt-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">The GetURQR Blog</h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto px-4">
          Discover how digital QR tags are completely revolutionizing safety, convenience, and privacy for families, hosts, and travelers.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2rem] animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-semibold">No posts published yet.</p>
          <p className="text-sm mt-2">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
          {posts.map(post => {
            const readTime = Math.max(1, Math.ceil((post.content?.split(' ').length || 0) / 200)) + ' min read';
            return (
              <article key={post.id} onClick={() => setActivePost(post)}
                className="flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group">
                <div className="w-full h-56 relative overflow-hidden bg-slate-100">
                  {post.cover_image_url
                    ? <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    : <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-50 flex items-center justify-center"><BookOpen size={48} className="text-violet-300" /></div>
                  }
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm bg-white/95 backdrop-blur-sm text-violet-700">
                    <Clock size={12} /> {readTime.toUpperCase()}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                    <BookOpen size={14} />
                    {new Date(post.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-violet-600 transition-colors line-clamp-3 mb-4">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-2 font-bold text-violet-600 group-hover:translate-x-1 transition-transform">
                    Read Article &rarr;
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
