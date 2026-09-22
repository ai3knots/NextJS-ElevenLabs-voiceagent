import connectDB from '@/lib/mongodb';
import ChatLogModel, { ChatMessageRole, IChatLog } from '@/models/ChatLog';

export async function appendChatMessage(options: {
  senderPsid?: string;
  platform?: 'web' | 'messenger';
  chatId?: string;
  role: ChatMessageRole;
  content: string;
}): Promise<IChatLog> {
  await connectDB();

  const now = new Date();
  const message = {
    role: options.role,
    content: options.content,
    timestamp: now,
  };

  let chatLog: IChatLog | null = null;

  if (options.chatId) {
    chatLog = await ChatLogModel.findById(options.chatId);
  } else if (options.senderPsid) {
    chatLog = await ChatLogModel.findOne({
      senderPsid: options.senderPsid,
      platform: options.platform || 'web',
    }).sort({ updatedAt: -1 });
  }

  if (!chatLog) {
    chatLog = new ChatLogModel({
      senderPsid: options.senderPsid,
      platform: options.platform || 'web',
      chatStatus: 'completed',
      agentEnabled: true,
      messages: [message],
    });
  } else {
    chatLog.messages = chatLog.messages || [];
    chatLog.messages.push(message);
  }

  chatLog.updatedAt = now;
  await chatLog.save();
  return chatLog;
}
