import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { topic, mode = 'full_post' } = await req.json()
    if (!topic) throw new Error('Topic is required')

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in Supabase secrets.')

    // ── MODE: titles_only → return 5 title suggestions ──────
    if (mode === 'titles_only') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert SEO content strategist for TagLink, a QR tag company. Generate catchy, high-CTR, SEO-optimized blog titles.',
            },
            {
              role: 'user',
              content: `Generate 5 unique, compelling, SEO-optimized blog title suggestions for the topic: "${topic}".
Each title should:
- Be 50–65 characters long
- Include a power word or number where natural
- Be enticing and clickable
- Target relevant search intent

Return a JSON object with a single field "titles" which is an array of 5 title strings. 
Respond ONLY with the JSON, no other text.`,
            },
          ],
          temperature: 0.9,
          response_format: { type: 'json_object' },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'GPT-4 title generation failed')
      const parsed = JSON.parse(data.choices[0].message.content)
      return new Response(JSON.stringify({ titles: parsed.titles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── MODE: full_post → full blog post + SEO metadata + cover image ──
    const textRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional SEO blog writer for TagLink, a QR tag company helping people protect their valuables, pets, and loved ones. 
Write engaging, SEO-optimized blog posts. Include:
- Proper H2 subheadings in markdown
- Short paragraphs
- Natural keyword integration
- A compelling intro and actionable conclusion
- Internal call-to-action linking to /store and /dashboard`,
          },
          {
            role: 'user',
            content: `Write a complete, SEO-optimized blog post with the title: "${topic}".
Return a JSON object with these EXACT fields:
- title: The blog post title (string)
- excerpt: 1-2 sentence compelling summary, 150-160 chars (string)
- content: Full post in markdown format, minimum 500 words with H2 subheadings (string)
- image_prompt: A vivid DALL-E 3 prompt for the cover image, photorealistic style (string)
- seo_title: SEO-optimized title tag, 55-60 chars max (string)
- seo_description: Meta description, 150-160 chars, include a CTA (string)
- seo_keywords: 5-8 focus keywords, comma-separated (string)

Respond ONLY with the JSON, no other text.`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    const textData = await textRes.json()
    if (!textRes.ok) throw new Error(textData.error?.message || 'GPT-4 post generation failed')
    const blogData = JSON.parse(textData.choices[0].message.content)

    // ── Generate cover image with DALL-E 3 ──────────────────
    let coverImageUrl: string | null = null
    try {
      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${blogData.image_prompt}. Professional blog cover photo, clean modern style, vibrant colors, no text overlay.`,
          n: 1,
          size: '1792x1024',
          quality: 'standard',
        }),
      })
      const imgData = await imgRes.json()
      if (imgRes.ok) coverImageUrl = imgData.data?.[0]?.url
    } catch {
      console.warn('DALL-E image generation failed, continuing without cover image')
    }

    return new Response(JSON.stringify({
      title: blogData.title,
      excerpt: blogData.excerpt,
      content: blogData.content,
      cover_image_url: coverImageUrl,
      seo_title: blogData.seo_title,
      seo_description: blogData.seo_description,
      seo_keywords: blogData.seo_keywords,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('ai-blog-generate error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
