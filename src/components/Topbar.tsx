"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import AgentSwitcher from "./AgentSwitcher";

export default function Topbar({
  agents = [],
  currentAgentId = "",
  currentAgentName = "",
}: {
  agents?: any[];
  currentAgentId?: string;
  currentAgentName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  let pageTitle = "3knots Digital AI Dashboard";
  if (pathname === "/leads") pageTitle = "All Leads";
  if (pathname === "/leads/create") pageTitle = "Create Lead";
  if (pathname === "/conversations") pageTitle = "Conversations";
  if (pathname?.startsWith("/batches")) pageTitle = "Outbound Batches";
  if (pathname === "/agent/settings") pageTitle = "Agent Settings";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <h2 className="text-[1.25rem] font-bold text-slate-900">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <AgentSwitcher agents={agents} currentAgentId={currentAgentId} initialAgentName={currentAgentName} />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-500 border border-emerald-500/20 rounded-full text-sm font-bold shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_0_0_rgba(16,185,129,0.7)]"></span>
          <span>Agent Online</span>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
