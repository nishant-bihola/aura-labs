import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  'What do you build?',
  'How much does a project cost?',
  'I want an AI chatbot for my business',
];

/**
 * Minimal markdown renderer for chat bubbles: paragraphs, **bold**,
 * and bullet / numbered lists. Avoids pulling a full md library.
 */
function renderBubble(text: string) {
  const renderInline = (line: string, key: number) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return (
      <React.Fragment key={key}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
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
    if (!line) {
      flushList();
      continue;
    }
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
    } else {
      flushList();
      blocks.push(<p key={key++}>{renderInline(line, key)}</p>);
    }
  }
  flushList();
  return <div className="space-y-2">{blocks}</div>;
}

interface TypewriterTextProps {
  content: string;
  onType: () => void;
  onComplete: () => void;
}

function TypewriterText({ content, onType, onComplete }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const words = useRef<string[]>([]);
  const currentIndex = useRef(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    words.current = content.split(' ');
    currentIndex.current = 0;
    setDisplayText('');
    setIsDone(false);

    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      if (currentIndex.current < words.current.length) {
        setDisplayText((prev) => (prev ? prev + ' ' : '') + words.current[currentIndex.current]);
        currentIndex.current += 1;
        onType();
      } else {
        if (timer.current) clearInterval(timer.current);
        setIsDone(true);
        onComplete();
      }
    }, 25);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
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
      {!isDone && (
        <span className="inline-block w-1.5 h-3.5 bg-[#00f0ff] ml-1 animate-pulse" />
      )}
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Aura AI. How can I help you accelerate your business today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    const c = containerRef.current;
    if (c) {
      c.scrollTop = c.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // focus the input when opening (desktop only — avoid popping the
  // mobile keyboard over the freshly opened panel)
  useEffect(() => {
    if (isOpen && window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Esc closes the panel
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

      const userMessage: Message = { role: 'user', content: trimmed };
      const history = [...messages, userMessage];
      setMessages(history);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // cap context so long sessions stay fast and cheap
          body: JSON.stringify({ messages: history.slice(-20) }),
        });

        // the API returns a human-readable `reply` even on errors
        // (e.g. missing API key) — surface it instead of swallowing it
        const data = await response.json().catch(() => null);
        if (data?.reply) {
          setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
        } else {
          throw new Error(`Chat API ${response.status}`);
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content:
              "I'm having trouble connecting to my systems right now. Please email us directly at contact@aura-labs.com.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl w-[calc(100vw-2rem)] sm:w-[400px] h-[620px] max-h-[calc(100dvh-7rem)] mb-4 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.1)] origin-bottom-right"
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
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                <X size={16} className="text-white/70" />
              </button>
            </div>

            {/* Messages — data-lenis-prevent stops the page's smooth
                scroller from hijacking wheel/touch inside the pane */}
            <div
              ref={containerRef}
              data-lenis-prevent
              className="relative flex-1 overflow-y-auto overscroll-contain p-4 space-y-5 custom-scrollbar"
            >
              {messages.map((msg, idx) => {
                const isLatestModel = idx === messages.length - 1 && msg.role === 'model' && messages.length > 1;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    data-msg
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#00f0ff] to-[#00aaff] text-black rounded-br-sm shadow-[0_5px_15px_rgba(0,240,255,0.2)] font-medium'
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm font-light'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : isLatestModel ? (
                        <TypewriterText
                          content={msg.content}
                          onType={scrollToBottom}
                          onComplete={scrollToBottom}
                        />
                      ) : (
                        renderBubble(msg.content)
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Quick prompts — first open only */}
              {messages.length === 1 && !isLoading && (
                <div className="flex flex-col items-start gap-2 pt-1">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left text-xs text-white/70 border border-white/15 bg-white/[0.03] rounded-full px-4 py-2 hover:border-[#00f0ff]/60 hover:text-white hover:bg-[#00f0ff]/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-4 flex gap-1.5 items-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#00f0ff]/60 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#00f0ff]/60 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#00f0ff]/60 rounded-full" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <div className="relative flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 focus-within:border-[#00f0ff]/50 focus-within:bg-white/10 transition-all duration-300">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && sendMessage(input)}
                  placeholder="Ask me anything..."
                  maxLength={1000}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30 py-2 font-light"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#00f0ff]/10 text-[#00f0ff] disabled:opacity-50 disabled:bg-transparent hover:bg-[#00f0ff] hover:text-black transition-colors"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
              <p className="text-[8px] uppercase tracking-widest text-center text-white/30 mt-3 font-bold">Powered by Aura Gemini Intelligence</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button with Pulsing Aura */}
      <div className="relative group">
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-[#00f0ff] rounded-full blur-[20px] opacity-50 group-hover:opacity-100 transition-opacity"
          />
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
          className="relative z-10 w-14 h-14 bg-gradient-to-br from-[#00f0ff] to-[#0055ff] border border-white/20 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-110 transition-transform duration-300"
        >
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
