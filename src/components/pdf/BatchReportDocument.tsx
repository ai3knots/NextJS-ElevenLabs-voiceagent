import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Circle, Path } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 20 },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8, paddingTop: 8 },
  rowEven: { backgroundColor: '#f8fafc' },
  col2: { flex: 2 },
  col: { flex: 1 },
  colPhone: { flex: 1.2, paddingRight: 4 },
  colOutcome: { flex: 1.5, paddingRight: 4 },
  colDuration: { flex: 0.8, paddingRight: 4 },
  colSummary: { flex: 3 },
  bold: { fontWeight: 'bold', fontSize: 10, color: '#334155' },
  text: { fontSize: 9, color: '#475569', lineHeight: 1.4 },
  headerRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', padding: 10, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  metricBox: { width: '45%', padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#6366f1' },
  metricTitle: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' },
  metricValue: { fontSize: 22, color: '#0f172a', marginTop: 4, fontWeight: 'bold' },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 8, fontWeight: 'bold', textTransform: 'capitalize' }
});

interface BatchReportDocumentProps {
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

function formatDuration(seconds: number | undefined) {
  if (!seconds || seconds === 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const OUTCOME_COLORS: Record<string, string> = {
  scheduled_with_senior: "#6366f1",
  plans_emailed: "#0ea5e9",
  contract_sent: "#10b981",
  spoke_but_declined: "#a855f7",
  not_interested_hangup: "#64748b",
  not_interestd_hangup: "#64748b",
  busy_hangup: "#f59e0b",
  ai_objection_hangup: "#d946ef",
  immediate_hangup: "#ef4444",
  speak_no_word: "#94a3b8",
  voicemail: "#ec4899",
  callback_requested: "#14b8a6",
  no_answer: "#3b82f6",
  wrong_number_hangup: "#f43f5e",
  wrong_number: "#f43f5e",
  busy: "#f59e0b",
  hung_up: "#ef4444",
  call_ended_quickly: "#f97316",
  no_info_provided: "#94a3b8",
  not_evaluated: "#cbd5e1",
  failed: "#dc2626",
  other: "#06b6d4",
  unprocessed: "#cbd5e1",
};

function getOutcomeColor(outcome: string) {
  const lower = String(outcome).toLowerCase();
  if (OUTCOME_COLORS[lower]) return OUTCOME_COLORS[lower];
  const fallbackColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < lower.length; i++) { hash = lower.charCodeAt(i) + ((hash << 5) - hash); }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
}

function getArcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  if (endAngle - startAngle >= 360) { endAngle = startAngle + 359.999; }
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

export const BatchReportDocument = ({
  batchName, batchId, totalCalls, answerRate, conversionRate, avgDurationSecs, createdAt, outcomesCount, recipients,
}: BatchReportDocumentProps) => {

  let shortCalls = 0;
  let medCalls = 0;
  let longCalls = 0;

  const tableData = recipients.reduce((acc: any[], r) => {
    const outcome = r.analysis?.data_collection_results?.call_outcome?.value || r.analysis?.evaluation_criteria_results?.call_outcome?.result || r.call_outcome || r.recipientStatus || "Unknown";
    const duration = r.metadata?.call_duration_secs ?? r.call_duration_secs ?? r.duration ?? 0;
    const summary = r.analysis?.transcript_summary || "No summary available";
    const phone = r.phone_number || r.to || r.phone || "Unknown";
    const isVoicemail = String(outcome).toLowerCase().includes('voicemail') || String(r.status).toLowerCase().includes('voicemail');

    if (!isVoicemail) {
      if (duration > 0) {
        if (duration < 60) shortCalls++;
        else if (duration <= 180) medCalls++;
        else longCalls++;
      }
      acc.push({ phone, outcome, duration, summary });
    }
    return acc;
  }, []);

  tableData.sort((a, b) => String(a.outcome).localeCompare(String(b.outcome)));

  const radius = 45;
  let accumulatedAngle = 0;

  const outcomeChartData = Object.entries(outcomesCount)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count, color: getOutcomeColor(key) }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18 }}>3K</Text>
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#0f172a', fontSize: 16 }}>3knot</Text>
            <Text style={{ color: '#0ea5e9', fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Digital Voice</Text>
          </View>
        </View>

        <Text style={styles.title}>{batchName} - Analytics Report</Text>
        <Text style={styles.subtitle}>Batch ID: {batchId} | Generated on: {new Date().toLocaleDateString()}</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Total Calls</Text>
            <Text style={styles.metricValue}>{totalCalls}</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#8b5cf6'}}>
            <Text style={styles.metricTitle}>Answer Rate</Text>
            <Text style={styles.metricValue}>{answerRate}%</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#10b981'}}>
            <Text style={styles.metricTitle}>Conversion Rate</Text>
            <Text style={styles.metricValue}>{conversionRate}%</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#f59e0b'}}>
            <Text style={styles.metricTitle}>Avg Call Duration</Text>
            <Text style={styles.metricValue}>{formatDuration(avgDurationSecs)}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 16, marginTop: 10, marginBottom: 15, fontWeight: 'bold' }}>Conversation Outcomes Breakdown</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#3b82f6' }}>
          <View style={{ width: 120, height: 120, position: 'relative' }}>
            <View style={{ width: 120, height: 120 }}>
              <Svg width="120" height="120" viewBox="0 0 120 120">
                <Circle cx="60" cy="60" r={radius} stroke="#e2e8f0" strokeWidth="15" fill="none" />
                {outcomeChartData.map((item, idx) => {
                  const percent = (item.count / totalCalls) * 100;
                  const angle = (percent / 100) * 360;
                  
                  if (angle <= 0) return null;
                  
                  const d = getArcPath(60, 60, radius, accumulatedAngle, accumulatedAngle + angle);
                  accumulatedAngle += angle;
                  
                  return (
                    <Path
                      key={idx}
                      d={d}
                      stroke={item.color}
                      strokeWidth="15"
                      fill="none"
                    />
                  );
                })}
              </Svg>
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>{totalCalls}</Text>
              <Text style={{ fontSize: 8, color: '#64748b', fontWeight: 'bold' }}>TOTAL CALLS</Text>
            </View>
          </View>
          
          <View style={{ marginLeft: 30, flex: 1 }}>
            {outcomeChartData.map((item) => (
              <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color, marginRight: 8 }} />
                <Text style={{ fontSize: 10, color: '#334155', flex: 1, textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {item.key.replace(/_/g, ' ')}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a' }}>{item.count}</Text>
                <Text style={{ fontSize: 9, color: '#64748b', marginLeft: 8, width: 30, textAlign: 'right' }}>
                  {((item.count / totalCalls) * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Non-Voicemail Call Duration Analysis</Text>
        <Text style={styles.subtitle}>Understanding human engagement lengths</Text>
        <View style={styles.metricsContainer}>
          <View style={{...styles.metricBox, borderLeftColor: '#ef4444', width: '30%'}}>
            <Text style={styles.metricTitle}>Short Calls (&lt; 1 min)</Text>
            <Text style={styles.metricValue}>{shortCalls}</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#f59e0b', width: '30%'}}>
            <Text style={styles.metricTitle}>Medium Calls (1-3 mins)</Text>
            <Text style={styles.metricValue}>{medCalls}</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#10b981', width: '30%'}}>
            <Text style={styles.metricTitle}>Long Calls (&gt; 3 mins)</Text>
            <Text style={styles.metricValue}>{longCalls}</Text>
          </View>
        </View>

        {/* 1. Duration Distribution Bar Chart */}
        <View style={{ backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 30, borderLeftWidth: 3, borderLeftColor: '#6366f1' }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#334155' }}>Duration Distribution</Text>
          <View style={{ width: '100%', height: 160, position: 'relative' }}>
            <Svg width="100%" height="160" viewBox="0 0 500 160">
              {/* Grid Lines */}
              <Path d="M 0 10 L 500 10" stroke="#f1f5f9" strokeWidth="1" />
              <Path d="M 0 45 L 500 45" stroke="#f1f5f9" strokeWidth="1" />
              <Path d="M 0 80 L 500 80" stroke="#f1f5f9" strokeWidth="1" />
              <Path d="M 0 115 L 500 115" stroke="#f1f5f9" strokeWidth="1" />
              <Path d="M 0 130 L 500 130" stroke="#cbd5e1" strokeWidth="2" /> {/* Base Line */}
              
              {(() => {
                const maxVal = Math.max(shortCalls, medCalls, longCalls, 1);
                const heightPerUnit = 120 / maxVal;
                
                const shortHeight = shortCalls * heightPerUnit;
                const medHeight = medCalls * heightPerUnit;
                const longHeight = longCalls * heightPerUnit;
                
                return (
                  <>
                    {/* Short Bar */}
                    <Path d={`M 70 130 L 70 ${130 - shortHeight} A 4 4 0 0 1 74 ${130 - shortHeight - 4} L 126 ${130 - shortHeight - 4} A 4 4 0 0 1 130 ${130 - shortHeight} L 130 130 Z`} fill="#ef4444" />
                    {/* Med Bar */}
                    <Path d={`M 220 130 L 220 ${130 - medHeight} A 4 4 0 0 1 224 ${130 - medHeight - 4} L 276 ${130 - medHeight - 4} A 4 4 0 0 1 280 ${130 - medHeight} L 280 130 Z`} fill="#f59e0b" />
                    {/* Long Bar */}
                    <Path d={`M 370 130 L 370 ${130 - longHeight} A 4 4 0 0 1 374 ${130 - longHeight - 4} L 426 ${130 - longHeight - 4} A 4 4 0 0 1 430 ${130 - longHeight} L 430 130 Z`} fill="#10b981" />
                  </>
                );
              })()}
            </Svg>
            
            {/* Value Labels */}
            {(() => {
                const maxVal = Math.max(shortCalls, medCalls, longCalls, 1);
                const heightPerUnit = 120 / maxVal;
                return (
                  <>
                    {shortCalls > 0 && <Text style={{ position: 'absolute', bottom: 35 + (shortCalls * heightPerUnit), left: '17%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 'bold', color: '#ef4444' }}>{shortCalls}</Text>}
                    {medCalls > 0 && <Text style={{ position: 'absolute', bottom: 35 + (medCalls * heightPerUnit), left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 'bold', color: '#f59e0b' }}>{medCalls}</Text>}
                    {longCalls > 0 && <Text style={{ position: 'absolute', bottom: 35 + (longCalls * heightPerUnit), left: '83%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 'bold', color: '#10b981' }}>{longCalls}</Text>}
                  </>
                );
            })()}

            {/* X-Axis Labels */}
            <View style={{ flexDirection: 'row', position: 'absolute', bottom: 5, left: 0, right: 0, justifyContent: 'space-around' }}>
              <Text style={{ fontSize: 9, color: '#64748b', fontWeight: 'bold' }}>&lt; 1 min</Text>
              <Text style={{ fontSize: 9, color: '#64748b', fontWeight: 'bold' }}>1-3 mins</Text>
              <Text style={{ fontSize: 9, color: '#64748b', fontWeight: 'bold' }}>&gt; 3 mins</Text>
            </View>
          </View>
        </View>

        {/* 2. Top 5 Longest Conversations Table */}
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#334155' }}>Top 5 Longest Engagements</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.bold, { flex: 1 }]}>Phone</Text>
          <Text style={[styles.bold, { flex: 1 }]}>Duration</Text>
          <Text style={[styles.bold, { flex: 2 }]}>Outcome</Text>
        </View>
        
        {(() => {
          const topLongest = [...tableData].sort((a, b) => b.duration - a.duration).slice(0, 5);
          if (topLongest.length === 0) {
            return <Text style={{ ...styles.text, marginTop: 15, textAlign: 'center', color: '#94a3b8' }}>No data available.</Text>;
          }
          
          return topLongest.map((row, i) => (
            <View key={i} style={[styles.row, i % 2 === 0 ? styles.rowEven : {}]}>
              <Text style={[styles.text, { flex: 1 }]}>{row.phone}</Text>
              <Text style={[styles.text, { flex: 1, fontWeight: 'bold', color: '#10b981' }]}>{formatDuration(row.duration)}</Text>
              <View style={{ flex: 2 }}>
                <Text style={{ ...styles.badge, alignSelf: 'flex-start', backgroundColor: getOutcomeColor(row.outcome) + '20', color: getOutcomeColor(row.outcome) }}>
                  {row.outcome.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
          ));
        })()}

      </Page>

      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>Detailed Call Logs (Excluding Voicemails)</Text>
        <Text style={styles.subtitle}>With One-Line Summaries</Text>

        <View style={styles.headerRow} fixed>
          <Text style={[styles.bold, styles.colPhone]}>Phone</Text>
          <Text style={[styles.bold, styles.colOutcome]}>Outcome</Text>
          <Text style={[styles.bold, styles.colDuration]}>Duration</Text>
          <Text style={[styles.bold, styles.colSummary]}>One-Line Summary</Text>
        </View>

        {tableData.map((row, i) => (
          <View key={i} style={[styles.row, i % 2 === 0 ? styles.rowEven : {}]} wrap={false}>
            <Text style={[styles.text, styles.colPhone]}>{row.phone}</Text>
            <View style={styles.colOutcome}>
              <Text style={{ ...styles.badge, backgroundColor: getOutcomeColor(row.outcome) + '20', color: getOutcomeColor(row.outcome) }}>
                {row.outcome.replace(/_/g, ' ')}
              </Text>
            </View>
            <Text style={[styles.text, styles.colDuration]}>{formatDuration(row.duration)}</Text>
            <Text style={[styles.text, styles.colSummary]}>{row.summary}</Text>
          </View>
        ))}
        {tableData.length === 0 && (
          <Text style={{ ...styles.text, marginTop: 20, textAlign: 'center', color: '#94a3b8' }}>
            No non-voicemail calls to display for this batch.
          </Text>
        )}
      </Page>
    </Document>
  );
};
