import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const messageRecord = payload.record

    if (!messageRecord?.tag_id || !messageRecord?.message) {
      return new Response('Invalid payload', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch the tag info
    const { data: tag, error: tagErr } = await supabase
      .from('tags')
      .select('title, user_id')
      .eq('id', messageRecord.tag_id)
      .single()

    if (tagErr || !tag) {
      console.error('Tag lookup failed:', tagErr)
      return new Response('Tag not found', { status: 404 })
    }

    // 2. Fetch the owner's email
    const { data: { user }, error: userErr } = await supabase.auth.admin.getUserById(tag.user_id)
    if (userErr || !user?.email) {
      console.error('User lookup failed:', userErr)
      return new Response('User not found', { status: 404 })
    }

    const ownerEmail = user.email
    const senderName = messageRecord.sender_name || 'Someone'
    const senderContact = messageRecord.sender_contact || 'None provided'
    
    const subject = `📥 New message for your tag: "${tag.title}"`

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: #3b82f6; border-radius: 12px; padding: 24px; color: white; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">💬 New Message Received</h1>
          <p style="margin: 8px 0 0; opacity: 0.9">Someone left a message regarding your tag.</p>
        </div>
        
        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
          <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">Tag: ${tag.title}</h2>
          
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #334155; font-size: 16px; line-height: 1.5; white-space: pre-wrap;">"${messageRecord.message}"</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 80px;"><strong>From:</strong></td>
              <td style="padding: 8px 0; color: #0f172a;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; border-top: 1px solid #f1f5f9;"><strong>Contact:</strong></td>
              <td style="padding: 8px 0; color: #0f172a; border-top: 1px solid #f1f5f9;">${senderContact}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://geturqr.com/dashboard" style="background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View in Dashboard</a>
        </div>
        
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">Sent by <strong>GetURQR</strong> · <a href="https://geturqr.com" style="color: #94a3b8;">geturqr.com</a></p>
      </div>
    `

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
        from: 'GetURQR Messages <alerts@geturqr.com>', // MUST be a verified domain
        to: [ownerEmail],
        subject,
        html: htmlBody,
      }),
    })

    const emailData = await emailRes.json()
    if (!emailRes.ok) {
      console.error('Resend API error:', emailData)
      return new Response('Email send failed: ' + JSON.stringify(emailData), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
