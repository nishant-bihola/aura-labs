import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, RotateCcw, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  role: 'user' | 'model';
  content: string;
  error?: boolean;
}

const STORAGE_KEY = 'aura_chat_v1';
const GREETING = "Hi! I'm Aura AI. Tell me what you're building and I'll scope it, price it, or book you a call.";

const QUICK_PROMPTS = [
  'What do you build?',
  'Get a price estimate',
  'I want an AI chatbot for my business',
];

// Action chips shown under the latest reply to keep the conversation converting.
const SUGGESTIONS = ['Get a price estimate', 'Book a strategy call', 'See your work'];

/**
 * Minimal markdown renderer for chat bubbles: paragraphs, **bold**, links,
 * and bullet / numbered lists. Avoids pulling a full md library.
 */
function renderBubble(text: string) {
  const renderInline = (line: string, key: number) => {
    // split on **bold** and bare URLs
    const parts = line.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g).filter(Boolean);
    return (
      <React.Fragment key={key}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
          }
          if (/^https?:\/\//.test(part)) {
            return (
              <a key={i} href={part} target="_blank" rel="noreferrer" className="text-[#00f0ff] underline underline-offset-2 break-all">
                {part}
              </a>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </React.Fragment>
    );
  };

  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={key++} className="space-y-1.5 my-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[#00f0ff] shrink-0 mt-px">•</span>
            <span>{renderInline(item, i)}</span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) list.push(bullet[1]);
    else { flushList(); blocks.push(<p key={key++}>{renderInline(line, key)}</p>); }
  }
  flushList();
  return <div className="space-y-2">{blocks}</div>;
}

function TypewriterText({ content, onType, onComplete }: { content: string; onType: () => void; onComplete: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const words = useRef<string[]>([]);
  const currentIndex = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    words.current = content.split(' ');
    currentIndex.current = 0;
    setDisplayText('');
    setIsDone(false);
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      const idx = currentIndex.current;
      if (idx < words.current.length) {
        setDisplayText((prev) => (prev ? prev + ' ' : '') + words.current[idx]);
        currentIndex.current += 1;
        onType();
      } else {
        if (timer.current) clearInterval(timer.current);
        setIsDone(true);
        onComplete();
      }
    }, 22);

    return () => { if (timer.current) clearInterval(timer.current); };
  }, [content, onType, onComplete]);

  const handleSkip = () => {
    if (isDone) return;
    if (timer.current) clearInterval(timer.current);
    setDisplayText(content);
    setIsDone(true);
    onComplete();
  };

  return (
    <div onClick={handleSkip} className="cursor-pointer select-none">
      {renderBubble(displayText)}
      {!isDone && <span className="inline-block w-1.5 h-3.5 bg-[#00f0ff] ml-1 animate-pulse align-middle" />}
    </div>
  );
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* ignore */ }
  return [{ id: 0, role: 'model', content: GREETING }];
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [lastFailed, setLastFailed] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const idCounter = useRef<number>(Math.max(0, ...loadMessages().map((m) => m.id)) + 1);

  const scrollToBottom = useCallback(() => {
    const c = containerRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  // Persist conversation so it survives refresh / navigation.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
  }, [messages]);

  // Lock body scroll on mobile when chat is open (prevents page jump on focus).
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (!isMobile) return;
    const o = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = o.position;
      document.body.style.top = o.top;
      document.body.style.width = o.width;
      document.body.style.overflow = o.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Track virtual keyboard height (mobile) via the Visual Viewport API.
  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv || !window.matchMedia('(pointer: coarse)').matches) return;
      const offset = window.innerHeight - vv.height;
      setKeyboardHeight(offset > 50 ? offset : 0);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isOpen && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setLastFailed(null);
      const userMessage: Message = { id: idCounter.current++, role: 'user', content: trimmed };
      const history = [...messages.filter((m) => !m.error), userMessage];
      setMessages(history);
      setInput('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-20).map(({ role, content }) => ({ role, content })) }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (data?.reply) {
          const id = idCounter.current++;
          setMessages((prev) => [...prev, { id, role: 'model', content: data.reply }]);
          setStreamingId(id);
        } else {
          throw new Error(`Chat API ${response.status}`);
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return; // user stopped — silent
        console.error('Chat error:', error);
        setLastFailed(trimmed);
        setMessages((prev) => [
          ...prev,
          { id: idCounter.current++, role: 'model', error: true, content: "I couldn't reach my systems just now. Tap retry, or email **contact@aura-labs.com**." },
        ]);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading]
  );

  const stop = () => { abortRef.current?.abort(); setIsLoading(false); };

  const resetChat = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStreamingId(null);
    setLastFailed(null);
    idCounter.current = 1;
    setMessages([{ id: 0, role: 'model', content: GREETING }]);
  };

  const lastMsg = messages[messages.length - 1];
  const showSuggestions = !isLoading && !streamingId && lastMsg?.role === 'model' && !lastMsg.error;

  return (
    <div
      className="fixed right-4 sm:right-6 z-[9999] flex flex-col items-end transition-[bottom] duration-150 ease-out"
      style={{ bottom: keyboardHeight > 0 ? `calc(${keyboardHeight}px + 1rem)` : '1rem' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl w-[calc(100vw-2rem)] sm:w-[400px] h-[620px] mb-4 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] origin-bottom-right"
            style={{ maxHeight: keyboardHeight > 0 ? `calc(${window.innerHeight - keyboardHeight}px - 7rem)` : 'calc(100dvh - 7rem)' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00f0ff] blur-[10px] opacity-50 rounded-full" />
                  <div className="bg-gradient-to-br from-[#00f0ff] to-[#0055ff] p-2 rounded-full relative z-10 border border-white/20">
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-serif italic text-base tracking-wide leading-tight">Aura AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse shadow-[0_0_5px_#00f0ff]" />
                    <p className="text-white/50 text-[9px] uppercase tracking-widest font-bold">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button onClick={resetChat} aria-label="New chat"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/60 hover:text-white">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} aria-label="Close chat"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                  <X size={16} className="text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} data-lenis-prevent aria-live="polite"
              className="relative flex-1 overflow-y-auto overscroll-contain p-4 space-y-5 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#00f0ff] to-[#00aaff] text-black rounded-br-sm shadow-[0_5px_15px_rgba(0,240,255,0.2)] font-medium'
                      : msg.error
                        ? 'bg-red-500/10 border border-red-500/20 text-white/90 rounded-bl-sm font-light'
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm font-light'
                  }`}>
                    {msg.role === 'user' ? msg.content
                      : msg.id === streamingId
                        ? <TypewriterText content={msg.content} onType={scrollToBottom} onComplete={() => { setStreamingId(null); scrollToBottom(); }} />
                        : renderBubble(msg.content)}
                  </div>
                </motion.div>
              ))}

              {/* Retry after an error */}
              {lastFailed && !isLoading && (
                <div className="flex justify-start">
                  <button onClick={() => sendMessage(lastFailed)}
                    className="text-xs text-[#00f0ff] border border-[#00f0ff]/40 bg-[#00f0ff]/10 rounded-full px-4 py-2 hover:bg-[#00f0ff]/20 transition-colors">
                    ↻ Retry
                  </button>
                </div>
              )}

              {/* First-open quick prompts */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col items-start gap-2 pt-1">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-left text-xs text-white/70 border border-white/15 bg-white/[0.03] rounded-full px-4 py-2 hover:border-[#00f0ff]/60 hover:text-white hover:bg-[#00f0ff]/10 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Contextual suggestions after a reply */}
              {showSuggestions && messages.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs text-white/60 border border-white/10 bg-white/[0.03] rounded-full px-3.5 py-1.5 hover:border-[#00f0ff]/60 hover:text-white hover:bg-[#00f0ff]/10 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-4 flex gap-1.5 items-center">
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.div key={d} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: d }} className="w-1.5 h-1.5 bg-[#00f0ff]/60 rounded-full" />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <div className="relative flex items-end bg-white/5 rounded-[22px] px-4 py-1.5 border border-white/10 focus-within:border-[#00f0ff]/50 focus-within:bg-white/10 transition-all duration-300">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask me anything…"
                  maxLength={1000}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30 py-2 font-light resize-none max-h-[120px] custom-scrollbar"
                />
                {isLoading ? (
                  <button onClick={stop} aria-label="Stop generating"
                    className="ml-2 mb-1 w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                    <Square size={13} fill="currentColor" />
                  </button>
                ) : (
                  <button onClick={() => sendMessage(input)} disabled={!input.trim()} aria-label="Send message"
                    className="ml-2 mb-1 w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-[#00f0ff]/10 text-[#00f0ff] disabled:opacity-50 disabled:bg-transparent hover:bg-[#00f0ff] hover:text-black transition-colors">
                    <Send size={14} className="ml-0.5" />
                  </button>
                )}
              </div>
              <p className="text-[8px] uppercase tracking-widest text-center text-white/30 mt-3 font-bold">Powered by Aura AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <div className="relative group">
        {!isOpen && (
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[#00f0ff] rounded-full blur-[20px] opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
        <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className="relative z-10 w-14 h-14 bg-gradient-to-br from-[#00f0ff] to-[#0055ff] border border-white/20 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform duration-300">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <MessageSquare size={24} fill="currentColor" className="opacity-90" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
