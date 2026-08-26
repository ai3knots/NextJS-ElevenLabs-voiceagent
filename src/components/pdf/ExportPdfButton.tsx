"use client";

import React, { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// We must dynamically import PDFDownloadLink because it uses browser APIs
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false, loading: () => <button disabled className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"><Loader2 size={14} className="animate-spin" /> Preparing PDF</button> }
);

import { BatchReportDocument } from './BatchReportDocument';

interface ExportPdfButtonProps {
  batchName: string;
  batchId: string;
  totalCalls: number;
  answerRate: number;
  conversionRate: number;
  avgDurationSecs: number;
  createdAt: string;
  outcomesCount: Record<string, number>;
  recipients: any[];
}

export default function ExportPdfButton(props: ExportPdfButtonProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button disabled className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold">
        <Loader2 size={14} className="animate-spin" /> Preparing
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<BatchReportDocument {...props} />}
      fileName={`Batch_Report_${props.batchId}.pdf`}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200/60 rounded-lg text-xs font-semibold transition-colors"
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Download size={14} /> Download PDF Report
          </>
        )
      }
    </PDFDownloadLink>
  );
}
