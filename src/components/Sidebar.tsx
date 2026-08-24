"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Settings, MessageSquare, Layers, MessageCircle } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users, exact: true },
    { href: "/leads/create", label: "New Lead", icon: UserPlus },
    { href: "/conversations", label: "Voice Calls", icon: MessageSquare },
    { href: "/chats", label: "Chats", icon: MessageCircle },
    { href: "/batches", label: "Batches", icon: Layers },
  ];

  return (
    <aside className="w-[260px] bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300">
      <Link href="/" className="px-6 pt-6 pb-4 flex items-center gap-3 decoration-transparent">
        <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-[#6366f1] to-[#06b6d4] flex items-center justify-center text-white font-extrabold text-[1.25rem] shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
          3K
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-[1.1rem] tracking-tight leading-tight">3knot</span>
          <span className="text-[0.7rem] font-bold text-sky-400 uppercase tracking-widest leading-none mt-[-2px]">Digital Voice</span>
        </div>
      </Link>
      
      <ul className="flex-1 px-3 py-6 flex flex-col gap-[0.35rem] list-none m-0">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname?.startsWith(link.href) && (link.href !== "/" || pathname === "/");
            
          const Icon = link.icon;
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-[0.85rem] px-4 py-[0.85rem] rounded-xl font-semibold text-[0.925rem] transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="mt-auto">
          <Link
            href="/agent/settings"
            className={`flex items-center gap-[0.85rem] px-4 py-[0.85rem] rounded-xl font-semibold text-[0.925rem] transition-all duration-200 ${
              pathname?.startsWith("/agent/settings")
                ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Settings size={20} />
            <span>Agent Settings</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
