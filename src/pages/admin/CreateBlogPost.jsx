import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import RichTextEditor from '../../components/RichTextEditor';
import SEOScorePanel from '../../components/SEOScorePanel';
import { generateSlug, countWords, calculateReadingTime, analyzeSEO } from '../../lib/seoUtils';
import { OpenRouterClient } from '../../lib/openrouter';
import {
  Save, Calendar, Sparkles, ArrowLeft, Image as ImageIcon,
  Tag, Folder, Hash, AlignLeft, Type, FileText, Loader2, Upload, X, Plus, HelpCircle, Trash2
} from 'lucide-react';

export default function CreateBlogPost() {
  const { id } = useParams();
  const postId = id;
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [existingPostId, setExistingPostId] = useState(postId || null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [faqItems, setFaqItems] = useState([]);
  const [status, setStatus] = useState('draft');
  const [publishDate, setPublishDate] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  async function loadData() {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name')
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (tagsRes.data) setAllTags(tagsRes.data);

      if (postId) {
        const { data: post, error } = await supabase
          .from('blog_posts')
          .select('*, blog_post_tags(tag_id)')
          .eq('id', postId)
          .single();
        
        if (post && !error) {
          setTitle(post.title || '');
          setSlug(post.slug || '');
          setExcerpt(post.excerpt || '');
          setContent(post.content || '');
          setFeaturedImageUrl(post.featured_image_url || '');
          setFeaturedImageAlt(post.featured_image_alt || '');
          setCategoryId(post.category_id || '');
          setStatus(post.status || 'draft');
          setMetaTitle(post.meta_title || '');
          setMetaDescription(post.meta_description || '');
          setFocusKeyword(post.focus_keyword || '');
          setTargetLocation(post.target_location || '');
          if (post.faq_items) setFaqItems(post.faq_items);
          if (post.publish_date) {
            const d = new Date(post.publish_date);
            setPublishDate(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
          }
          if (post.blog_post_tags) {
            setSelectedTags(post.blog_post_tags.map(t => t.tag_id));
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async function generateWithAI() {
    if (!categoryId) {
      toast.error('Please select a category first');
      return;
    }

    if (!confirm('Generate a blog post using AI? This will replace the current content.')) {
      return;
    }

    setGenerating(true);

    try {
      const { data: settingsData } = await supabase
        .from('blog_settings')
        .select('key, value')
        .in('key', ['openrouter_api_key', 'openrouter_model', 'openrouter_temperature', 'openrouter_max_tokens']);
        
      const settingsMap = new Map(settingsData?.map(s => [s.key, s.value]) || []);
      const apiKey = settingsMap.get('openrouter_api_key');
      const model = settingsMap.get('openrouter_model') || 'google/gemini-2.0-flash-exp:free';
      const temperature = parseFloat(settingsMap.get('openrouter_temperature') || '0.8');
      const maxTokens = parseInt(settingsMap.get('openrouter_max_tokens') || '2000');

      if (!apiKey) {
        toast.error('OpenRouter API key is missing. Please configure it in Blog Settings.');
        setGenerating(false);
        return;
      }

      const client = new OpenRouterClient(apiKey);
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'General';
      const keywords = focusKeyword ? [focusKeyword] : [categoryName.toLowerCase(), 'guide', 'tips'];
      
      const { content: post } = await client.generateBlogPost(
        categoryName,
        keywords,
        model,
        temperature,
        maxTokens
      );

      setTitle(post.title || '');
      setSlug(generateSlug(post.title || ''));
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setMetaTitle(post.meta_title || post.title || '');
      setMetaDescription(post.meta_description || post.excerpt || '');
      setFocusKeyword(post.focus_keyword || keywords[0] || '');
      if (post.faq_items) setFaqItems(post.faq_items);

      toast.success('AI post generated successfully! Review and save when ready.');
    } catch (error) {
      console.error('Error generating post:', error);
      alert(error.message || 'Failed to generate post');
    } finally {
      setGenerating(false);
    }
  }

  async function savePost() {
    if (!title || !content || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const wordCount = countWords(content);
      const readingTime = calculateReadingTime(wordCount);

      let finalPublishDate = null;
      if (publishDate) {
        const localDate = new Date(publishDate);
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(localDate.getTime() + istOffset);
        finalPublishDate = istDate.toISOString();
      } else if (status === 'published') {
        finalPublishDate = new Date().toISOString();
      }

      const postData = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        featured_image_url: featuredImageUrl || null,
        featured_image_alt: featuredImageAlt || '',
        category_id: categoryId,
        author_id: user?.id,
        status,
        publish_date: finalPublishDate,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        focus_keyword: focusKeyword,
        target_location: targetLocation || null,
        faq_items: faqItems.length > 0 ? faqItems : null,
        word_count: wordCount,
        reading_time_minutes: readingTime,
        is_ai_generated: false,
        seo_score: analyzeSEO(title, metaDescription || excerpt, content, focusKeyword).score
      };

      let postResult;
      
      if (existingPostId) {
        postResult = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', existingPostId)
          .select()
          .single();
      } else {
        postResult = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
      }

      const { data: post, error: postError } = postResult;

      if (postError) throw postError;

      if (existingPostId) {
        await supabase.from('blog_post_tags').delete().eq('post_id', existingPostId);
      }

      if (selectedTags.length > 0) {
        const postTags = selectedTags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));

        await supabase.from('blog_post_tags').insert(postTags);
      }

      toast.success('Post saved successfully!');
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert(error.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  }

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setFeaturedImageUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function createNewCategory() {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const categorySlug = generateSlug(newCategoryName);
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: newCategoryName.trim(),
          slug: categorySlug,
          color: newCategoryColor,
          description: ''
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setCategoryId(data.id);
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
      setShowNewCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category: ' + error.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Blog Post</h1>
            <p className="text-gray-600 mt-1">Write manually or generate with AI</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateWithAI}
            disabled={generating}
            className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? 'Generating...' : 'Generate with AI'}
          </button>
          <button
            onClick={savePost}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Type className="w-4 h-4" />
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4" />
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-slug"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blog/{slug || 'your-post-slug'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <AlignLeft className="w-4 h-4" />
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary (150-200 characters)"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {excerpt.length}/200 characters
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Content *
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your blog post..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {countWords(content)} words · {calculateReadingTime(countWords(content))} min read
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Featured Image
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Upload Image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {uploadingImage ? 'Uploading...' : 'Choose image or drag here'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                  {featuredImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFeaturedImageUrl('')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB. Supports JPG, PNG, WebP
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500 uppercase">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Image URL
                </label>
                <input
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {featuredImageUrl && (
                <div className="border border-gray-200 rounded-lg p-2 relative">
                  <img
                    src={featuredImageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Alt Text (for SEO & accessibility)
                </label>
                <input
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions (SEO)
              </h3>
              <button
                type="button"
                onClick={() => setFaqItems([...faqItems, { question: '', answer: '' }])}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
            
            {faqItems.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">No FAQs added yet. Add FAQs to generate an SEO-rich FAQPage schema.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => setFaqItems(faqItems.filter((_, i) => i !== index))}
                      className="absolute top-4 right-4 p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...faqItems];
                          newFaqs[index].question = e.target.value;
                          setFaqItems(newFaqs);
                        }}
                        placeholder="e.g. How does this work?"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Answer</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqItems];
                          newFaqs[index].answer = e.target.value;
                          setFaqItems(newFaqs);
                        }}
                        rows={2}
                        placeholder="Provide a clear, helpful answer..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <SEOScorePanel
            title={title}
            metaDescription={metaDescription}
            content={content}
            focusKeyword={focusKeyword}
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Focus Keyword
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="primary keyword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Target Location (Local SEO)
              </label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                placeholder="e.g., New York, USA or Mumbai, India"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank if this post is global.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'SEO title (50-60 chars)'}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 characters</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={excerpt || 'SEO description (150-160 chars)'}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 characters</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Category *
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </div>

            {showNewCategory && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Technology, Art, Business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={createNewCategory}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                      setNewCategoryColor('#3b82f6');
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Publishing
            </h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Publish Date & Time (Local Time)
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
