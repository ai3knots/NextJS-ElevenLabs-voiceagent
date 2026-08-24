import { MessageCircle, FileText, CheckCircle, AlertCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

export default async function ChatsPage() {
  await connectDB();
  
  const chats = await ChatLog.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <MessageCircle className="text-white w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Web Chats</h1>
            </div>
            <p className="text-slate-500 text-[0.95rem] font-medium max-w-2xl leading-relaxed">
              Real-time conversational leads captured from the website interface. 
              Review AI summaries, follow-up requirements, and transcript data.
            </p>
          </div>
        </div>

        {/* Chats Table */}
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
                      <tr key={chat._id} className="hover:bg-slate-50/80 transition-colors group">
                        
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
      </div>
    </div>
  );
}
