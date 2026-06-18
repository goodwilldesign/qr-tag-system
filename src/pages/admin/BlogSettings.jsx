import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Key, Sparkles, Image as ImageIcon, Clock, Loader2 } from 'lucide-react';
import { POPULAR_MODELS } from '../../lib/openrouter';

export default function BlogSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openrouterKey, setOpenrouterKey] = useState('');
  const [openrouterModel, setOpenrouterModel] = useState('google/gemini-2.0-flash-exp:free');
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(2000);

  const [unsplashKey, setUnsplashKey] = useState('');
  const [pexelsKey, setPexelsKey] = useState('');

  const [autoPublishEnabled, setAutoPublishEnabled] = useState(true);
  const [autoPublishTime, setAutoPublishTime] = useState('09:00');
  const [postsPerDay, setPostsPerDay] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap = new Map(data?.map(s => [s.key, s.value]) || []);

      setOpenrouterKey(settingsMap.get('openrouter_api_key') || '');
      setOpenrouterModel(settingsMap.get('openrouter_model') || 'google/gemini-2.0-flash-exp:free');
      setTemperature(parseFloat(settingsMap.get('openrouter_temperature') || '0.8'));
      setMaxTokens(parseInt(settingsMap.get('openrouter_max_tokens') || '2000'));

      setUnsplashKey(settingsMap.get('unsplash_access_key') || '');
      setPexelsKey(settingsMap.get('pexels_api_key') || '');

      setAutoPublishEnabled(settingsMap.get('auto_publish_enabled') === true);
      setAutoPublishTime(settingsMap.get('auto_publish_time') || '09:00');
      setPostsPerDay(parseInt(settingsMap.get('posts_per_day') || '1'));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);

    try {
      const settings = [
        { key: 'openrouter_api_key', value: openrouterKey },
        { key: 'openrouter_model', value: openrouterModel },
        { key: 'openrouter_temperature', value: temperature.toString() },
        { key: 'openrouter_max_tokens', value: maxTokens.toString() },
        { key: 'unsplash_access_key', value: unsplashKey },
        { key: 'pexels_api_key', value: pexelsKey },
        { key: 'auto_publish_enabled', value: autoPublishEnabled.toString() },
        { key: 'auto_publish_time', value: autoPublishTime },
        { key: 'posts_per_day', value: postsPerDay.toString() }
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('blog_settings')
          .update({
            value: setting.value,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('key', setting.key);

        if (error) throw error;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog AI Settings</h1>
            <p className="text-gray-600 mt-1">Configure OpenRouter and automation settings</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            OpenRouter API Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                OpenRouter API Key *
              </label>
              <input
                type="password"
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter Dashboard</a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                AI Model
              </label>
              <select
                value={openrouterModel}
                onChange={(e) => setOpenrouterModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {POPULAR_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the AI model for content generation. Free models are great for testing!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Temperature (Creativity)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  0.0 = Focused, 1.0 = Creative
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  min="500"
                  max="4000"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher = Longer posts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-500" />
            Image APIs
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Unsplash Access Key
              </label>
              <input
                type="password"
                value={unsplashKey}
                onChange={(e) => setUnsplashKey(e.target.value)}
                placeholder="Enter Unsplash access key..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key from <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash Developers</a>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Pexels API Key (Fallback)
              </label>
              <input
                type="password"
                value={pexelsKey}
                onChange={(e) => setPexelsKey(e.target.value)}
                placeholder="Enter Pexels API key..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key from <a href="https://www.pexels.com/api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pexels API</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Automated Publishing
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Enable Auto-Publishing</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automatically generate and publish blog posts daily
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPublishEnabled}
                  onChange={(e) => setAutoPublishEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {autoPublishEnabled && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Publish Time (UTC)
                  </label>
                  <input
                    type="time"
                    value={autoPublishTime}
                    onChange={(e) => setAutoPublishTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Posts Per Day
                  </label>
                  <input
                    type="number"
                    value={postsPerDay}
                    onChange={(e) => setPostsPerDay(parseInt(e.target.value))}
                    min="1"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of posts to generate automatically each day
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Getting Started</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Sign up for a free <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter account</a></li>
          <li>Get your API key and paste it above</li>
          <li>Optionally add Unsplash/Pexels keys for images</li>
          <li>Choose your preferred AI model (Gemini 2.0 Flash is free!)</li>
          <li>Save settings and start generating blog posts!</li>
        </ol>
      </div>
    </div>
  );
}
