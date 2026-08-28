"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Settings, MessageSquare, Layers, MessageCircle, Sparkles } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users, exact: true },
    { href: "/leads/create", label: "New Lead", icon: UserPlus },
    { href: "/conversations", label: "Voice Calls", icon: MessageSquare },
    { href: "/chats", label: "Chats", icon: MessageCircle },
    { href: "/chat-agent", label: "Alex Chat Agent", icon: Sparkles },
    { href: "/batches", label: "Batches", icon: Layers },
  ];

  return (
    <aside className="w-[260px] bg-[#090D14] text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300 border-r border-slate-800/80">
      <Link href="/" className="px-5 pt-6 pb-5 flex items-center gap-3 decoration-transparent group">
        <div className="flex items-center gap-3">
          <img 
            src="/3knotslogo.png" 
            alt="3Knots Digital" 
            className="h-10 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-[1.1rem] font-black text-white tracking-wider leading-none uppercase">3KNOTS</span>
            <span className="text-[0.68rem] font-bold text-amber-500 tracking-[0.25em] uppercase leading-tight mt-0.5">DIGITAL</span>
          </div>
        </div>
      </Link>
      
      <ul className="flex-1 px-3 py-4 flex flex-col gap-[0.35rem] list-none m-0">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname?.startsWith(link.href) && (link.href !== "/" || pathname === "/");
            
          const Icon = link.icon;
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-[0.85rem] px-4 py-[0.8rem] rounded-xl font-semibold text-[0.925rem] transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                    : "text-slate-400 hover:bg-slate-850 hover:text-amber-400"
                }`}
              >
                <Icon size={19} className={isActive ? "text-white" : "text-slate-400 group-hover:text-amber-400"} />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="mt-auto">
          <Link
            href="/agent/settings"
            className={`flex items-center gap-[0.85rem] px-4 py-[0.8rem] rounded-xl font-semibold text-[0.925rem] transition-all duration-200 ${
              pathname?.startsWith("/agent/settings")
                ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)]"
                : "text-slate-400 hover:bg-slate-800 hover:text-amber-400"
            }`}
          >
            <Settings size={19} />
            <span>Agent Settings</span>
          </Link>
        </li>
      </ul>

      {/* Footer Branding Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3Knots AI Engine</span>
        </div>
        <span className="text-[10px] text-amber-400/80 font-mono">v2.4</span>
      </div>
    </aside>
  );
}
