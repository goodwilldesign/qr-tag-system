import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the official support assistant for TagLink (a premium QR tag system).
Be helpful, polite, and concise.
TagLink offers two main things:
1. Free Digital Tags: Users can create unlimited digital tags (for pets, kids, luggage, keys) and print them at home.
2. Premium Physical Tags ($9.99): Laser-engraved stainless steel tags, PVC luggage tags, and stickers shipped to their door.
Features: Lost Mode (GPS tracking if authorized), WhatsApp integration.

If the user's issue is complex, they are angry, or they explicitly ask for a human, you MUST invoke the "create_support_ticket" function and ask for their email address if you don't already have it. If they provide an email and want human help, use the function to create a ticket!`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) throw new Error("Missing OPENAI_API_KEY");

    const chatContext = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatContext,
        tools: [
          {
            type: "function",
            function: {
              name: "create_support_ticket",
              description: "Creates a support ticket for the human team to address within 24 hours.",
              parameters: {
                type: "object",
                properties: {
                  email: { type: "string", description: "The user's email address to contact them back." },
                  summary: { type: "string", description: "A 1-sentence summary of their issue." }
                },
                required: ["email", "summary"]
              }
            }
          }
        ],
        tool_choice: "auto",
      }),
    });

    const aiData = await response.json();
    const message = aiData.choices[0].message;

    // Supabase admin client for DB writes
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- ESCALATED TICKET: AI decided to create a support ticket ---
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function.name === 'create_support_ticket') {
        const args = JSON.parse(toolCall.function.arguments);

        await supabaseAdmin.from('support_tickets').insert({
          user_email: args.email,
          issue_summary: args.summary,
          status: 'open',
          transcript: messages
        });

        return new Response(JSON.stringify({ 
          reply: "I've created a support ticket for you. Our human team has the full chat transcript and will email you within 24 hours!",
          ticketCreated: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // --- NORMAL REPLY: Log every conversation so admin can see all chats ---
    const firstUserMsg = messages.find((m: { role: string }) => m.role === 'user') as { content: string } | undefined;
    if (firstUserMsg) {
      const allMessages = [...messages, { role: 'assistant', content: message.content }];
      await supabaseAdmin.from('support_tickets').insert({
        user_email: null,
        issue_summary: '[AI Chat] ' + firstUserMsg.content.slice(0, 100),
        status: 'open',
        transcript: allMessages
      });
    }

    return new Response(JSON.stringify({ 
      reply: message.content,
      ticketCreated: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
