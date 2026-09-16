import connectDB from '@/lib/mongodb';
import ChatLogModel, { IChatLog, IChatMessage } from '@/models/ChatLog';
import LeadModel from '@/models/Lead';
import { alexChatGraph } from './graph';
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import { generateChatSummaryAction } from '@/actions/chat.actions';
import type { ChatAgentOptions, ChatAgentResponse } from '@/types/agent';

export type { ChatAgentOptions, ChatAgentResponse };

/**
 * High-level entrypoint for the Alex LangGraph Chat Agent
 */
export async function executeChatAgent({
  sessionId,
  userMessage,
  platform = 'web',
  userProfile,
}: ChatAgentOptions): Promise<ChatAgentResponse> {
  await connectDB();

  // 1. Fetch past conversation history from MongoDB ChatLog
  let chatLog = await ChatLogModel.findOne({
    senderPsid: sessionId,
    platform: platform,
  }).sort({ updatedAt: -1 });

  const pastMessages: BaseMessage[] = [];
  let hoursSinceLastMessage = 0;

  if (chatLog && Array.isArray(chatLog.messages)) {
    if (chatLog.messages.length > 0) {
      const lastMsg = chatLog.messages[chatLog.messages.length - 1];
      if (lastMsg.timestamp) {
        hoursSinceLastMessage = (new Date().getTime() - new Date(lastMsg.timestamp).getTime()) / (1000 * 60 * 60);
      }
    }

    // Convert the last 15 messages into LangChain messages
    const recentTurns = chatLog.messages.slice(-15);
    for (const msg of recentTurns) {
      if (msg.role === 'user') {
        pastMessages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'agent') {
        pastMessages.push(new AIMessage(msg.content));
      }
    }
  }

  // 2. Add current incoming user message
  if (hoursSinceLastMessage >= 12) {
    pastMessages.push(
      new SystemMessage(
        `[SYSTEM NOTE: The user has returned after a delay of ${Math.round(hoursSinceLastMessage)} hours. Before continuing with the current conversation stage, acknowledge their return politely (e.g. "Welcome back!", "Glad to see you again!"), briefly recap where you left off if appropriate, and then naturally transition back to the current goal.]`
      )
    );
  }

  pastMessages.push(new HumanMessage(userMessage));

  // 3. Execute the LangGraph State Machine
  console.log(`🤖 [LangGraph Agent] Executing turn for Session [${sessionId}] (${platform})...`);
  const graphResult = await alexChatGraph.invoke({
    messages: pastMessages,
    conversationStage: chatLog?.conversationStage || 'INITIAL_ENGAGEMENT',
  });
  
  const newStage = (graphResult.conversationStage || 'INITIAL_ENGAGEMENT') as IChatLog['conversationStage'];

  // 4. Extract the final AI response
  const resultMessages = graphResult.messages;
  let finalReply = "Hello! Are you looking for publishing services?";

  for (let i = resultMessages.length - 1; i >= 0; i--) {
    const msg = resultMessages[i];
    if (msg._getType() === 'ai' && typeof msg.content === 'string' && msg.content.trim()) {
      finalReply = msg.content.trim();
      break;
    }
  }

  // 5. Persist the turn to MongoDB
  const now = new Date();
  const newTurns: IChatMessage[] = [
    { role: 'user', content: userMessage, timestamp: now },
    { role: 'agent', content: finalReply, timestamp: now },
  ];

  const isFirstMessage = !chatLog || (chatLog.messages && chatLog.messages.length === 0);

  if (!chatLog) {
    chatLog = new ChatLogModel({
      senderPsid: sessionId,
      platform: platform,
      chatStatus: 'completed',
      messages: newTurns,
      conversationStage: newStage,
    });
  } else {
    chatLog.messages = chatLog.messages || [];
    chatLog.messages.push(...newTurns);
    chatLog.conversationStage = newStage;
  }

  const allMsgs = chatLog.messages || [];

  // Check if contact info was captured in this conversation
  const transcriptLower = allMsgs.map(m => m.content).join(' ').toLowerCase();
  const hasPhone = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/.test(transcriptLower);
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(transcriptLower);

  if (hasPhone || hasEmail) {
    chatLog.chatOutcome = 'Lead Captured';
  } else if (transcriptLower.includes('amazon') || transcriptLower.includes('kdp') || transcriptLower.includes('margin')) {
    chatLog.chatOutcome = 'KDP Assistance';
  } else if (transcriptLower.includes('illustration') || transcriptLower.includes('cover')) {
    chatLog.chatOutcome = 'Design Inquiry';
  } else {
    chatLog.chatOutcome = 'Author Discovery';
  }

  // Auto-generate rolling summary only if full AI summary hasn't been generated yet
  const hasRealAiSummary = !!(chatLog.rawWebhookPayload?.analysis?.summary);
  const firstUserMsg = allMsgs.find(m => m.role === 'user')?.content || 'Inquiry';
  const lastUserMsg = allMsgs.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  
  if (!hasRealAiSummary) {
    if (allMsgs.length <= 2) {
      chatLog.chatSummary = `Initial author inquiry: "${firstUserMsg.slice(0, 100)}..."`;
    } else if (!chatLog.chatSummary || chatLog.chatSummary.startsWith('Initial author inquiry') || chatLog.chatSummary.startsWith('Author exploring')) {
      chatLog.chatSummary = `Author exploring publishing options. Discussed book details and requirements. Latest topic: "${lastUserMsg.slice(0, 80)}..."`;
    }
  }

  chatLog.updatedAt = now;
  await chatLog.save();

  // Vercel Serverless-compatible background execution
  const chatLogIdStr = chatLog._id.toString();
  try {
    const { after } = await import('next/server');
    if (typeof after === 'function') {
      after(async () => {
        try {
          await generateChatSummaryAction(chatLogIdStr);
        } catch (err: any) {
          console.warn(`[AutoSummary] Background Gemini analysis failed for ${chatLogIdStr}:`, err?.message || err);
        }
      });
    } else {
      setTimeout(() => {
        generateChatSummaryAction(chatLogIdStr).catch(() => {});
      }, 100);
    }
  } catch {
    // Fallback if executed outside Next.js server context (e.g., CLI test scripts)
    setTimeout(() => {
      generateChatSummaryAction(chatLogIdStr).catch(() => {});
    }, 100);
  }

  let finalReplies: string[] = [];
  if (isFirstMessage) {
    finalReplies.push("Hey this is Emma, hope you are doing good.");
  }
  finalReplies.push(finalReply);

  return {
    reply: finalReply,
    replies: finalReplies,
    sessionId,
    platform,
    chatLogId: chatLog._id.toString(),
  };
}
