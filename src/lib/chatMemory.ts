import connectDB from '@/lib/mongodb';
import ChatLog, { IChatLog, IChatMessage } from '@/models/ChatLog';

export interface MessengerHistoryResult {
  isReturningUser: boolean;
  historyTranscript: string;
  previousMessagesCount: number;
}

/**
 * Retrieves the recent conversation history for a given Messenger user (PSID).
 */
export async function getMessengerChatHistory(
  senderPsid: string,
  historyLimit: number = 10
): Promise<MessengerHistoryResult> {
  try {
    await connectDB();

    const existingChat = await ChatLog.findOne({
      senderPsid: senderPsid,
      platform: 'messenger',
    }).sort({ updatedAt: -1 });

    if (!existingChat || !existingChat.messages || existingChat.messages.length === 0) {
      return {
        isReturningUser: false,
        historyTranscript: '',
        previousMessagesCount: 0,
      };
    }

    // Take the most recent N messages
    const recentMessages = existingChat.messages.slice(-historyLimit);

    const historyTranscript = recentMessages
      .map((msg: IChatMessage) => {
        const speaker = msg.role === 'user' ? 'Customer' : 'Elizabeth (Publishing Agent)';
        return `${speaker}: ${msg.content}`;
      })
      .join('\n');

    return {
      isReturningUser: existingChat.messages.length > 0,
      historyTranscript,
      previousMessagesCount: existingChat.messages.length,
    };
  } catch (error) {
    console.error('Error fetching messenger chat history from DB:', error);
    return {
      isReturningUser: false,
      historyTranscript: '',
      previousMessagesCount: 0,
    };
  }
}

/**
 * Appends a user message and the agent's reply to the persistent ChatLog in MongoDB.
 */
export async function saveMessengerChatMessage(
  senderPsid: string,
  userText: string,
  agentReply: string
): Promise<void> {
  try {
    await connectDB();

    const now = new Date();
    const newMessages: IChatMessage[] = [
      { role: 'user', content: userText, timestamp: now },
      { role: 'agent', content: agentReply, timestamp: now },
    ];

    let chatDoc = await ChatLog.findOne({
      senderPsid: senderPsid,
      platform: 'messenger',
    }).sort({ updatedAt: -1 });

    if (!chatDoc) {
      chatDoc = new ChatLog({
        senderPsid,
        platform: 'messenger',
        chatStatus: 'completed',
        messages: newMessages,
      });
    } else {
      chatDoc.messages = chatDoc.messages || [];
      chatDoc.messages.push(...newMessages);
    }

    const messagesList = chatDoc.messages || [];
    chatDoc.chatSummary = messagesList
      .map((m: IChatMessage) => `${m.role === 'user' ? 'Customer' : 'AI Agent'}: ${m.content}`)
      .join('\n\n');
    chatDoc.chatOutcome = 'in_progress';
    chatDoc.updatedAt = now;

    await chatDoc.save();
    console.log(`💾 Saved conversation turn for PSID: ${senderPsid} in ChatLog ID: ${chatDoc._id}`);
  } catch (error) {
    console.error('Error saving messenger chat turn to DB:', error);
  }
}
