import { getLeads } from "@/actions/lead.actions";
import { getCurrentAgentId } from "@/actions/agent.actions";
import Link from "next/link";
import { Plus, PhoneCall, Calendar, Clock, BookOpen, Layers } from "lucide-react";
import ImportLeadsModal from "@/components/ImportLeadsModal";
import DeleteLeadButton from "./DeleteLeadButton";

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await getLeads();
  const currentAgentId = await getCurrentAgentId() || "";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-7 mt-4">
        
        {/* Header with Add Lead and Excel Import */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[1.2rem] font-black text-slate-900">Leads & Author Directory</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage prospective authors, review conversation context, and trigger batch or manual AI calls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ImportLeadsModal currentAgentId={currentAgentId} />
            <Link 
              href="/leads/create" 
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:opacity-95 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(245,158,11,0.4)]"
            >
              <Plus size={18} />
              Add Lead
            </Link>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-50 text-slate-500 text-[0.75rem] font-bold uppercase tracking-[0.05em]">
              <tr>
                <th className="px-5 py-3.5 border-b border-slate-200 rounded-tl-lg">Lead / Author</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Phone Number</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Book / Context</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Source / Batch</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Call Status</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Follow-Up</th>
                <th className="px-5 py-3.5 border-b border-slate-200 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[0.9rem] text-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="font-semibold text-slate-600">You don't have any leads in the CRM yet.</p>
                      <div className="flex gap-3">
                        <Link href="/leads/create" className="text-indigo-600 hover:underline font-bold text-sm">
                          Create single lead
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 text-sm">or import an Excel/CSV spreadsheet above</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead: any, index: number) => {
                  const hasFollowUp = !!lead.preferredCallbackTime || lead.followUpStatus === 'callback_requested';
                  
                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                      {/* Name & Email */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.email && (
                            <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                              {lead.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {lead.phoneNumber}
                        </span>
                      </td>

                      {/* Book & Context */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        <div className="max-w-[220px]">
                          {lead.bookTopic ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-0.5">
                              <BookOpen size={13} className="shrink-0" />
                              <span className="truncate">{lead.bookTopic}</span>
                            </div>
                          ) : null}
                          <p className="text-xs text-slate-500 truncate" title={lead.context || ""}>
                            {lead.context || "No context notes"}
                          </p>
                        </div>
                      </td>

                      {/* Source & Batch Name */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        {lead.batchName ? (
                          <div className="inline-flex items-center gap-1 text-[0.72rem] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md max-w-[140px] truncate" title={lead.batchName}>
                            <Layers size={11} className="shrink-0" />
                            <span className="truncate">{lead.batchName}</span>
                          </div>
                        ) : (
                          <span className="text-[0.75rem] font-bold text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                            {lead.source || "Manual"}
                          </span>
                        )}
                      </td>

                      {/* Call Status */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        <span className={`px-2.5 py-1 rounded-full text-[0.72rem] font-extrabold capitalize ${
                          lead.callStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' :
                          lead.callStatus === 'failed' ? 'bg-red-50 text-red-600 border border-red-200/60' :
                          ['initiating', 'in_progress', 'ringing'].includes(lead.callStatus) ? 'bg-amber-50 text-amber-600 border border-amber-200/60 animate-pulse' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {lead.callStatus.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Follow-Up / Callback */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        {hasFollowUp ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold" title={lead.preferredCallbackTime || "Callback requested"}>
                            <Clock size={12} className="text-amber-600" />
                            <span className="truncate max-w-[120px]">{lead.preferredCallbackTime || "Callback Req"}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`px-5 py-4 border-b border-slate-200 ${index === leads.length - 1 ? 'border-none' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/leads/${lead._id}`} 
                            className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                          >
                            View History
                          </Link>
                          <DeleteLeadButton leadId={lead._id} />
                        </div>
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
  );
}
