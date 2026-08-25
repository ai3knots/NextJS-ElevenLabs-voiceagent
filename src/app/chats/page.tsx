import { MessageCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";
import ChatsTableClient from "./ChatsTableClient";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  await connectDB();
  
  // Convert mongoose documents to lean plain objects and stringify IDs for passing to Client Component
  const rawChats = await ChatLog.find().sort({ createdAt: -1 }).lean();
  const chats = rawChats.map(c => ({
    ...c,
    _id: c._id.toString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt?.toISOString(),
    leadId: c.leadId ? c.leadId.toString() : null,
  }));

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

        {/* Chats Table (Interactive) */}
        <ChatsTableClient chats={chats} />
      </div>
    </div>
  );
}
