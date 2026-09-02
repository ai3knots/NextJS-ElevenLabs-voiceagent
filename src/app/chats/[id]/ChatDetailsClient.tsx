"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  PhoneCall, 
  ExternalLink, 
  Trash2, 
  User, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { generateChatSummaryAction, deleteChatAction } from "@/actions/chat.actions";
import { triggerManualCall } from "@/actions/lead.actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";

// Cleanly format message text: removes raw asterisks/stars and renders clean typography
function renderFormattedMessage(text: string, isUser: boolean) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1 leading-relaxed">
      {lines.map((line, lineIdx) => {
        const cleanBulletLine = line.replace(/^[\*\-]\s+/, '• ');
        const parts = cleanBulletLine.split(/(\*\*[^*]+?\*\*)/g);

        return (
          <p key={lineIdx} className={cleanBulletLine.trim().startsWith('•') ? 'pl-2' : ''}>
            {parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2).replace(/\*/g, '');
                return (
                  <strong key={partIdx} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>
                    {boldText}
                  </strong>
                );
              }
              const cleanPart = part.replace(/\*/g, '');
              return <span key={partIdx}>{cleanPart}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

interface ChatDetailsClientProps {
  chat: any;
}

export default function ChatDetailsClient({ chat }: ChatDetailsClientProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(chat.chatSummary || "");
  const [currentOutcome, setCurrentOutcome] = useState(chat.chatOutcome || "Inquiry / Discussion");
  const [analysis, setAnalysis] = useState<any>(chat.rawWebhookPayload?.analysis || null);
  const router = useRouter();

  const handleGenerateSummary = async () => {
    try {
      setIsSummarizing(true);
      const res = await generateChatSummaryAction(chat._id);
      if (res.success) {
        setCurrentSummary(res.summary);
        setCurrentOutcome(res.outcome);
        setAnalysis(res.analysis);
        toast.success("AI Summary generated successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to generate summary");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyTranscript = () => {
    if (!chat.messages || chat.messages.length === 0) return;
    const text = chat.messages
      .map((m: any) => `[${new Date(m.timestamp || chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${m.role === 'user' ? 'Customer' : 'Emma (MPH Advisor)'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Full transcript copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteChatAction(chat._id);
      if (res.success) {
        toast.success("Chat log deleted");
        router.push("/chats");
      } else {
        toast.error(res.error || "Failed to delete chat log");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete chat log");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleTriggerVoiceCall = async (leadId: string) => {
    try {
      setIsCalling(true);
      const res = await triggerManualCall(leadId);
      if (res && !res.success) {
        throw new Error(res.error || "Failed to trigger call");
      }
      toast.success("Voice call initiated! ElevenLabs agent is dialing the author.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger call");
    } finally {
      setIsCalling(false);
    }
  };

  // Author details extracted from analysis or linked lead
  const linkedLeadName = chat.leadId?.firstName 
    ? `${chat.leadId.firstName} ${chat.leadId.lastName || ''}`.trim() 
    : null;
  const authorName = analysis?.authorName || linkedLeadName || null;

  const linkedLeadPhone = (chat.leadId?.phoneNumber && chat.leadId.phoneNumber !== "Pending") 
    ? chat.leadId.phoneNumber 
    : null;
  const authorPhone = analysis?.phone || linkedLeadPhone || null;

  const authorEmail = analysis?.email || chat.leadId?.email || null;
  const bookTopic = analysis?.bookTopic || chat.leadId?.bookTopic || null;
  const writingStage = analysis?.writingStage || chat.leadId?.writingStage || null;
  const services = Array.isArray(analysis?.servicesNeeded) ? analysis.servicesNeeded : [];

  return (
    <div className="space-y-6">
      
      {/* Main Grid: Left Intelligence Card / Right Transcript Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 Cols): AI Summary & Author Intelligence */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Executive Summary Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-400/20">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">AI Chat Intelligence</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Powered by Google Gemini 3.5 Flash-Lite</p>
                </div>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-all border border-amber-300/60 disabled:opacity-50"
                title="Re-analyze transcript and generate new summary"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
                <span>{isSummarizing ? "Analyzing..." : "Refresh Summary"}</span>
              </button>
            </div>

            {/* Executive Summary Content */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-sm leading-relaxed font-medium">
              {currentSummary ? (
                <p className="whitespace-pre-wrap">{currentSummary}</p>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">
                  <p className="mb-2">No executive summary generated yet.</p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-sm hover:opacity-90"
                  >
                    <Sparkles className="w-3 h-3" /> Generate AI Summary
                  </button>
                </div>
              )}
            </div>

            {/* Extracted Key Facts */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Extracted Author Profile:
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Author Name</span>
                  <span className="font-extrabold text-slate-800 text-[13px] truncate block mt-0.5">
                    {authorName || "Anonymous Visitor"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Phone Number</span>
                  <span className="font-extrabold text-slate-800 text-[13px] font-mono truncate block mt-0.5">
                    {authorPhone || "Not Provided"}
                  </span>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Email Address</span>
                  <span className="font-extrabold text-slate-800 text-[13px] truncate block mt-0.5">
                    {authorEmail || "Not Provided"}
                  </span>
                </div>
              </div>

              {/* Book Project Insights */}
              {(bookTopic || writingStage) && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                    <BookOpen size={13} className="text-amber-600" />
                    Book Specifications
                  </div>
                  {bookTopic && (
                    <p className="text-xs text-slate-700 font-medium">
                      <span className="text-slate-400 font-normal">Topic / Genre:</span> <strong>{bookTopic}</strong>
                    </p>
                  )}
                  {writingStage && (
                    <p className="text-xs text-slate-700 font-medium capitalize">
                      <span className="text-slate-400 font-normal">Manuscript Stage:</span> <strong>{writingStage.replace(/_/g, ' ')}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Services Required Tags */}
              {services.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 block">Services Discussed:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {services.map((srv: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/80">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Next Step */}
              {analysis?.recommendedAction && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs">
                  <span className="font-bold block mb-0.5">🎯 Recommended Next Step:</span>
                  <p className="leading-relaxed text-indigo-950 font-medium">{analysis.recommendedAction}</p>
                </div>
              )}
            </div>

            {/* CRM Lead Link & Voice Calling Trigger */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              {chat.leadId ? (
                <div className="space-y-2">
                  <Link
                    href={`/leads/${chat.leadId._id || chat.leadId}`}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300/80 text-xs font-bold text-slate-800 hover:text-amber-900 transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" />
                      View Linked Lead Profile in CRM
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  {authorPhone && (
                    <button
                      onClick={() => handleTriggerVoiceCall(chat.leadId._id || chat.leadId)}
                      disabled={isCalling}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:opacity-95 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <PhoneCall className="w-4 h-4" />
                      {isCalling ? "Dialing Lead..." : "Trigger Outbound Voice Call via ElevenLabs"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
                  Author did not submit phone contact during this session.
                </div>
              )}
            </div>

          </div>

          {/* Delete Log Option */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Chat Record
            </button>
          </div>

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            title="Delete Chat Log?"
            message="Are you sure you want to permanently delete this chat log and all associated messages? This action cannot be undone."
            confirmText="Delete Log"
            cancelText="Cancel"
            variant="danger"
            isLoading={isDeleting}
          />

        </div>

        {/* Right Column (7 Cols): Turn-by-Turn Transcript Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col min-h-[600px]">
            
            {/* Transcript Card Header */}
            <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Live Conversation Transcript</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {chat.messages?.length || 0} messages recorded
                </p>
              </div>

              <button
                onClick={handleCopyTranscript}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-all"
                title="Copy entire conversation transcript"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied!" : "Copy Full Transcript"}</span>
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-6 space-y-5 bg-[#FAFBFD] overflow-y-auto">
              {(!chat.messages || chat.messages.length === 0) ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No transcript messages available.
                </div>
              ) : (
                chat.messages.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user';
                  const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 ${
                        isUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      {isUser ? (
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-0.5 ring-2 ring-slate-800">
                          <User className="w-4 h-4 text-amber-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-md mt-0.5 border border-amber-300/40 tracking-wider">
                          <span>E</span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                          isUser
                            ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-tr-xs shadow-amber-500/20'
                            : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs shadow-slate-200/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className={`text-[10px] font-bold ${isUser ? 'text-amber-100' : 'text-slate-400'} uppercase tracking-wider`}>
                            {isUser ? (authorName || "Customer") : "Emma (Author Advisor)"}
                          </span>
                          {timestamp && (
                            <span className={`text-[10px] font-medium ${isUser ? 'text-amber-200/80' : 'text-slate-400'}`}>
                              {timestamp}
                            </span>
                          )}
                        </div>
                        {renderFormattedMessage(msg.content, isUser)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
