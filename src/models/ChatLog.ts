import mongoose, { Schema, Document } from 'mongoose';

export interface IChatLog extends Document {
  leadId?: mongoose.Types.ObjectId;
  elevenlabsConversationId?: string;
  chatStatus: string;
  chatSummary?: string;
  chatErrorReason?: string;
  chatOutcome?: string;
  followUpRequired?: boolean;
  rawWebhookPayload?: any;
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema: Schema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    elevenlabsConversationId: { type: String },
    chatStatus: { type: String, required: true },
    chatSummary: { type: String },
    chatErrorReason: { type: String },
    chatOutcome: { type: String },
    followUpRequired: { type: Boolean, default: false },
    rawWebhookPayload: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const ChatLogModel = mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
export default ChatLogModel as mongoose.Model<IChatLog>;
