// scripts/generate-sitemap.mjs
import fs from 'node:fs'
import path from 'node:path'

// Helper to load local .env if present
function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    } catch (e) {
      console.warn('Note: Could not parse local .env file:', e.message)
    }
  }
}

loadLocalEnv()

const BASE_URL = 'https://geturqr.com'
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '')
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()

async function fetchPublishedBlogPosts() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Generating sitemap with static pages only.')
    return []
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts?status=eq.published&select=slug,updated_at,created_at`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json'
      }
    })

    if (!res.ok) {
      console.warn(`⚠️ Warning: Failed to fetch blog posts (HTTP ${res.status}). Proceeding with static URLs.`)
      return []
    }

    const posts = await res.json()
    return Array.isArray(posts) ? posts : []
  } catch (err) {
    console.warn('⚠️ Could not connect to Supabase to fetch blog posts:', err.message)
    return []
  }
}

async function generateSitemap() {
  console.log('🗺️ Generating XML sitemap...')
  const blogPosts = await fetchPublishedBlogPosts()
  console.log(`📝 Found ${blogPosts.length} published blog posts.`)

  const today = new Date().toISOString().split('T')[0]

  const staticRoutes = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly', lastmod: today },
    { loc: `${BASE_URL}/store`, priority: '0.9', changefreq: 'weekly', lastmod: today },
    { loc: `${BASE_URL}/blog`, priority: '0.9', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/login`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${BASE_URL}/signup`, priority: '0.5', changefreq: 'monthly', lastmod: today }
  ]

  const blogRoutes = blogPosts
    .filter(post => post.slug)
    .map(post => {
      const date = post.updated_at || post.created_at || today
      const formattedDate = new Date(date).toISOString().split('T')[0]
      return {
        loc: `${BASE_URL}/blog/${encodeURIComponent(post.slug)}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: formattedDate
      }
    })

  const allUrls = [...staticRoutes, ...blogRoutes]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(outputPath, xml, 'utf8')
  console.log(`✅ Sitemap successfully written to ${outputPath} (${allUrls.length} URLs indexed)`)
}

generateSitemap()
