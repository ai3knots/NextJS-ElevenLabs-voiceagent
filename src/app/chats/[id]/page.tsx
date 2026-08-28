import React from "react";
import connectDB from "@/lib/mongodb";
import ChatLogModel from "@/models/ChatLog";
import LeadModel from "@/models/Lead";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Sparkles, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import ChatDetailsClient from "./ChatDetailsClient";
import { sanitizeChatLog } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function ChatDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  await connectDB();

  const rawChat = await ChatLogModel.findById(resolvedParams.id).populate("leadId").lean();
  const chat = sanitizeChatLog(rawChat);

  if (!chat) {
    notFound();
  }

  const isCompleted = chat.chatStatus === "completed" || chat.chatStatus === "done";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb & Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              href="/chats"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              Back to Web Chats
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Session ID:</span>
              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                {chat.senderPsid || chat._id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Platform Badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
              {chat.platform === "messenger" ? "Meta Messenger" : "Web LiveChat"}
            </span>

            {/* Outcome Badge */}
            {chat.chatOutcome && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                {chat.chatOutcome}
              </span>
            )}

            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                : "bg-amber-50 text-amber-700 border border-amber-200/80"
            }`}>
              <CheckCircle className="w-3.5 h-3.5" />
              {chat.chatStatus || "Completed"}
            </span>
          </div>
        </div>

        {/* Interactive Chat Details Body */}
        <ChatDetailsClient chat={chat} />

      </div>
    </div>
  );
}
