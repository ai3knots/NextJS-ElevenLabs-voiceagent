"use client";

import React from 'react';
import ExportPdfButton from '@/components/pdf/ExportPdfButton';
import { Layers } from 'lucide-react';

const dummyData = {
  batchName: "Sample August Outreach",
  batchId: "btcal_sample987654321",
  totalCalls: 250,
  answerRate: 45,
  conversionRate: 12,
  avgDurationSecs: 85,
  createdAt: new Date().toLocaleDateString(),
  outcomesCount: {
    "scheduled_with_senior": 25,
    "plans_emailed": 5,
    "voicemail": 120,
    "not_interested_hangup": 40,
    "busy_hangup": 20,
    "speak_no_word": 15,
    "failed": 25
  },
  recipients: Array.from({ length: 50 }).map((_, i) => ({
    phone: `+1 (555) 000-${i.toString().padStart(4, '0')}`,
    call_outcome: i % 5 === 0 ? "scheduled_with_senior" : (i % 2 === 0 ? "voicemail" : "not_interested_hangup"),
    duration: i % 2 === 0 ? 15 : (i % 5 === 0 ? 340 : 45),
    analysis: {
      transcript_summary: i % 5 === 0 
        ? "Lead was very interested, asked about pricing, and scheduled a follow-up with a senior agent."
        : (i % 2 === 0 ? "Went straight to voicemail. Left standard voice message." : "Lead picked up but said they were busy and hung up quickly.")
    }
  }))
};

export default function TestPdfPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6 max-w-md w-full">
        <Layers size={48} className="mx-auto text-indigo-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sample PDF Generator</h1>
          <p className="text-sm text-slate-500 mt-2">
            Click the button below to generate and download a sample version of the Detailed Batch Analysis PDF Report.
          </p>
        </div>
        
        <div className="pt-4 border-t border-slate-100 flex justify-center">
          <ExportPdfButton {...dummyData} />
        </div>
      </div>
    </div>
  );
}
