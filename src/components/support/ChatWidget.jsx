import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, X, Send, Bot, User, Loader2, CheckCircle2, Clock } from 'lucide-react';

const IDLE_WARN_MS  = 35000; // 35s → show "still there?"
const IDLE_CLOSE_MS = 15000; // 15s more → auto-close

// Lightweight markdown → HTML renderer for AI responses
function renderMarkdown(text) {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(\d+\.\s)/g, '<br/><span class="font-semibold text-slate-600">$1</span>')
    .replace(/^\s*-\s/gm, '<br/>• ')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return html.replace(/^<br\/>/, '');
}

// Generate a simple session ID
function makeSessionId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// Upsert the transcript so it updates in-place after every reply
async function upsertTranscript(sessionId, msgs, visitorEmail, visitorName, visitorWhatsapp) {
  const userMsgs = msgs.filter(m => m.role === 'user');
  if (userMsgs.length === 0) return;
  const { data: { session } } = await supabase.auth.getSession();
  const userEmail = session?.user?.email ?? visitorEmail ?? null;
  const label = visitorName ? `[AI Chat] ${visitorName}: ` : '[AI Chat] ';
  const { error } = await supabase.from('support_tickets').upsert({
    session_id: sessionId,
    user_email: userEmail,
    visitor_name: visitorName || null,
    visitor_whatsapp: visitorWhatsapp || null,
    issue_summary: label + userMsgs[0].content.slice(0, 90),
    status: 'open',
    transcript: msgs,
  }, { onConflict: 'session_id' });
  if (error) {
    console.error('❌ Chat save failed:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Chat saved as:', userEmail ?? visitorName ?? 'anonymous');
  }
}

export default function ChatWidget() {
  const [isOpen, setIsOpen]           = useState(false);
  const [guestReady, setGuestReady]   = useState(false); // true if logged-in or form submitted
  const [visitorInfo, setVisitorInfo] = useState({ name: '', email: '', whatsapp: '' });
  const [guestForm, setGuestForm]     = useState({ name: '', email: '', whatsapp: '' });
  const [messages, setMessages]       = useState([
    { role: 'assistant', content: "Hi! I'm TagLink's AI Assistant. How can I help you today?" }
  ]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [idleState, setIdleState]     = useState('active');
  const [countdown, setCountdown]     = useState(IDLE_CLOSE_MS / 1000);
  const sessionIdRef                  = useRef(makeSessionId());
  const messagesRef                   = useRef(messages);
  const idleTimerRef                  = useRef(null);
  const closeTimerRef                 = useRef(null);
  const countdownRef                  = useRef(null);
  const messagesEndRef                = useRef(null);
  const visitorInfoRef                = useRef(visitorInfo);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { visitorInfoRef.current = visitorInfo; }, [visitorInfo]);

  // When chat opens: check if user is logged in; skip form if yes
  useEffect(() => {
    if (!isOpen) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setVisitorInfo({ email: session.user.email, whatsapp: '' });
        setGuestReady(true);
      } else {
        setGuestReady(false);
      }
    });
  }, [isOpen]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, idleState]);

  // ── Save & close helpers ────────────────────────────────────────────
  const clearAllTimers = () => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(closeTimerRef.current);
    clearInterval(countdownRef.current);
  };

  const doSaveAndClose = useCallback(async () => {
    clearAllTimers();
    await upsertTranscript(sessionIdRef.current, messagesRef.current, visitorInfoRef.current.email, visitorInfoRef.current.name);
    setIdleState('closed');
    setIsOpen(false);
    setTimeout(() => {
      setMessages([{ role: 'assistant', content: "Hi! I'm TagLink's AI Assistant. How can I help you today?" }]);
      setTicketCreated(false);
      setIdleState('active');
      setCountdown(IDLE_CLOSE_MS / 1000);
      sessionIdRef.current = makeSessionId(); // fresh session next time
    }, 800);
  }, []);

  // ── Idle timer management ───────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    clearAllTimers();
    setIdleState('active');
    setCountdown(IDLE_CLOSE_MS / 1000);
    idleTimerRef.current = setTimeout(() => {
      setIdleState('warn');
      let secs = IDLE_CLOSE_MS / 1000;
      setCountdown(secs);
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) clearInterval(countdownRef.current);
      }, 1000);
      closeTimerRef.current = setTimeout(() => doSaveAndClose(), IDLE_CLOSE_MS);
    }, IDLE_WARN_MS);
  }, [doSaveAndClose]);

  // Start idle timer when chat opens; clear when closed
  useEffect(() => {
    if (isOpen) {
      resetIdleTimer();
    } else {
      clearAllTimers();
    }
    return clearAllTimers;
  }, [isOpen, resetIdleTimer]);

  // ── Send message ────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading || ticketCreated) return;
    resetIdleTimer(); // user is active

    const userMsg    = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('support-bot', {
        body: { messages: newHistory }
      });
      if (error) throw error;
      if (data?.reply) {
        const updatedMsgs = [...newHistory, { role: 'assistant', content: data.reply }];
        setMessages(updatedMsgs);
        // ✅ Save immediately after every AI reply
        await upsertTranscript(sessionIdRef.current, updatedMsgs, visitorInfoRef.current.email, visitorInfoRef.current.name);
      }
      if (data?.ticketCreated) {
        setTicketCreated(true);
        clearAllTimers();
        sessionIdRef.current = makeSessionId();
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops! Something went wrong. Please try again later.'
      }]);
    } finally {
      setLoading(false);
      resetIdleTimer();
    }
  };

  // ── Manual close (X button) ─────────────────────────────────────────
  const handleClose = async () => {
    clearAllTimers();
    await upsertTranscript(sessionIdRef.current, messagesRef.current, visitorInfoRef.current.email, visitorInfoRef.current.name);
    setIsOpen(false);
    setTimeout(() => {
      setMessages([{ role: 'assistant', content: "Hi! I'm TagLink's AI Assistant. How can I help you today?" }]);
      setTicketCreated(false);
      setIdleState('active');
      setCountdown(IDLE_CLOSE_MS / 1000);
      sessionIdRef.current = makeSessionId();
    }, 400);
  };

  // ── "Still there?" actions ──────────────────────────────────────────
  const handleStillHere = () => resetIdleTimer();

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed p-4 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 hover:scale-110 transition-all z-50 bottom-24 left-4 sm:bottom-6 sm:left-auto sm:right-6 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30"></span>
        <MessageCircle size={28} className="relative z-10" />
      </button>

      {/* Chat Window */}
      <div className={`fixed w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 bottom-24 left-4 origin-bottom-left sm:bottom-6 sm:left-auto sm:right-6 sm:origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>

        {/* Header */}
        <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">GetURQR Assistant</h3>
              <p className="text-violet-200 text-xs mt-0.5">AI Assistant &amp; Ticketing</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors" title="Close chat">
            <X size={20} />
          </button>
        </div>

        {/* ── Guest welcome form (anonymous only) ── */}
        {!guestReady ? (
          <div className="flex-1 flex flex-col justify-center p-6 bg-slate-50">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
                <Bot size={28} className="text-violet-600" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Before we start…</h3>
              <p className="text-slate-500 text-xs mt-1">Share your details so we can follow up if needed.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setVisitorInfo(guestForm);
                setGuestReady(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  placeholder="Your name"
                  value={guestForm.name}
                  onChange={e => setGuestForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email" required
                  placeholder="you@example.com"
                  value={guestForm.email}
                  onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">WhatsApp Number <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestForm.whatsapp}
                  onChange={e => setGuestForm(f => ({ ...f, whatsapp: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm mt-2"
              >
                Start Chatting →
              </button>
            </form>
          </div>
        ) : (

        /* ── Messages ── */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-violet-100 text-violet-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.role === 'assistant'
                  ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  : msg.content
                }
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm">
                <Loader2 size={16} className="animate-spin text-violet-500" />
              </div>
            </div>
          )}

          {/* ── Idle Warning ── */}
          {idleState === 'warn' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-amber-800 max-w-[80%]">
                <div className="bg-slate-100 text-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm font-medium border border-slate-200">
                  Welcome to GetURQR! How can we help you today?
                </div>
                <p className="text-xs text-amber-600 mb-3">Chat will close in <strong>{countdown}s</strong> due to inactivity.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleStillHere}
                    className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Yes, I'm here!
                  </button>
                  <button
                    onClick={doSaveAndClose}
                    className="flex-1 py-1.5 bg-white hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition-colors"
                  >
                    End Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        )} {/* end guestReady ternary */}

        {/* Ticket Created Banner */}
        {guestReady && ticketCreated && (
          <div className="bg-emerald-50 p-4 border-t border-emerald-100 shrink-0 text-center">
            <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-800 mb-1">Support Ticket Created!</p>
            <p className="text-xs text-emerald-600">Our team has been notified. We'll reply within 24 hours.</p>
          </div>
        )}

        {/* Input */}
        {guestReady && !ticketCreated && idleState !== 'closed' && (
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={resetIdleTimer}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center disabled:opacity-50 disabled:hover:bg-violet-600 transition-all shrink-0 shadow-sm"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </>
  );
}
