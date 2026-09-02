'use client';

import React, { useState, useEffect } from 'react';
import ChatWidget from '@/components/ChatWidget';
import { UserCheck, Sparkles, Database, PhoneCall, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

export default function ChatAgentPage() {
  const [latestLeads, setLatestLeads] = useState<any[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  const fetchLeads = async () => {
    setIsLoadingLeads(true);
    try {
      const res = await fetch('/api/leads/recent?limit=5');
      if (res.ok) {
        const data = await res.json();
        setLatestLeads(data.leads || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#090D14] via-[#141B26] to-[#090D14] p-8 border border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                3Knots Digital • LangGraph + Gemini 3.5 Flash-Lite
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Emma • AI Author Advisor
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                Test and interact with Emma, your stateful chat agent for Marketing And Publishing House LLC. 
                Trained for natural lead qualification, the 6-step publishing process, pricing guidance, and automatic CRM lead capture.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LangGraph Runtime Active
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Chat Sandbox / Right Capabilities & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Chat Sandbox (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Live Chat Sandbox
              </h2>
              <span className="text-xs text-slate-400">Zero-Timeout • Persistent Memory</span>
            </div>

            {/* Inline Chat Component */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <ChatWidget inline={true} />
            </div>
          </div>

          {/* Right Column: Agent Specifications & Tools (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Agent Architecture Specs */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Active Agent Architecture
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="block text-[11px] font-semibold text-slate-400">LLM Model</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Gemini 3.5 Flash-Lite
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="block text-[11px] font-semibold text-slate-400">Orchestrator</span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> LangGraph StateGraph
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="block text-[11px] font-semibold text-slate-400">Response Speed</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5">
                    ~300ms Ultra-Fast
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="block text-[11px] font-semibold text-slate-400">Memory Layer</span>
                  <span className="text-sm font-bold text-cyan-400 mt-0.5">
                    MongoDB ChatLog
                  </span>
                </div>
              </div>

              {/* Integrated Tools List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Equipped Agent Tools:</span>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">save_lead_info</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Auto-extracts and syncs Author Name, Email, Phone, Genre, and Stage directly into MongoDB Leads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">trigger_outbound_call</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Dials the author's phone instantly via ElevenLabs Voice Agent if they ask to be called.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Publishing Plan Tiers */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Publishing Plan Tiers (MPH):</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
                    <span className="text-indigo-300 font-semibold block text-[11px]">Kickstarter</span>
                    <span className="text-white font-bold text-xs mt-0.5 block">5 Platforms</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
                    <span className="text-cyan-300 font-semibold block text-[11px]">Nationwide</span>
                    <span className="text-white font-bold text-xs mt-0.5 block">Core Multi-Format</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
                    <span className="text-emerald-300 font-semibold block text-[11px]">Global</span>
                    <span className="text-white font-bold text-xs mt-0.5 block">10+ Global Stores</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
