import { NextResponse } from 'next/server';
import { executeChatAgent } from '@/live_agent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, platform = 'web' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const currentSessionId = sessionId || `web_session_${Date.now()}`;

    const result = await executeChatAgent({
      sessionId: currentSessionId,
      userMessage: message.trim(),
      platform: platform as 'web' | 'messenger',
    });

    return NextResponse.json({
      success: true,
      reply: result.reply,
      replies: result.replies,
      sessionId: result.sessionId,
      chatLogId: result.chatLogId,
    });
  } catch (error: any) {
    console.error('Error in /api/live-chat route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat turn' },
      { status: 500 }
    );
  }
}
