import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const TYPE_STYLES: Record<string, { emoji: string; color: string; bgColor: string }> = {
  info:    { emoji: 'ℹ️',  color: '#2563eb', bgColor: '#eff6ff' },
  warning: { emoji: '⚠️', color: '#d97706', bgColor: '#fffbeb' },
  success: { emoji: '✅', color: '#059669', bgColor: '#f0fdf4' },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { title, body, type = 'info' } = await req.json();
    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body required' }), { status: 400 });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch all active (non-suspended) profiles
    const { data: profiles, error: profileErr } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .eq('is_suspended', false);

    if (profileErr) throw profileErr;

    // Get emails from auth admin API
    const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const emailMap: Record<string, string> = {};
    (authData?.users || []).forEach((u) => { emailMap[u.id] = u.email || ''; });

    const style = TYPE_STYLES[type] || TYPE_STYLES.info;
    let sent = 0;

    for (const profile of profiles || []) {
      const email = emailMap[profile.id];
      if (!email) continue;

      const html = `
        <div style="font-family: sans-serif; max-width: 560px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: ${style.bgColor}; border-bottom: 2px solid ${style.color}33; padding: 20px 24px;">
            <p style="margin:0; font-size: 16px; font-weight: 800; color: ${style.color};">${style.emoji} ${title}</p>
            <p style="margin:4px 0 0; font-size: 12px; color: #94a3b8;">GetURQR Platform Update</p>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 14px; color: #334155; line-height: 1.8; white-space: pre-wrap;">${body}</p>
          </div>
          <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
            <a href="https://geturqr.com/dashboard" style="display: inline-block; background: #7c3aed; color: #fff; font-weight: 700; font-size: 13px; padding: 10px 24px; border-radius: 10px; text-decoration: none;">Go to Dashboard</a>
            <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">You received this because you have a GetURQR account.</p>
          </div>
        </div>
      `;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GetURQR <noreply@geturqr.com>',
          to: [email],
          subject: `${style.emoji} ${title}`,
          html,
        }),
      });
      sent++;
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
