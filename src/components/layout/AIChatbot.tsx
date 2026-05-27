'use client';
// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Maya AI Chatbot Component
// Floating support consultant using Gemini 2.5 Flash
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, Loader2,
  HelpCircle, ShoppingBag, Truck, RefreshCw, SendHorizonal, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Suggest a routine', icon: <Sparkles size={11} />, query: 'Suggest a complete skincare routine based on skin concerns.' },
  { label: 'Shipping & Delivery', icon: <Truck size={11} />, query: 'What is your shipping policy, shipping cost, and delivery timeline?' },
  { label: 'About LANAN', icon: <HelpCircle size={11} />, query: 'Tell me about the LANAN brand, where you are based, and what makes you unique.' },
  { label: 'AI Skin Scan', icon: <ArrowUpRight size={11} />, query: 'How does the AI Skin Scan work and how can I start it?' },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('lanan-maya-chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved chat:', e);
      }
    } else {
      // Default initial welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I am **Maya**, your LANAN Skincare Consultant. ✦\nHow can I help you discover your perfect ritual today? Ask me about our premium products, custom routines, or support queries!'
        }
      ]);
    }
  }, []);

  // Save chat history to sessionStorage on change
  const saveMessages = useCallback((newMsgs: Message[]) => {
    setMessages(newMsgs);
    sessionStorage.setItem('lanan-maya-chat', JSON.stringify(newMsgs));
  }, []);

  // Scroll to bottom on message change or expand
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [messages, isOpen]);

  // Handle outside click to close chat window (only on desktop)
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        isOpen &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target as Node) &&
        window.innerWidth >= 640
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    saveMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to connect to Maya.');
      }

      const data = await res.json();
      saveMessages([...updatedMessages, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      toast.error(err.message || 'Maya is currently resting. Please try again shortly.');
      saveMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error connecting to our server. Please check your internet connection and try sending your query again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const resetChat = () => {
    const defaultMsg: Message[] = [
      {
        role: 'assistant',
        content: 'Chat reset! Hello again, I am **Maya**. How can I assist you with your skincare journey today?'
      }
    ];
    saveMessages(defaultMsg);
  };

  // Helper to parse basic markdown links, bold text, and linebreaks
  const parseMessageContent = (text: string) => {
    // Escape HTML tags to prevent XSS
    let sanitized = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle double asterisks for bolding: **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    
    // Find all [Label](URL) markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // Split text by links first
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(sanitized)) !== null) {
      const matchIndex = match.index;
      // Text before the link
      if (matchIndex > lastIndex) {
        const textSegment = sanitized.substring(lastIndex, matchIndex);
        parts.push(renderTextSegment(textSegment, boldRegex));
      }
      
      const label = match[1];
      const url = match[2];
      
      // Is it external?
      const isExternal = url.startsWith('http');
      
      parts.push(
        isExternal ? (
          <a
            key={`link-${matchIndex}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold font-semibold underline hover:text-amber-600 transition-colors mx-0.5 inline-flex items-center gap-0.5"
          >
            {label}
            <ArrowUpRight size={10} />
          </a>
        ) : (
          <Link
            key={`link-${matchIndex}`}
            href={url}
            onClick={() => {
              if (window.innerWidth < 640) setIsOpen(false); // Close on mobile click
            }}
            className="text-gold font-semibold underline hover:text-amber-600 transition-colors mx-0.5"
          >
            {label}
          </Link>
        )
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < sanitized.length) {
      parts.push(renderTextSegment(sanitized.substring(lastIndex), boldRegex));
    }

    return parts;
  };

  // Sub-helper to parse bold text and linebreaks inside a text segment
  const renderTextSegment = (text: string, boldRegex: RegExp) => {
    // Handle bolding and newlines
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const lineParts: React.ReactNode[] = [];
      let lastIdx = 0;
      let boldMatch;
      
      // Reset regex index
      boldRegex.lastIndex = 0;
      
      while ((boldMatch = boldRegex.exec(line)) !== null) {
        const matchIdx = boldMatch.index;
        if (matchIdx > lastIdx) {
          lineParts.push(line.substring(lastIdx, matchIdx));
        }
        lineParts.push(
          <strong key={`bold-${matchIdx}`} className="font-bold text-obsidian dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }
      
      if (lastIdx < line.length) {
        lineParts.push(line.substring(lastIdx));
      }

      return (
        <span key={`line-${lineIdx}`} className="block min-h-[0.5rem]">
          {lineParts.length > 0 ? lineParts : ' '}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating Chat Button ── */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-obsidian text-gold flex items-center justify-center shadow-luxury hover:scale-105 hover:bg-black/90 active:scale-95 transition-all duration-300 relative border border-gold/30 cursor-pointer group"
          whileHover={{ y: -3 }}
          title="Chat with Maya"
          id="maya-chat-trigger"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={20} className="text-gold" />
              </motion.div>
            ) : (
              <motion.div
                key="chat-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <MessageSquare size={20} className="text-gold group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border border-obsidian animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Window Overlay ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-140px)] bg-white border border-beige/60 shadow-luxury rounded-card overflow-hidden flex flex-col"
            id="maya-chat-window"
          >
            {/* Header */}
            <div className="bg-obsidian py-3.5 px-4 flex items-center justify-between border-b border-gold/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold relative">
                  <Sparkles size={16} className="text-gold" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-obsidian" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-light text-ivory tracking-wide leading-none flex items-center gap-1.5">
                    Maya
                  </h3>
                  <p className="text-[10px] font-body text-gold/80 mt-1">LANAN Skincare Advisor</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-1.5 rounded-full hover:bg-white/10 text-ivory/60 hover:text-gold transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory/20 scrollbar-thin">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} items-start gap-2.5`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-[10px] font-bold font-mono">
                        M
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-body leading-relaxed shadow-sm ${
                        isAssistant
                          ? 'bg-white border border-beige/40 text-charcoal rounded-tl-sm'
                          : 'bg-obsidian text-ivory rounded-tr-sm'
                      }`}
                    >
                      {parseMessageContent(msg.content)}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 text-gold text-[10px] font-bold font-mono">
                    M
                  </div>
                  <div className="bg-white border border-beige/40 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin text-gold" />
                    <span className="text-[10px] font-body text-taupe">Maya is composing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips - shown only when input is empty */}
            {input.trim() === '' && !isLoading && (
              <div className="px-4 py-2 bg-ivory/10 border-t border-beige/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.query)}
                    className="inline-flex items-center gap-1.5 bg-white border border-beige/50 hover:border-gold/50 rounded-full px-3 py-1.5 text-[10px] font-body font-medium text-charcoal hover:text-gold hover:shadow-sm transition-all cursor-pointer"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-beige/60 bg-white flex gap-2 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask Maya about routines, products..."
                className="flex-1 bg-ivory/50 border border-beige/60 focus:border-gold focus:outline-none rounded-xl px-4 py-2.5 text-xs font-body text-charcoal transition-all placeholder:text-taupe"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-obsidian text-gold flex items-center justify-center flex-shrink-0 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <SendHorizonal size={14} className="text-gold" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
