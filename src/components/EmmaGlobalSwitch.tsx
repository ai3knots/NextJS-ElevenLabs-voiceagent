"use client";

import { useState } from "react";
import { Bot, BotOff } from "lucide-react";
import toast from "react-hot-toast";
import { setEmmaGlobalEnabled } from "@/actions/chat.actions";

export default function EmmaGlobalSwitch({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    const next = !enabled;
    setEnabled(next);
    setBusy(true);
    try {
      const res = await setEmmaGlobalEnabled(next);
      if (!res.success) {
        setEnabled(!next);
        throw new Error(res.error || "Failed to update Emma");
      }
      setEnabled(res.enabled);
      toast.success(
        next
          ? "Emma will auto-reply on all Messenger chats (except ones in takeover)."
          : "Emma paused globally. No conversation will get an auto-reply."
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to update global Emma switch");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border px-4 py-3 ${
        enabled ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
      }`}
    >
      <div>
        <p className={`text-sm font-extrabold ${enabled ? "text-emerald-900" : "text-rose-900"}`}>
          {enabled ? "Emma is on for all Messenger chats" : "Emma is paused globally"}
        </p>
        <p className={`text-xs mt-0.5 ${enabled ? "text-emerald-700" : "text-rose-700"}`}>
          {enabled
            ? "Taking over one chat only pauses Emma there. Other customers still get replies."
            : "Turn this on again to let Emma answer new messages on chats that are not in takeover."}
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border bg-white shadow-xs whitespace-nowrap disabled:opacity-50 ${
          enabled
            ? "text-rose-800 border-rose-200 hover:bg-rose-100"
            : "text-emerald-800 border-emerald-200 hover:bg-emerald-100"
        }`}
      >
        {enabled ? <BotOff className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
        {enabled ? "Pause Emma everywhere" : "Resume Emma globally"}
      </button>
    </div>
  );
}
