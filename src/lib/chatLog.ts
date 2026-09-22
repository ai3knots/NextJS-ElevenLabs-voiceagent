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

  const filter = options.chatId
    ? { _id: options.chatId }
    : { senderPsid: options.senderPsid, platform: options.platform || 'web' };

  const updated = await ChatLogModel.findOneAndUpdate(
    filter,
    {
      $push: { messages: message },
      $set: { chatStatus: 'ongoing', updatedAt: now },
    },
    { new: true, sort: { updatedAt: -1 } }
  );

  if (updated) {
    return updated;
  }

  const created = await ChatLogModel.create({
    senderPsid: options.senderPsid,
    platform: options.platform || 'web',
    chatStatus: 'ongoing',
    agentEnabled: true,
    messages: [message],
  });

  return created;
}
