import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Ensure the caller is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error("Unauthorized - Admin Only");

    const { ticket_id, reply_message } = await req.json();

    // Fetch the ticket using Service Role to bypass RLS safely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: ticket, error: fetchErr } = await supabaseAdmin
      .from('support_tickets')
      .select('user_email, issue_summary, transcript, status')
      .eq('id', ticket_id)
      .single();

    if (fetchErr || !ticket) throw new Error("Ticket not found");

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error("Missing RESEND_API_KEY");

    // Attempt to send email via Resend
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #6d28d9;">TagLink Support</h2>
        <p><strong>RE: ${ticket.issue_summary}</strong></p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
          <p style="white-space: pre-wrap; margin: 0;">${reply_message}</p>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
          You can reply directly to this email if you need further assistance.
        </p>
      </div>
    `;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'TagLink Support <onboarding@resend.dev>', // Update this to your verified domain! Ex: support@taglink.com
        to: [ticket.user_email],
        subject: `Re: ${ticket.issue_summary} (TagLink Support)`,
        html: htmlEmail,
      })
    });

    if (!emailResponse.ok) {
      const emailErr = await emailResponse.text();
      console.error("Resend Error:", emailErr);
      throw new Error("Failed to send email. Ensure your Resend account has verified its domains to email anyone.");
    }

    // Update the ticket transcript
    const updatedTranscript = Array.isArray(ticket.transcript) ? [...ticket.transcript] : [];
    updatedTranscript.push({ role: 'admin', content: reply_message });

    const { error: updateErr } = await supabaseAdmin
      .from('support_tickets')
      .update({ transcript: updatedTranscript })
      .eq('id', ticket_id);

    if (updateErr) throw updateErr;

    return new Response(JSON.stringify({ success: true, updatedTranscript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
