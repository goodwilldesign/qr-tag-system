export class OpenRouterClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://openrouter.ai/api/v1';
  }

  async listModels() {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Blog System'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return [];
    }
  }

  async generateBlogPost(
    category,
    keywords,
    model,
    temperature = 0.8,
    maxTokens = 2000
  ) {
    const systemPrompt = `You are an expert blogger and SEO specialist. Generate high-quality, engaging blog posts that are optimized for search engines.

Your blog posts should:
- Be informative, engaging, and original
- Target a reading level suitable for general audiences (Grade 8-10)
- Include proper heading structure (H2, H3)
- Use natural keyword placement (avoid keyword stuffing)
- Be between 800-1500 words
- Include practical tips, examples, or insights
- Have a clear introduction, body, and conclusion

Respond ONLY with valid JSON in this exact format:
{
  "title": "Engaging title (50-60 characters)",
  "meta_title": "SEO-optimized title (50-60 characters)",
  "meta_description": "Compelling meta description (150-160 characters)",
  "focus_keyword": "primary SEO keyword",
  "excerpt": "Brief summary (150-200 characters)",
  "content": "Full HTML content with proper <h2>, <h3>, <p>. Make sure to properly escape HTML string values for JSON.",
  "faq_items": [
    { "question": "FAQ Question 1", "answer": "FAQ Answer 1" },
    { "question": "FAQ Question 2", "answer": "FAQ Answer 2" }
  ],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "category-slug",
  "image_keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const userPrompt = `Generate a blog post for the category "${category}" with these target keywords: ${keywords.join(', ')}.

Make it informative, engaging, and SEO-optimized. Focus on providing value to readers.
CRITICAL: You MUST include full HTML content for the blog post and generate 2-3 relevant Frequently Asked Questions (faq_items) in the JSON response.`;

    const request = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Blog System'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const blogPost = JSON.parse(jsonMatch[0]);

      return {
        content: blogPost,
        usage: data.usage
      };
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }

  calculateCost(usage, model) {
    const promptCost = (usage.prompt_tokens / 1_000_000) * model.pricing.prompt;
    const completionCost = (usage.completion_tokens / 1_000_000) * model.pricing.completion;
    return promptCost + completionCost;
  }
}

export const POPULAR_MODELS = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free (Auto-routing)',
    description: 'Automatically routes to the best available free model',
    category: 'Free'
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Gemma 4 31B (Free)',
    description: 'Powerful free model by Google',
    category: 'Free'
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    description: 'Fast and free, great for daily blog generation',
    category: 'Free'
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Highest quality, best for important content',
    category: 'Premium'
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Excellent writing quality and creativity',
    category: 'Premium'
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and affordable, good quality',
    category: 'Standard'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Good balance of speed and quality',
    category: 'Standard'
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Open source, competitive quality',
    category: 'Standard'
  }
];
