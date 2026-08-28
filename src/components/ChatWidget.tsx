'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Send, 
  Trash2, 
  User, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Copy,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  options?: string[]; // Interactive choice pills
}

interface ChatWidgetProps {
  initialOpen?: boolean;
  inline?: boolean;
}

// Clean 3Knots Branded Consultant Avatar
const AlexAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
  if (size === 'sm') {
    return (
      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-md mt-0.5 border border-amber-300/40 tracking-wider">
        <span>A</span>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50 tracking-wider">
      <span>AL</span>
    </div>
  );
};

export default function ChatWidget({ initialOpen = false, inline = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen || inline);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const hasUserRepliedRef = useRef<boolean>(false);
  const idleFollowupFiredRef = useRef<boolean>(false);

  // Clear all pending automated timers
  const clearAllSequenceTimers = useCallback(() => {
    activeTimersRef.current.forEach(clearTimeout);
    activeTimersRef.current = [];
  }, []);

  // Schedule a timer helper
  const addSequenceTimer = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(fn, delayMs);
    activeTimersRef.current.push(timer);
    return timer;
  }, []);

  // Initialize or restore session
  useEffect(() => {
    let currentId = localStorage.getItem('mph_chat_session_id');
    if (!currentId) {
      currentId = `web_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('mph_chat_session_id', currentId);
    }
    setSessionId(currentId);

    const saved = localStorage.getItem(`mph_chat_msgs_${currentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          // If user already replied in this session, mark as true
          if (parsed.some((m: Message) => m.role === 'user')) {
            hasUserRepliedRef.current = true;
          }
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    
    // Initial opening sequence (Turn 1: Immediate)
    const initialGreeting: Message = {
      id: `init_${Date.now()}_1`,
      role: 'agent',
      text: "Hi there! How are you doing today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([initialGreeting]);

    // Turn 2: Follow-up after 5 seconds of silence
    addSequenceTimer(() => {
      if (!hasUserRepliedRef.current) {
        const secondMsg: Message = {
          id: `init_${Date.now()}_2`,
          role: 'agent',
          text: "Are you looking to get your book published?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: ["Yes", "No", "Maybe"]
        };
        setMessages((prev) => [...prev, secondMsg]);
      }
    }, 5000);

    // Turn 3: Follow-up after further 10 seconds (15s total) of silence
    addSequenceTimer(() => {
      if (!hasUserRepliedRef.current) {
        const thirdMsg: Message = {
          id: `init_${Date.now()}_3`,
          role: 'agent',
          text: "Hi!\nWe are in Atlanta, Georgia!\nAre you looking for the following service:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          options: [
            "Book Publishing",
            "Book Marketing",
            "Formatting",
            "Professional Editing",
            "Proofreading",
            "Ghostwriting",
            "Cover Art Design"
          ]
        };
        setMessages((prev) => [...prev, thirdMsg]);
      }
    }, 15000);

    return () => {
      clearAllSequenceTimers();
    };
  }, [addSequenceTimer, clearAllSequenceTimers]);

  // Save messages to localStorage
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`mph_chat_msgs_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen || inline) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, inline]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !inline) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, inline]);

  // Main message sender
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    // User interacted: permanently stop onboarding timer sequence
    hasUserRepliedRef.current = true;
    clearAllSequenceTimers();

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          platform: 'web',
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const agentMsg: Message = {
          id: `reply_${Date.now()}`,
          role: 'agent',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, agentMsg]);

        // Schedule gentle re-engagement if user goes idle for 45 seconds
        if (!idleFollowupFiredRef.current) {
          addSequenceTimer(() => {
            idleFollowupFiredRef.current = true;
            setMessages((prev) => [
              ...prev,
              {
                id: `idle_${Date.now()}`,
                role: 'agent',
                text: "Still there? Feel free to ask any questions about our publishing roadmap or service options!",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            ]);
          }, 45000);
        }
      } else {
        throw new Error(data.error || 'No response received');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'agent',
        text: "I experienced a brief connection delay. Could you please send that again?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearAllSequenceTimers();
    hasUserRepliedRef.current = false;
    idleFollowupFiredRef.current = false;

    const newId = `web_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('mph_chat_session_id', newId);
    localStorage.removeItem(`mph_chat_msgs_${sessionId}`);
    setSessionId(newId);
    
    // Reset to initial sequence
    const resetGreeting: Message = {
      id: `init_${Date.now()}_1`,
      role: 'agent',
      text: "Hi there! How are you doing today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([resetGreeting]);

    // Re-arm 5s timer
    addSequenceTimer(() => {
      if (!hasUserRepliedRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: `init_${Date.now()}_2`,
            role: 'agent',
            text: "Are you looking to get your book published?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            options: ["Yes", "No", "Maybe"]
          }
        ]);
      }
    }, 5000);

    // Re-arm 15s timer
    addSequenceTimer(() => {
      if (!hasUserRepliedRef.current) {
        setMessages((prev) => [
          ...prev,
          {
            id: `init_${Date.now()}_3`,
            role: 'agent',
            text: "Hi!\nWe are in Atlanta, Georgia!\nAre you looking for the following service:",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            options: [
              "Book Publishing",
              "Book Marketing",
              "Formatting",
              "Professional Editing",
              "Proofreading",
              "Ghostwriting",
              "Cover Art Design"
            ]
          }
        ]);
      }
    }, 15000);

    toast.success('Chat history cleared!');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard', { duration: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Container styling
  const containerClass = inline
    ? 'w-full h-[640px] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden'
    : 'fixed bottom-6 right-6 z-50 flex flex-col w-[390px] sm:w-[430px] h-[600px] max-h-[86vh] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.35)] border border-slate-200/80 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5';

  return (
    <>
      {/* Floating Launcher Button */}
      {!inline && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 pl-3 pr-5 py-3 rounded-full bg-[#090D14] text-white shadow-[0_10px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_35px_rgba(245,158,11,0.4)] hover:scale-[1.03] transition-all duration-300 border border-amber-500/40"
          aria-label="Open Alex Chat"
        >
          <div className="relative">
            <AlexAvatar size="md" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Alex <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/30">Advisor</span>
            </span>
            <span className="text-[11px] text-amber-200/70 font-medium">3Knots Digital • Online</span>
          </div>
        </button>
      )}

      {/* Main Chat Window */}
      {(inline || isOpen) && (
        <div className={containerClass}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#090D14] via-[#141B26] to-[#090D14] text-white px-5 py-4 flex items-center justify-between border-b border-amber-500/30 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlexAvatar size="md" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">Alex</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-400/30">
                    <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-400" /> 3Knots Advisor
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Marketing And Publishing House LLC</p>
              </div>
            </div>

            {/* Actions: Clear Chat & Close/Minimize */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-all flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-medium">Clear</span>
              </button>
              {!inline && (
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize Chat"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                <div
                  className={`group flex items-start gap-2.5 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {msg.role === 'agent' ? (
                    <AlexAvatar size="sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5 ring-2 ring-slate-800">
                      <User className="w-4 h-4 text-amber-400" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm transition-all ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-tr-xs shadow-amber-500/20'
                        : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs shadow-slate-200/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5">
                      <span
                        className={`text-[10px] font-medium ${
                          msg.role === 'user' ? 'text-amber-100' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>

                      {/* Copy Button on Hover */}
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 text-[10px] ${
                          msg.role === 'user' ? 'text-amber-100' : 'text-slate-400'
                        }`}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Choice Options (Clean pills without stickers) */}
                {msg.options && msg.options.length > 0 && !hasUserRepliedRef.current && (
                  <div className="pl-10 flex flex-wrap gap-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {msg.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSendMessage(option)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-500 hover:text-white text-slate-700 text-xs font-bold border border-slate-200 hover:border-amber-500 shadow-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <AlexAvatar size="sm" />
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1.5">Alex is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-slate-200/80 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-slate-100/90 rounded-2xl px-3.5 py-1.5 border border-slate-200/80 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 py-1.5 font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white hover:opacity-95 disabled:opacity-30 transition-all shadow-[0_2px_8px_rgba(245,158,11,0.3)] flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <div className="flex justify-between items-center px-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-medium">Marketing And Publishing House LLC</span>
              <button
                onClick={handleClearChat}
                className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
