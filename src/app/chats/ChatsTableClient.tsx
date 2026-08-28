"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, CheckCircle, AlertCircle, X, Clock, FileText, User, ExternalLink, ArrowRight } from "lucide-react";

function formatRelativeDate(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export default function ChatsTableClient({ chats }: { chats: any[] }) {
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  // Helper to parse transcript lines if summaryText looks like a transcript
  const renderTranscript = (summaryText: string) => {
    if (!summaryText) return <p className="text-slate-500 italic">No transcript available.</p>;

    const lines = summaryText.split('\n');
    return (
      <div className="flex flex-col gap-3 mt-3">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          
          const isAI = line.toLowerCase().startsWith('ai agent:') || line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('alex');
          const isVisitor = line.toLowerCase().startsWith('visitor:') || line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('customer:');
          
          if (isAI || isVisitor) {
             const content = line.substring(line.indexOf(':') + 1).trim();
             return (
               <div key={idx} className={`flex gap-2.5 w-full ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                  {isAI && (
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white font-black text-[0.6rem] shadow-xs mt-auto">
                      A
                    </div>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[0.85rem] leading-relaxed max-w-[85%] ${
                    isVisitor 
                      ? 'bg-slate-900 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}>
                    {content}
                  </div>
                  {isVisitor && (
                    <div className="w-7 h-7 shrink-0 rounded-full bg-slate-200 flex items-center justify-center mt-auto">
                      <User size={13} className="text-slate-600" />
                    </div>
                  )}
               </div>
             )
          }
          
          return <p key={idx} className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-50 text-slate-500 text-[0.75rem] font-bold uppercase tracking-[0.05em]">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Lead / Contact</th>
                <th className="px-6 py-4 border-b border-slate-200">AI Summary</th>
                <th className="px-6 py-4 border-b border-slate-200">Outcome</th>
                <th className="px-6 py-4 border-b border-slate-200">Status</th>
                <th className="px-6 py-4 border-b border-slate-200">Date</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[0.9rem] text-slate-700">
              {chats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <MessageCircle size={40} className="text-slate-300" />
                      <p className="font-semibold text-slate-700 text-lg">No web chats recorded yet</p>
                      <p className="text-sm text-slate-400">Incoming text-based chat leads will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                chats.map((chat: any) => {
                  const isSuccess = chat.chatStatus === 'completed' || chat.chatStatus === 'done';
                  
                  return (
                    <tr 
                      key={chat._id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      
                      {/* Lead / Contact */}
                      <td 
                        onClick={() => setSelectedChat(chat)}
                        className="px-6 py-4 border-b border-slate-100 max-w-[200px] cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 truncate">
                            {chat.leadId?.firstName ? `${chat.leadId.firstName} ${chat.leadId.lastName || ''}`.trim() : "Anonymous Visitor"}
                          </span>
                          <span className="text-[0.8rem] text-slate-500 truncate">
                            {chat.platform === 'messenger' ? 'Meta Messenger' : 'Web Chat'}
                          </span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td 
                        onClick={() => setSelectedChat(chat)}
                        className="px-6 py-4 border-b border-slate-100 max-w-[360px] cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 line-clamp-2 text-xs leading-relaxed">
                            {chat.chatSummary || "Click to review transcript or generate AI summary."}
                          </span>
                          <span className="text-[0.7rem] font-mono text-slate-400 mt-1 truncate">
                            ID: {chat.senderPsid || chat._id}
                          </span>
                        </div>
                      </td>

                      {/* Outcome */}
                      <td 
                        onClick={() => setSelectedChat(chat)}
                        className="px-6 py-4 border-b border-slate-100 cursor-pointer"
                      >
                        {chat.chatOutcome ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold whitespace-nowrap">
                            {chat.chatOutcome}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">null</span>
                        )}
                      </td>

                      {/* Status */}
                      <td 
                        onClick={() => setSelectedChat(chat)}
                        className="px-6 py-4 border-b border-slate-100 cursor-pointer"
                      >
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full text-xs font-semibold capitalize">
                            <AlertCircle size={12} />
                            {chat.chatStatus}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td 
                        onClick={() => setSelectedChat(chat)}
                        className="px-6 py-4 border-b border-slate-100 whitespace-nowrap cursor-pointer"
                      >
                        <span className="font-medium text-slate-600 text-xs">
                          {formatRelativeDate(chat.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 border-b border-slate-100 text-right whitespace-nowrap">
                        <Link
                          href={`/chats/${chat._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-400 text-xs font-bold shadow-xs hover:bg-amber-50/50 transition-all"
                        >
                          <span>Full Page</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Slide-Over Panel for Quick Overview */}
      {selectedChat && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setSelectedChat(null)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Chat Preview</h2>
                  <p className="text-[0.75rem] font-medium text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {new Date(selectedChat.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dedicated Page Button Banner */}
            <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-950 block">Complete Chat Intelligence</span>
                <span className="text-[11px] text-slate-600">AI summary, author facts, and voice calling</span>
              </div>
              <Link
                href={`/chats/${selectedChat._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-90 transition-all"
              >
                <span>Open Page</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth space-y-6">
              
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold capitalize ${selectedChat.chatStatus === 'completed' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {selectedChat.chatStatus === 'completed' ? <CheckCircle size={12}/> : null}
                    {selectedChat.chatStatus}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outcome</span>
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {selectedChat.chatOutcome || 'Inquiry'}
                  </span>
                </div>
              </div>

              {/* Summary */}
              {selectedChat.chatSummary && (
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Executive Summary
                  </h3>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedChat.chatSummary}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageCircle size={13} /> Transcript Feed
                </h3>
                {renderTranscript(selectedChat.chatSummary || (selectedChat.messages?.map((m: any) => `${m.role}: ${m.content}`).join('\n')))}
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}
