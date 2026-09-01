import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp?: Date;
}

export interface IChatLog extends Document {
  leadId?: mongoose.Types.ObjectId;
  elevenlabsConversationId?: string;
  senderPsid?: string;
  platform?: 'web' | 'messenger';
  messages?: IChatMessage[];
  chatStatus: string;
  chatSummary?: string;
  chatErrorReason?: string;
  chatOutcome?: string;
  conversationStage?: 'INITIAL_ENGAGEMENT' | 'QUALIFYING' | 'VALUE_CREATION' | 'CONTACT_CAPTURE' | 'PLANS' | 'SCHEDULING';
  followUpRequired?: boolean;
  rawWebhookPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    elevenlabsConversationId: { type: String },
    senderPsid: { type: String, index: true },
    platform: { type: String, enum: ['web', 'messenger'], default: 'web' },
    messages: [
      {
        role: { type: String, enum: ['user', 'agent'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    chatStatus: { type: String, required: true, default: 'completed' },
    chatSummary: { type: String },
    chatErrorReason: { type: String },
    chatOutcome: { type: String },
    conversationStage: { type: String, enum: ['INITIAL_ENGAGEMENT', 'QUALIFYING', 'VALUE_CREATION', 'CONTACT_CAPTURE', 'PLANS', 'SCHEDULING'], default: 'INITIAL_ENGAGEMENT' },
    followUpRequired: { type: Boolean, default: false },
    rawWebhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const ChatLogModel = mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
export default ChatLogModel as mongoose.Model<IChatLog>;
