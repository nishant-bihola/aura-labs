import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm Aura AI. How can I help you accelerate your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Direct call to our backend API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having trouble connecting to my systems right now. Please email us directly at contact@aura-labs.com." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#111] border border-white/10 rounded-2xl w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] mb-4 flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#00f0ff] to-[#0055ff] p-1.5 rounded-full">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm tracking-widest uppercase">Aura AI</h3>
                <p className="text-[#00f0ff] text-[10px] uppercase tracking-widest">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#00f0ff] text-black rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0a0a0a]">
            <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-[#00f0ff]/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/30"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="ml-2 text-[#00f0ff] disabled:opacity-50 hover:text-white transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-[#00f0ff] to-[#0055ff] rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" className="opacity-90" />}
      </button>
    </div>
  );
}
