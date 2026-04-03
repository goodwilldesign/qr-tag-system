import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY     = Deno.env.get('RESEND_API_KEY')!;
const MSG91_AUTH_KEY     = Deno.env.get('MSG91_AUTH_KEY')!;
const MSG91_TEMPLATE_ID  = Deno.env.get('MSG91_TEMPLATE_ID')!;
const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { tag_id } = await req.json();
    if (!tag_id) return new Response(JSON.stringify({ error: 'tag_id required' }), { status: 400 });

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch tag + emergency_contacts
    const { data: tag, error: tagErr } = await db
      .from('tags')
      .select('id, title, type, data, emergency_contacts, user_id')
      .eq('id', tag_id)
      .single();

    if (tagErr || !tag) {
      return new Response(JSON.stringify({ error: 'Tag not found' }), { status: 404 });
    }

    if (!tag.emergency_contacts || tag.emergency_contacts.length === 0) {
      return new Response(JSON.stringify({ message: 'No contacts' }), { status: 200 });
    }

    // Fetch owner profile
    const { data: profile } = await db
      .from('profiles')
      .select('full_name')
      .eq('id', tag.user_id)
      .single();

    const ownerName = profile?.full_name || 'The owner';
    const petName   = tag.data?.pet_name || tag.data?.item_name || tag.title;
    const tagLink   = `https://geturqr.com/tag/${tag.id}`;

    const results = { email: 0, sms: 0, errors: [] as string[] };

    for (const contact of tag.emergency_contacts) {
      if (!contact.name) continue;

      // ── Email via Resend ──
      if (contact.email) {
        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:#fef2f2;border-bottom:3px solid #ef4444;padding:20px 24px;">
              <p style="margin:0;font-size:20px;font-weight:900;color:#dc2626;">🚨 Emergency Alert</p>
              <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">GetURQR Lost Mode Activated</p>
            </div>
            <div style="padding:24px;">
              <p style="font-size:15px;color:#334155;">Hi <strong>${contact.name}</strong>,</p>
              <p style="font-size:14px;color:#334155;line-height:1.7;">
                <strong>${ownerName}</strong> has activated <strong>Lost Mode</strong> on their 
                GetURQR tag for <strong>"${petName}"</strong>.<br/>
                If you spot it, please scan the QR code or click the button below to help return it.
              </p>
            </div>
            <div style="padding:0 24px 24px;text-align:center;">
              <a href="${tagLink}" style="display:inline-block;background:#dc2626;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none;">
                🔍 View Tag Details
              </a>
              <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;">This alert was sent by GetURQR on behalf of ${ownerName}.</p>
            </div>
          </div>
        `;
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'GetURQR Alerts <alerts@geturqr.com>',
            to: [contact.email],
            subject: `🚨 ${petName} has been reported lost! — GetURQR`,
            html,
          }),
        });
        if (r.ok) results.email++; else results.errors.push(`Email failed for ${contact.email}`);
      }

      // ── SMS via MSG91 ──
      if (contact.phone && MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
        // Normalize to E.164 without +
        const phone = contact.phone.replace(/[^0-9]/g, '');
        const body = {
          template_id: MSG91_TEMPLATE_ID,
          sender: 'GETURQR',
          short_url: '0',
          mobiles: phone,
          owner_name: ownerName,
          pet_name: petName,
          tag_link: tagLink,
        };
        const r = await fetch('https://control.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'authkey': MSG91_AUTH_KEY,
            'content-type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (r.ok) results.sms++; else results.errors.push(`SMS failed for ${phone}`);
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
