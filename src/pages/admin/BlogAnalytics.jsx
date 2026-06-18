import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Eye, FileText, Tag, Calendar, BarChart3 } from 'lucide-react';

export default function BlogAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    avgSeoScore: 0,
    totalCategories: 0,
    totalTags: 0,
    aiGeneratedPosts: 0
  });
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const [
        postsCountRes,
        publishedCountRes,
        draftCountRes,
        viewsRes,
        seoScoreRes,
        categoriesRes,
        tagsRes,
        aiPostsRes,
        topPostsRes
      ] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('blog_posts').select('view_count'),
        supabase.from('blog_posts').select('seo_score'),
        supabase.from('blog_categories').select('*', { count: 'exact', head: true }),
        supabase.from('blog_tags').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('is_ai_generated', true),
        supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            view_count,
            seo_score,
            publish_date,
            category:blog_categories(name, color)
          `)
          .eq('status', 'published')
          .order('view_count', { ascending: false })
          .limit(5)
      ]);

      const totalViews = viewsRes.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
      const avgSeoScore = seoScoreRes.data?.length
        ? Math.round(
            seoScoreRes.data.reduce((sum, post) => sum + (post.seo_score || 0), 0) /
              seoScoreRes.data.length
          )
        : 0;

      setStats({
        totalPosts: postsCountRes.count || 0,
        publishedPosts: publishedCountRes.count || 0,
        draftPosts: draftCountRes.count || 0,
        totalViews,
        avgSeoScore,
        totalCategories: categoriesRes.count || 0,
        totalTags: tagsRes.count || 0,
        aiGeneratedPosts: aiPostsRes.count || 0
      });

      setTopPosts(topPostsRes.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published',
      value: stats.publishedPosts,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg SEO Score',
      value: stats.avgSeoScore,
      icon: BarChart3,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'AI Generated',
      value: stats.aiGeneratedPosts,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Analytics</h1>
            <p className="text-gray-600 mt-1">Performance metrics and insights</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Top Performing Posts
        </h2>
        {topPosts.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No published posts yet</p>
        ) : (
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${post.category?.color}20`,
                          color: post.category?.color
                        }}
                      >
                        {post.category?.name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publish_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{post.view_count}</span>
                    </div>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-600">
                      <BarChart3 className="w-4 h-4" />
                      <span className="font-semibold">{post.seo_score}</span>
                    </div>
                    <p className="text-xs text-gray-500">SEO</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Published Posts</span>
              <span className="font-semibold text-green-600">{stats.publishedPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Draft Posts</span>
              <span className="font-semibold text-yellow-600">{stats.draftPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI Generated</span>
              <span className="font-semibold text-purple-600">{stats.aiGeneratedPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Manual Posts</span>
              <span className="font-semibold text-blue-600">
                {stats.totalPosts - stats.aiGeneratedPosts}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Categories</span>
              <span className="font-semibold text-gray-900">{stats.totalCategories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tags</span>
              <span className="font-semibold text-gray-900">{stats.totalTags}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Posts per Category</span>
              <span className="font-semibold text-gray-900">
                {stats.totalCategories > 0
                  ? Math.round(stats.totalPosts / stats.totalCategories)
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
