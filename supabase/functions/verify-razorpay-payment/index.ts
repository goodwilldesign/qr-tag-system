import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      store_order_id 
    } = await req.json()

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!keySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay secret not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ── Verify HMAC-SHA256 Signature ─────────────────
    // Razorpay signs: order_id + "|" + payment_id
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = hmac('sha256', keySecret, body, 'utf8', 'hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch!', { expectedSignature, razorpay_signature })
      return new Response(JSON.stringify({ error: 'Invalid payment signature. Payment may be tampered.' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ── Signature valid — update the order in Supabase ───
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateErr } = await supabase
      .from('store_orders')
      .update({
        status: 'paid',
        payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', store_order_id)

    if (updateErr) {
      console.error('Failed to update order:', updateErr)
      return new Response(JSON.stringify({ error: 'Payment verified but could not update order. Contact support.' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    return new Response(JSON.stringify({ success: true, payment_id: razorpay_payment_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
