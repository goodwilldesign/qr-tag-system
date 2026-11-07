// scripts/supabase-keepalive.mjs
import fs from 'node:fs'
import path from 'node:path'

// Helper to load .env variables if running locally without environment variables set
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

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '')
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()
const supabaseAccessToken = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment or .env file.')
  console.error('Please configure SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).')
  process.exit(1)
}

// Extract project reference ID (e.g., https://jiviwfnidyvqirzlpfbe.supabase.co -> jiviwfnidyvqirzlpfbe)
const projectRefMatch = supabaseUrl.match(/^https?:\/\/([^.]+)\.supabase\.co/)
const projectRef = projectRefMatch ? projectRefMatch[1] : null

console.log(`📡 Pinging Supabase instance: ${supabaseUrl}`)
if (projectRef) {
  console.log(`🆔 Project Reference: ${projectRef}`)
}

async function restoreProject(ref, token) {
  console.log(`⚡ Attempting auto-restore via Supabase Management API for project: ${ref}...`)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (res.ok) {
      console.log('✅ Restore request submitted successfully! The database is now waking up.')
      return true
    } else {
      const errText = await res.text()
      console.error(`⚠️ Failed to trigger auto-restore (HTTP ${res.status}): ${errText}`)
      return false
    }
  } catch (err) {
    console.error('⚠️ Network error calling Management API restore endpoint:', err.message)
    return false
  }
}

async function pingDatabase() {
  const pingEndpoint = `${supabaseUrl}/rest/v1/tags?select=id&limit=1`
  
  try {
    const response = await fetch(pingEndpoint, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json'
      }
    })

    const bodyText = await response.text()

    if (response.ok) {
      console.log(`✅ [SUCCESS] Keep-alive ping successful! (HTTP ${response.status})`)
      console.log('🎉 Supabase database is active. 7-day inactivity timer has been successfully reset.')
      return
    }

    console.warn(`⚠️ Warning: Received HTTP ${response.status} from Supabase REST API: ${bodyText}`)

    // Check if the response indicates the project is paused (HTTP 503 or specific error text)
    const isPaused = response.status === 503 || bodyText.toLowerCase().includes('paused') || bodyText.toLowerCase().includes('inactive')

    if (isPaused) {
      console.log('🚨 Supabase project appears to be PAUSED!')
      if (projectRef && supabaseAccessToken) {
        await restoreProject(projectRef, supabaseAccessToken)
      } else {
        console.log('\n💡 To enable automatic unpausing, add your SUPABASE_ACCESS_TOKEN:')
        console.log('   1. Generate token at: https://supabase.com/dashboard/account/tokens')
        console.log('   2. Add it to GitHub Secrets or environment variables as SUPABASE_ACCESS_TOKEN.')
        console.log('   Or manually click "Restore project" in the Supabase Dashboard.\n')
      }
    } else {
      console.log('ℹ️ Server responded with a non-200 status, but PostgREST was reachable. Activity has been registered.')
    }
  } catch (err) {
    console.error('❌ Connection error while pinging Supabase:', err.message)
    if (projectRef && supabaseAccessToken) {
      console.log('Attempting restore endpoint just in case project was stopped...')
      await restoreProject(projectRef, supabaseAccessToken)
    } else {
      process.exit(1)
    }
  }
}

await pingDatabase()
