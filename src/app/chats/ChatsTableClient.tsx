"use client";

import React, { useState } from "react";
import { MessageCircle, CheckCircle, AlertCircle, X, Clock, FileText, User, Bot } from "lucide-react";

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

  // Helper to parse transcript lines if summaryText looks like a transcript (e.g. "User: hi\nAI Agent: hello")
  const renderTranscript = (summaryText: string) => {
    if (!summaryText) return <p className="text-slate-500 italic">No transcript available.</p>;

    const lines = summaryText.split('\n');
    return (
      <div className="flex flex-col gap-4 mt-4">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          
          const isAI = line.toLowerCase().startsWith('ai agent:') || line.toLowerCase().startsWith('ai:');
          const isVisitor = line.toLowerCase().startsWith('visitor:') || line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('caller:');
          
          if (isAI || isVisitor) {
             const content = line.substring(line.indexOf(':') + 1).trim();
             return (
               <div key={idx} className={`flex gap-3 w-full ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                  {isAI && (
                    <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[0.6rem] shadow-sm mt-auto">
                      3K
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-[0.9rem] leading-relaxed max-w-[85%] ${
                    isVisitor 
                      ? 'bg-slate-800 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}>
                    {content}
                  </div>
                  {isVisitor && (
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center mt-auto">
                      <User size={14} className="text-slate-500" />
                    </div>
                  )}
               </div>
             )
          }
          
          // Fallback for lines that don't match the strict format
          return <p key={idx} className="text-[0.9rem] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{line}</p>;
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
                <th className="px-6 py-4 border-b border-slate-200">Summary</th>
                <th className="px-6 py-4 border-b border-slate-200">Outcome</th>
                <th className="px-6 py-4 border-b border-slate-200">Status</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="text-[0.9rem] text-slate-700">
              {chats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
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
                      onClick={() => setSelectedChat(chat)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      
                      {/* Lead / Contact */}
                      <td className="px-6 py-4 border-b border-slate-100 max-w-[200px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 truncate">
                            Anonymous Visitor
                          </span>
                          <span className="text-[0.8rem] text-slate-500 truncate">
                            Web Chat
                          </span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="px-6 py-4 border-b border-slate-100 max-w-[400px]">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 line-clamp-2">
                            {chat.chatSummary || "No summary generated."}
                          </span>
                          <span className="text-[0.7rem] font-mono text-slate-400 mt-1 truncate">
                            ID: {chat.elevenlabsConversationId || chat._id}
                          </span>
                        </div>
                      </td>

                      {/* Outcome */}
                      <td className="px-6 py-4 border-b border-slate-100">
                        {chat.chatOutcome ? (
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold whitespace-nowrap">
                            {chat.chatOutcome}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">null</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 border-b border-slate-100">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-semibold">
                            <CheckCircle size={12} />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 border border-red-200/60 rounded-full text-xs font-semibold capitalize">
                            <AlertCircle size={12} />
                            {chat.chatStatus}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 border-b border-slate-100 text-right whitespace-nowrap">
                        <span className="font-medium text-slate-600 text-sm">
                          {formatRelativeDate(chat.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Slide-Over Panel for Transcript Details */}
      {selectedChat && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedChat(null)}
          />
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white shadow-md">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Chat Details</h2>
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

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="space-y-6">
                
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold capitalize ${selectedChat.chatStatus === 'completed' ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {selectedChat.chatStatus === 'completed' ? <CheckCircle size={14}/> : null}
                      {selectedChat.chatStatus}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outcome</span>
                    <span className="text-sm font-semibold text-slate-800 capitalize">
                      {selectedChat.chatOutcome || 'None'}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Transcript */}
                <div>
                  <h3 className="text-[0.8rem] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <MessageCircle size={14} /> Transcript Summary
                  </h3>
                  {renderTranscript(selectedChat.chatSummary)}
                </div>

                {/* Raw Debug Info (Optional/Collapsible maybe, but keeping it clean for now) */}
                <div className="pt-4">
                   <p className="text-[0.65rem] text-slate-400 font-mono">
                     ID: {selectedChat.elevenlabsConversationId || selectedChat._id}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
