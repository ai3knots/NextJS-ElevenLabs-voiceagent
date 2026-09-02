import { MessageCircle } from "lucide-react";
import connectDB from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";
import ChatsTableClient from "@/app/chats/ChatsTableClient";
import { sanitizeChatLogs } from "@/lib/serialize";
import ChatWidget from '@/components/ChatWidget';

export const dynamic = "force-dynamic";

export default async function LiveChatPage() {
  await connectDB();
  
  // Convert mongoose documents to 100% plain serializable objects for Client Component
  const rawChats = await ChatLog.find().sort({ createdAt: -1 }).lean();
  const chats = sanitizeChatLogs(rawChats);


  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 pb-32">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <MessageCircle className="text-white w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Web Chats (Live Sandbox)</h1>
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

      {/* Floating Chat Component */}
      <ChatWidget 
        inline={false} 
        initialOpen={true} 
        apiEndpoint="/api/live-chat" 
        proactive={true}
      />
    </div>
  );
}
