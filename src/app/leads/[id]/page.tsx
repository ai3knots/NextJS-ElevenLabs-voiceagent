import { getLeadById } from "@/actions/lead.actions";
import connectDB from "@/lib/mongodb";
import CallLog from "@/models/CallLog";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen, Layers, Calendar, PhoneCall } from "lucide-react";
import LeadStatus from "./LeadStatus";
import TriggerCallButton from "./TriggerCallButton";
import DeleteLeadButton from "../DeleteLeadButton";

export const dynamic = 'force-dynamic';

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const lead = await getLeadById(resolvedParams.id);

  if (!lead) {
    return (
      <div className="p-8 text-center text-slate-500">
        Lead not found. <Link href="/leads" className="text-blue-600 hover:underline">Go back to Leads</Link>
      </div>
    );
  }

  await connectDB();
  const logs = await CallLog.find({ leadId: lead._id }).sort({ createdAt: -1 }).lean();
  
  // Transform ObjectId to string to pass to client component securely
  const serializedLogs = logs.map((l: any) => ({
    ...l,
    _id: l._id.toString(),
    leadId: l.leadId.toString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const serializedLead = {
    ...lead,
    _id: lead._id.toString(),
  };

  const hasFollowUp = !!lead.preferredCallbackTime || lead.followUpStatus === 'callback_requested';

  return (
    <div className="max-w-[1300px] mx-auto space-y-6">
      <div className="mb-2 flex items-center justify-between">
        <Link href="/leads" className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-[0.85rem] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm bg-white">
          <ArrowLeft size={16} />
          Back to All Leads
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center p-0.5">
          <DeleteLeadButton leadId={lead._id.toString()} />
        </div>
      </div>

      {/* Scheduled Follow-Up Alert Banner if requested */}
      {hasFollowUp && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Callback Requested
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {lead.preferredCallbackTime || "Time not specified"}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {lead.followUpNotes || lead.context || "Author requested follow-up discussion regarding their book."}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <TriggerCallButton leadId={lead._id.toString()} currentStatus={lead.callStatus} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
        
        {/* Left Column: Lead Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col min-h-0 relative">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="text-[0.85rem] text-slate-500 font-medium mt-1">
                Created on {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(lead.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-[0.75rem] font-bold capitalize ${
              lead.callStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
              lead.callStatus === 'failed' ? 'bg-red-50 text-red-600' :
              ['initiating', 'in_progress', 'ringing'].includes(lead.callStatus) ? 'bg-amber-50 text-amber-600' :
              'bg-slate-100 text-slate-600'
            }`}>
              {lead.callStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[0.8rem] font-bold text-slate-500 mb-1">Phone Number</p>
              <p className="text-[1.05rem] font-mono font-extrabold text-slate-900">{lead.phoneNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.8rem] font-bold text-slate-500 mb-1">Email</p>
                <p className="text-[0.9rem] font-medium text-slate-700 truncate">{lead.email || '-'}</p>
              </div>
              <div>
                <p className="text-[0.8rem] font-bold text-slate-500 mb-1">Company</p>
                <p className="text-[0.9rem] font-medium text-slate-700">{lead.company || '-'}</p>
              </div>
            </div>

            {/* Book Project Info */}
            {(lead.bookTopic || lead.writingStage) && (
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                  <BookOpen size={14} className="text-amber-600" />
                  Author Book Details
                </div>
                {lead.bookTopic && (
                  <p className="text-xs text-slate-700 font-semibold">
                    <span className="text-slate-400 font-normal">Topic/Genre:</span> {lead.bookTopic}
                  </p>
                )}
                {lead.writingStage && (
                  <p className="text-xs text-slate-700 font-semibold capitalize">
                    <span className="text-slate-400 font-normal">Writing Stage:</span> {lead.writingStage.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            )}

            {/* Batch Info */}
            {lead.batchName && (
              <div>
                <p className="text-[0.8rem] font-bold text-slate-500 mb-1">Campaign Source</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                  <Layers size={13} className="text-slate-500" />
                  {lead.batchName}
                </div>
              </div>
            )}

            {/* Active Conversation Context */}
            <div>
              <p className="text-[0.8rem] font-bold text-slate-500 mb-2">Agent Context for Next Call</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[0.88rem] text-slate-700 font-medium leading-relaxed">
                {lead.context || "No context notes provided. Agent will conduct general story discovery."}
              </div>
            </div>
          </div>
          
          {!hasFollowUp && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <TriggerCallButton leadId={lead._id.toString()} currentStatus={lead.callStatus} />
            </div>
          )}
        </div>

        {/* Right Column: Voice Call Analytics & Multi-attempt Timeline */}
        <LeadStatus lead={serializedLead} logs={serializedLogs} />

      </div>
    </div>
  );
}
