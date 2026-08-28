/**
 * Helper to serialize Mongoose ChatLog documents into 100% plain JS objects
 * for safe passing from Server Components to Client Components in Next.js.
 */
export function sanitizeChatLog(doc: any) {
  if (!doc) return null;

  const lead = doc.leadId;
  let serializedLead: any = null;
  if (lead) {
    if (typeof lead === 'object' && lead._id) {
      serializedLead = {
        _id: lead._id.toString(),
        firstName: lead.firstName || '',
        lastName: lead.lastName || '',
        email: lead.email || '',
        phoneNumber: lead.phoneNumber || '',
        bookTopic: lead.bookTopic || '',
        writingStage: lead.writingStage || '',
        callStatus: lead.callStatus || 'pending',
      };
    } else {
      serializedLead = { _id: lead.toString() };
    }
  }

  return {
    _id: doc._id ? doc._id.toString() : '',
    leadId: serializedLead,
    elevenlabsConversationId: doc.elevenlabsConversationId || null,
    senderPsid: doc.senderPsid || '',
    platform: doc.platform || 'web',
    messages: Array.isArray(doc.messages)
      ? doc.messages.map((m: any) => ({
          role: m.role || 'user',
          content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          timestamp: m.timestamp ? (m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp)) : null,
        }))
      : [],
    chatStatus: doc.chatStatus || 'completed',
    chatSummary: doc.chatSummary || '',
    chatErrorReason: doc.chatErrorReason || '',
    chatOutcome: doc.chatOutcome || '',
    followUpRequired: Boolean(doc.followUpRequired),
    rawWebhookPayload: doc.rawWebhookPayload ? JSON.parse(JSON.stringify(doc.rawWebhookPayload)) : null,
    createdAt: doc.createdAt ? (doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt)) : new Date().toISOString(),
    updatedAt: doc.updatedAt ? (doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt)) : new Date().toISOString(),
  };
}

export function sanitizeChatLogs(docs: any[]) {
  if (!Array.isArray(docs)) return [];
  return docs.map(sanitizeChatLog);
}
