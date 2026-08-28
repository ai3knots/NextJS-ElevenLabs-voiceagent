import { getDashboardStats } from "@/actions/lead.actions";
import { clearDatabaseAction } from "@/actions/admin.actions";
import CleanDbClientButton from "@/components/CleanDbClientButton";
import Link from "next/link";
import { Users, PhoneCall, PhoneForwarded, PhoneMissed, Plus } from "lucide-react";
import { getCurrentAgentId, getSelectedPhoneNumber, fetchPhoneNumbers } from "@/actions/agent.actions";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { stats, recentLeads } = await getDashboardStats();
  const agentId = await getCurrentAgentId() || "Not set";
  const agentPhoneNumberId = await getSelectedPhoneNumber();
  const phoneNumbers = await fetchPhoneNumbers();
  const matchedPhone = phoneNumbers?.find((p: any) => p.phone_number_id === agentPhoneNumberId);
  const displayPhoneNumber = matchedPhone?.phone_number || agentPhoneNumberId;

  return (
    <div className="space-y-8">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[0.85rem] font-semibold text-slate-500 uppercase tracking-[0.05em]">Total Leads</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalLeads}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[0.85rem] font-semibold text-slate-500 uppercase tracking-[0.05em]">Completed Calls</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.completedCalls}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <PhoneCall size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[0.85rem] font-semibold text-slate-500 uppercase tracking-[0.05em]">Calls Active</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.inProgressCalls}</p>
          </div>
          <div className="w-12 h-12 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center">
            <PhoneForwarded size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <p className="text-[0.85rem] font-semibold text-slate-500 uppercase tracking-[0.05em]">Pending Calls</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.pendingCalls}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <PhoneMissed size={24} />
          </div>
        </div>
      </div>

      {/* ElevenLabs Agent Live Preview Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#090D14] via-[#141B26] to-[#090D14] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-amber-500/25 shadow-md">
        <div className="max-w-[650px]">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-400 mb-3">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            LIVE CONVAI WIDGET ACTIVE
          </div>
          <h3 className="text-2xl font-extrabold text-white mb-2">Voice Agent Live</h3>
          <p className="text-slate-300 text-[0.925rem] leading-relaxed m-0">
            Experience real-time interactive voice conversation with your configured ElevenLabs Agent right inside the browser. Click the widget icon floating at the bottom right corner of your screen to launch a live test call.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[0.85rem] font-semibold text-amber-300/90 bg-white/5 border border-amber-500/20 px-4 py-2.5 rounded-xl font-mono">
            Agent ID: {agentId}
          </span>
          {displayPhoneNumber && (
            <span className="text-[0.85rem] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-400/30 px-4 py-2.5 rounded-xl font-mono flex items-center gap-2">
              <PhoneCall size={14} /> {displayPhoneNumber}
            </span>
          )}
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[1.15rem] font-bold text-slate-900">Recent Leads</h3>
          <div className="flex items-center gap-3">
            <CleanDbClientButton action={clearDatabaseAction} />
            <Link href="/leads/create" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:opacity-95 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(245,158,11,0.4)]">
              <Plus size={18} />
              Add New Lead
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-50 text-slate-500 text-[0.75rem] font-bold uppercase tracking-[0.05em]">
              <tr>
                <th className="px-5 py-3.5 border-b border-slate-200 rounded-tl-lg">Lead Name</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Phone Number</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Call Type</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Call Status</th>
                <th className="px-5 py-3.5 border-b border-slate-200">Date Added</th>
                <th className="px-5 py-3.5 border-b border-slate-200 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="text-[0.9rem] text-slate-700">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No leads available. Click "Add New Lead" to get started.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead: any, index: number) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className={`px-5 py-4 font-bold border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className={`px-5 py-4 border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      {lead.phoneNumber}
                    </td>
                    <td className={`px-5 py-4 border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[0.75rem] font-bold capitalize">
                        {lead.status === 'manual' ? 'Manual' : 'Automatic'}
                      </span>
                    </td>
                    <td className={`px-5 py-4 border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      <span className={`px-3 py-1 rounded-full text-[0.75rem] font-bold capitalize ${
                        lead.callStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        lead.callStatus === 'failed' ? 'bg-red-50 text-red-600' :
                        lead.callStatus === 'in_progress' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.callStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-5 py-4 border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className={`px-5 py-4 border-b border-slate-200 ${index === recentLeads.length - 1 ? 'border-none' : ''}`}>
                      <Link href={`/leads/${lead._id}`} className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[0.8rem] font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
