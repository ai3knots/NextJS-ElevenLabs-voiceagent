/**
 * Shared Lead-related types (plain interfaces, separate from Mongoose Document)
 */

export interface LeadBase {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  context?: string;
  bookTopic?: string;
  writingStage?: string;
  batchId?: string;
  batchName?: string;
  source?: string;
  callType?: 'manual' | 'auto';
  callDelayMinutes?: number;
  status?: string;
  callStatus?: string;
  elevenlabsConversationId?: string;
  callSummary?: string;
  recordingUrl?: string;
  callErrorReason?: string;
  preferredCallbackTime?: string;
  followUpStatus?: string;
  lastCallOutcome?: string;
  lastCallSummary?: string;
  lastConversationId?: string;
  lastCompletedStage?: string;
  followUpNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** A plain (serialized) lead object for use in client components */
export interface SerializedLead extends LeadBase {
  _id: string;
}
