import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Circle } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    paddingTop: 8,
  },
  rowEven: {
    backgroundColor: '#f8fafc',
  },
  col2: {
    flex: 2,
  },
  col: {
    flex: 1,
  },
  // Table specific columns
  colPhone: { flex: 1.2, paddingRight: 4 },
  colOutcome: { flex: 1.5, paddingRight: 4 },
  colDuration: { flex: 0.8, paddingRight: 4 },
  colSummary: { flex: 3 },
  
  bold: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#334155',
  },
  text: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  metricBox: {
    width: '45%',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  metricTitle: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 22,
    color: '#0f172a',
    marginTop: 4,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  }
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

function getOutcomeColor(outcome: string) {
  const lower = String(outcome).toLowerCase();
  if (lower.includes('scheduled') || lower.includes('contract') || lower.includes('converted')) return '#10b981'; // Emerald
  if (lower.includes('voicemail') || lower.includes('emailed') || lower.includes('callback')) return '#3b82f6'; // Blue
  if (lower.includes('hangup') || lower.includes('failed') || lower.includes('busy') || lower.includes('wrong')) return '#ef4444'; // Red
  return '#8b5cf6'; // Violet for others
}

export const BatchReportDocument = ({
  batchName,
  batchId,
  totalCalls,
  answerRate,
  conversionRate,
  avgDurationSecs,
  createdAt,
  outcomesCount,
  recipients,
}: BatchReportDocumentProps) => {

  // Non-Voicemail Duration Analysis
  let shortCalls = 0; // < 1 min
  let medCalls = 0; // 1-3 mins
  let longCalls = 0; // > 3 mins

  // Filter for table
  const tableData = recipients.reduce((acc: any[], r) => {
    const outcome = r.analysis?.data_collection_results?.call_outcome?.value || 
                    r.analysis?.evaluation_criteria_results?.call_outcome?.result || 
                    r.call_outcome || 
                    r.recipientStatus ||
                    "Unknown";
    
    const duration = r.metadata?.call_duration_secs ?? r.call_duration_secs ?? r.duration ?? 0;
    const summary = r.analysis?.transcript_summary || "No summary available";
    const phone = r.phone_number || r.to || r.phone || "Unknown";
    
    const isVoicemail = String(outcome).toLowerCase().includes('voicemail') || 
                        String(r.status).toLowerCase().includes('voicemail');

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

  // Group logs by outcome (sort alphabetically)
  tableData.sort((a, b) => String(a.outcome).localeCompare(String(b.outcome)));

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const outcomeChartData = Object.entries(outcomesCount)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count, color: getOutcomeColor(key) }));

  return (
    <Document>
      {/* Page 1: High-Level Batch Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{batchName} - Analytics Report</Text>
        <Text style={styles.subtitle}>Batch ID: {batchId} | Generated on: {new Date().toLocaleDateString()}</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>Total Calls</Text>
            <Text style={styles.metricValue}>{totalCalls}</Text>
          </View>
          <View style={styles.metricBox}>
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
        
        {/* SVG Donut Chart & Legend */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#3b82f6' }}>
          <View style={{ width: 120, height: 120, position: 'relative' }}>
            <View style={{ transform: 'rotate(-90deg)', width: 120, height: 120 }}>
              <Svg width="120" height="120" viewBox="0 0 120 120">
                <Circle cx="60" cy="60" r={radius} stroke="#e2e8f0" strokeWidth="15" fill="none" />
                {outcomeChartData.map((item, idx) => {
                  const percent = (item.count / totalCalls) * 100;
                  const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  accumulatedPercent += percent;
                  
                  return (
                    <Circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke={item.color}
                      strokeWidth="15"
                      fill="none"
                      {...({
                        strokeDasharray,
                        strokeDashoffset
                      } as any)}
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

      {/* Page 2: Duration Analysis */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Non-Voicemail Call Duration Analysis</Text>
        <Text style={styles.subtitle}>Understanding human engagement lengths</Text>
        
        <View style={styles.metricsContainer}>
          <View style={{...styles.metricBox, borderLeftColor: '#ef4444'}}>
            <Text style={styles.metricTitle}>Short Calls (&lt; 1 min)</Text>
            <Text style={styles.metricValue}>{shortCalls}</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#f59e0b'}}>
            <Text style={styles.metricTitle}>Medium Calls (1-3 mins)</Text>
            <Text style={styles.metricValue}>{medCalls}</Text>
          </View>
          <View style={{...styles.metricBox, borderLeftColor: '#10b981'}}>
            <Text style={styles.metricTitle}>Long Calls (&gt; 3 mins)</Text>
            <Text style={styles.metricValue}>{longCalls}</Text>
          </View>
        </View>
      </Page>

      {/* Page 3+: Detailed Call Logs */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>Detailed Call Logs (Excluding Voicemails)</Text>
        <Text style={styles.subtitle}>With One-Line Summaries</Text>

        <View style={styles.headerRow} fixed>
          <View style={styles.colPhone}><Text style={styles.bold}>Phone</Text></View>
          <View style={styles.colOutcome}><Text style={styles.bold}>Outcome</Text></View>
          <View style={styles.colDuration}><Text style={styles.bold}>Duration</Text></View>
          <View style={styles.colSummary}><Text style={styles.bold}>One-Line Summary</Text></View>
        </View>

        {tableData.map((row, i) => (
          <View key={i} style={[styles.row, i % 2 === 0 ? styles.rowEven : {}]} wrap={false}>
            <View style={styles.colPhone}><Text style={styles.text}>{row.phone}</Text></View>
            <View style={styles.colOutcome}>
              <Text style={{ ...styles.text, color: getOutcomeColor(String(row.outcome)), fontWeight: 'bold', textTransform: 'capitalize' }}>
                {String(row.outcome).replace(/_/g, ' ')}
              </Text>
            </View>
            <View style={styles.colDuration}><Text style={styles.text}>{formatDuration(row.duration)}</Text></View>
            <View style={styles.colSummary}>
              <Text style={styles.text}>
                {String(row.summary).substring(0, 150)}{String(row.summary).length > 150 ? '...' : ''}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};
