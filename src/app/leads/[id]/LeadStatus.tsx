"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Clock, Code2, PhoneCall, BookOpen, CheckCircle2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LeadStatus({ lead, logs }: { lead: any, logs: any[] }) {
  const [isPolling, setIsPolling] = useState(
    ["initiating", "in_progress", "ringing"].includes(lead.callStatus)
  );
  const [activeTab, setActiveTab] = useState<"timeline" | "raw">("timeline");
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/leads/${lead._id}/check-status`);
          const data = await res.json();
          if (data.updated) {
            router.refresh();
            if (["completed", "failed"].includes(data.call_status)) {
              setIsPolling(false);
            }
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPolling, lead._id, router]);

  const attemptsCount = logs.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Voice Call Analytics & History</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Chronological timeline of conversations and extracted context</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full border border-slate-200">
          {attemptsCount} Attempt{attemptsCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab("timeline")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors ${
            activeTab === "timeline"
              ? "border-b-2 border-amber-500 text-amber-600 font-extrabold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Clock size={16} />
          Call History Timeline
        </button>
        <button 
          onClick={() => setActiveTab("raw")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 transition-colors ${
            activeTab === "raw"
              ? "border-b-2 border-amber-500 text-amber-600 font-extrabold"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Code2 size={16} />
          Raw Webhook & Analysis
        </button>
      </div>

      {activeTab === "timeline" ? (
        <div className="space-y-6">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-medium bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              No call attempts have been made yet.
            </div>
          ) : (
            logs.map((log: any, index: number) => {
              const attemptNum = attemptsCount - index;
              const isFailed = ["failed", "canceled", "error"].includes((log.callStatus || "").toLowerCase());
              const isCompleted = ["completed", "done"].includes((log.callStatus || "").toLowerCase());
              const hasFollowUp = log.followUpRequired || !!log.preferredCallbackTime || !!log.followUpContext;

              return (
                <div key={log._id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Attempt Header */}
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">Attempt #{attemptNum}</span>
                      <span suppressHydrationWarning className="text-slate-400 text-xs font-medium">
                        • {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.callOutcome && (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80">
                          {log.callOutcome}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        isFailed ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {log.callStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 bg-white space-y-4">
                    {/* Follow-Up / Callback Box if extracted */}
                    {hasFollowUp && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                            <Clock size={14} className="text-amber-600" />
                            Extracted Follow-Up Context
                          </span>
                          {log.preferredCallbackTime && (
                            <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                              📅 {log.preferredCallbackTime}
                            </span>
                          )}
                        </div>
                        {log.followUpContext && (
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {log.followUpContext}
                          </p>
                        )}
                        {(log.bookTopic || log.servicesDiscussed) && (
                          <div className="pt-2 border-t border-amber-200/60 text-xs text-slate-600 flex flex-wrap gap-3">
                            {log.bookTopic && <span>📖 <strong>Topic:</strong> {log.bookTopic}</span>}
                            {log.servicesDiscussed && <span>🛠️ <strong>Services:</strong> {log.servicesDiscussed}</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {isFailed ? (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium text-xs">
                        <span className="font-bold">Failure Reason:</span> {log.callErrorReason || log.callSummary || "Call declined, unanswered, or ended by recipient."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {log.callStatus === "completed" && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                              AI Call Summary
                            </h4>
                            <div className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              {log.callSummary || "Conversation completed successfully."}
                            </div>
                          </div>
                        )}

                        {log.elevenlabsConversationId && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold text-slate-700">Call Audio Playback</h4>
                              <Link 
                                href={`/conversations/${log.elevenlabsConversationId}`} 
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                              >
                                <PlayCircle size={14} />
                                View Full Turn-by-Turn Transcript
                              </Link>
                            </div>
                            <audio 
                              controls 
                              className="w-full h-9 rounded-full" 
                              src={`/api/conversations/${log.elevenlabsConversationId}/audio`}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre>{JSON.stringify(logs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
