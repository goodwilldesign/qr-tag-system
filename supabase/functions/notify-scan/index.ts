import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const scan = payload.record  // The new tag_scans row

    if (!scan?.tag_id) {
      return new Response('No tag_id in payload', { status: 400 })
    }

    // Create a Supabase client using the service role key (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Look up the tag to get title and user_id
    const { data: tag, error: tagErr } = await supabase
      .from('tags')
      .select('title, type, user_id, is_lost')
      .eq('id', scan.tag_id)
      .single()

    if (tagErr || !tag) {
      console.error('Tag lookup failed:', tagErr)
      return new Response('Tag not found', { status: 404 })
    }

    // 2. Look up the owner's email from auth.users
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(tag.user_id)
    if (userErr || !user?.email) {
      console.error('User lookup failed:', userErr)
      return new Response('User not found', { status: 404 })
    }

    const ownerEmail = user.email

    // 3. Build email content
    const isLost = tag.is_lost
    const subject = isLost
      ? `🚨 URGENT: Your LOST tag "${tag.title}" was just scanned!`
      : `📍 Your QR tag "${tag.title}" was just scanned`

    const locationInfo = scan.latitude && scan.longitude
      ? `<p>📍 <strong>Scanner's Location:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${scan.latitude},${scan.longitude}">View on Google Maps</a></p>`
      : `<p>📍 Location was not shared by the scanner.</p>`

    const timeStr = new Date(scan.scanned_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: ${isLost ? '#ef4444' : '#7c3aed'}; border-radius: 12px; padding: 24px; color: white; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">${isLost ? '🚨 Lost Tag Scanned!' : '📦 Tag Scanned!'}</h1>
          <p style="margin: 8px 0 0; opacity: 0.9">Your GetURQR QR code is in use.</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b;">${tag.title}</h2>
          <p style="color: #64748b; margin: 4px 0;"><strong>Time:</strong> ${timeStr} (IST)</p>
          ${locationInfo}
        </div>

        ${isLost ? `
        <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
          <p style="color: #dc2626; font-weight: bold; margin: 0;">Your item is marked as LOST. Someone may be trying to help!</p>
          <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">Go to your dashboard to see if they left a location.</p>
        </div>
        ` : ''}

        <p style="text-align: center; color: #94a3b8; font-size: 12px;">Sent by <strong>GetURQR</strong> · You can disable scan notifications in your tag settings.</p>
      </div>
    `

    // 4. Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set')
      return new Response('Email service not configured', { status: 500 })
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GetURQR Alerts <alerts@geturqr.com>',
        to: [ownerEmail],
        subject,
        html: htmlBody,
      }),
    })

    const emailData = await emailRes.json()
    if (!emailRes.ok) {
      console.error('Resend API error:', emailData)
      return new Response('Email send failed', { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
