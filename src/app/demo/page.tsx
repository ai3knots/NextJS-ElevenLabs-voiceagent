'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation, ConversationProvider } from '@elevenlabs/react';

type Message = {
  id: string;
  role: 'user' | 'agent';
  content: string;
};

function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const { startSession, endSession, sendUserMessage, status, onError } = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs Agent');
      setSessionStarted(true);
      setIsSubmitting(false);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setSessionStarted(false);
      
      const chatHistory = messagesRef.current;
      if (chatHistory.length > 0) {
        fetch('/api/chats/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory })
        }).catch(console.error);
      }

      setMessages([]);
      setIsSubmitting(false);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('ElevenLabs Error:', error);
      setIsTyping(false);
      setIsSubmitting(false);
    },
    onMessage: (msg) => {
      // Only append AI messages from the server, we handle User messages optimistically
      if (msg.source === 'ai') {
        // Keep typing indicator on while we artificially delay
        setIsTyping(true);
        
        // Add artificial delay between 1.5s and 3s to simulate typing
        const delay = 1500 + Math.random() * 1500;
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            role: 'agent',
            content: msg.message
          }]);
          setIsTyping(false);
        }, delay);
      }
    },
    onAgentTyping: () => {
      setIsTyping(true);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      await startSession({
        agentId: 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa', // Provided Agent ID
        // @ts-expect-error textOnly is supported by the underlying client but might be missing in react types
        textOnly: true,
        dynamicVariables: {
          is_chat: "true"
        }
      });
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'connected') return;

    const userText = input.trim();
    setInput('');
    
    // Optimistic UI for User Message
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: userText
    }]);
    
    setIsTyping(true);
    
    // Send to ElevenLabs agent
    sendUserMessage(userText);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-0 m-0 w-full overflow-hidden font-sans">
      
      {/* Premium Header */}
      <header className="w-full h-16 sm:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-10 flex items-center justify-between px-6 sm:px-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-5 border-r border-slate-200">
            <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[1.25rem] shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
              3K
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-800 text-[1.1rem] tracking-tight leading-tight">3knot</span>
              <span className="text-[0.7rem] font-bold text-sky-500 uppercase tracking-widest leading-none mt-[-2px]">Digital Chat</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {status === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Online</span>
                </>
              ) : status === 'connecting' || isSubmitting ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        {status === 'connected' && (
          <button 
            onClick={() => endSession()}
            className="text-xs font-semibold text-slate-500 hover:text-rose-500 transition-colors"
          >
            End Chat
          </button>
        )}
      </header>

      {/* Chat Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 sm:p-8 overflow-y-auto scroll-smooth">
        {!sessionStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-[-5vh]">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[2.5rem] shadow-[0_8px_24px_rgba(99,102,241,0.4)] mb-6">
              3K
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">3knot Digital Chat</h2>
            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
              Start a conversation with our intelligent AI assistant to get answers to your questions instantly.
            </p>
            
            <button
              onClick={handleStart}
              disabled={status === 'connecting' || isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(status === 'connecting' || isSubmitting) ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Connecting...</>
              ) : (
                'Start Chat'
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full pb-32">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Agent Avatar */}
                  {msg.role === 'agent' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[0.8rem] shadow-[0_2px_8px_rgba(99,102,241,0.3)] mt-auto">
                      3K
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-[0.95rem] sm:text-base leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-br-none'
                      : 'bg-white border border-slate-200/70 text-slate-700 rounded-bl-none shadow-slate-200/50'
                      }`}
                  >
                    {msg.content}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center mt-auto">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 w-full justify-start items-center text-slate-400"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[0.8rem] shadow-[0_2px_8px_rgba(99,102,241,0.3)] mt-auto">
                  3K
                </div>
                <div className="flex items-center gap-1.5 px-5 py-4 bg-white border border-slate-200/70 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                  <span className="text-sm font-medium ml-2 tracking-wide text-slate-500">typing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        )}
      </main>

      {/* Input Area */}
      {sessionStarted && (
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pb-6 pt-10 px-4 sm:px-8 pointer-events-none z-20">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto relative">
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white rounded-3xl sm:rounded-[2rem] shadow-xl shadow-slate-300/40 border border-slate-200/80 p-2 sm:p-2.5 flex items-end gap-3 transition-all focus-within:ring-4 focus-within:ring-[#06b6d4]/10 focus-within:border-[#06b6d4]/40"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message the agent..."
                className="flex-1 max-h-32 min-h-[50px] resize-none bg-transparent border-transparent focus:border-transparent focus:ring-0 focus:outline-none outline-none text-slate-700 text-[0.95rem] sm:text-base px-4 py-3 sm:py-3.5 placeholder:text-slate-400 font-medium"
                rows={1}
                disabled={isTyping || status !== 'connected'}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || status !== 'connected'}
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center hover:from-slate-700 hover:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
            <div className="w-full text-center mt-3">
              <p className="text-[0.65rem] sm:text-xs text-slate-400 font-medium tracking-wide">
                AI-generated responses. Powered by 3knot & ElevenLabs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoChatPageWrapper() {
  return (
    <ConversationProvider>
      <ChatUI />
    </ConversationProvider>
  );
}
