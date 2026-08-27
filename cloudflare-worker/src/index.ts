export interface Env {
  META_VERIFY_TOKEN: string;
  META_API: string;
  ELEVENLABS_AGENT_ID: string;
  CRM_SYNC_URL?: string;
}

interface ActiveSession {
  ws: WebSocket;
  lastActive: number;
  timer: any;
  transcript: Array<{ role: 'user' | 'agent'; content: string }>;
}

// In-Memory Global Session Map per Messenger User (senderPsid)
const activeSessions = new Map<string, ActiveSession>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Meta Webhook Handshake Verification (GET)
    if (request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const expectedToken = env.META_VERIFY_TOKEN || 'my_custom_verify_token_123';
      if (mode === 'subscribe' && token === expectedToken) {
        console.log('✅ Meta Webhook Verified on Cloudflare Worker');
        return new Response(challenge, { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }

    // 2. Incoming Messages from Meta Messenger (POST)
    if (request.method === 'POST') {
      try {
        const body: any = await request.json();

        if (body.object === 'page') {
          for (const entry of body.entry || []) {
            const webhookEvent = entry.messaging?.[0];
            if (!webhookEvent || webhookEvent.message?.is_echo) continue;

            const senderPsid = webhookEvent.sender?.id;
            const messageText = webhookEvent.message?.text;

            if (senderPsid && messageText) {
              console.log(`💬 [Cloudflare] Received from PSID ${senderPsid}: ${messageText}`);
              // Process ElevenLabs session asynchronously in background
              ctx.waitUntil(handleMessengerUserMessage(senderPsid, messageText, env));
            }
          }
          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        return new Response('Not Found', { status: 404 });
      } catch (err: any) {
        console.error('Error handling POST:', err);
        return new Response(err.message, { status: 500 });
      }
    }

    return new Response('Messenger-ElevenLabs-Worker is running!', { status: 200 });
  },
};

/**
 * Handles incoming Messenger message, reusing open ElevenLabs WebSocket connection
 */
async function handleMessengerUserMessage(senderPsid: string, text: string, env: Env) {
  const agentId = env.ELEVENLABS_AGENT_ID || 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa';
  let session = activeSessions.get(senderPsid);

  // If no active session or WebSocket disconnected, create a new persistent connection
  if (!session || session.ws.readyState !== WebSocket.OPEN) {
    session = await createElevenLabsSession(senderPsid, agentId, env);
    activeSessions.set(senderPsid, session);
  }

  // Record user message in session transcript
  session.transcript.push({ role: 'user', content: text });
  session.lastActive = Date.now();

  // Clear previous inactivity timeout
  if (session.timer) clearTimeout(session.timer);

  // Send user message over the EXISTING open WebSocket
  session.ws.send(
    JSON.stringify({
      type: 'user_message',
      text: text,
    })
  );

  // Set 5-Minute Inactivity Auto-Close Timer
  session.timer = setTimeout(async () => {
    console.log(`⏰ Inactivity timeout reached (5 mins). Finalizing session for PSID: ${senderPsid}`);
    if (session && session.ws.readyState === WebSocket.OPEN) {
      session.ws.close();
    }
    // Sync full conversation to CRM
    if (env.CRM_SYNC_URL && session?.transcript.length) {
      await syncToCrm(senderPsid, session.transcript, env.CRM_SYNC_URL);
    }
    activeSessions.delete(senderPsid);
  }, 5 * 60 * 1000);
}

/**
 * Creates and maintains a single persistent WebSocket session to ElevenLabs
 */
function createElevenLabsSession(senderPsid: string, agentId: string, env: Env): Promise<ActiveSession> {
  return new Promise((resolve) => {
    const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`);

    let responseBuffer = '';
    let flushTimer: any = null;
    const sessionObj: ActiveSession = {
      ws,
      lastActive: Date.now(),
      timer: null,
      transcript: [],
    };

    const flushResponseToMessenger = async () => {
      const reply = responseBuffer.trim();
      if (reply) {
        sessionObj.transcript.push({ role: 'agent', content: reply });
        await sendToMeta(senderPsid, reply, env.META_API);
        responseBuffer = '';
      }
    };

    ws.addEventListener('open', () => {
      console.log(`🟢 [ElevenLabs WS Connected] Single Live Session started for PSID: ${senderPsid}`);
      resolve(sessionObj);
    });

    ws.addEventListener('message', async (event: any) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === 'agent_response') {
          const chunk = parsed.agent_response_event?.agent_response?.trim();
          if (chunk) {
            responseBuffer = responseBuffer ? `${responseBuffer}\n\n${chunk}` : chunk;

            // Wait 1.5s after last chunk, then flush full message to Messenger
            if (flushTimer) clearTimeout(flushTimer);
            flushTimer = setTimeout(flushResponseToMessenger, 1500);
          }
        }
      } catch (e) {
        console.error('Error parsing WS message from ElevenLabs:', e);
      }
    });

    ws.addEventListener('close', () => {
      console.log(`🔴 [ElevenLabs WS Closed] Session finished for PSID: ${senderPsid}`);
      activeSessions.delete(senderPsid);
    });

    ws.addEventListener('error', (err) => {
      console.error('WS Error:', err);
    });
  });
}

/**
 * Sends reply back to user on Facebook Messenger
 */
async function sendToMeta(recipientId: string, messageText: string, metaToken: string) {
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${metaToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText },
      }),
    });
    const result = await res.json();
    console.log(`🚀 Delivered to Messenger PSID ${recipientId}:`, result);
  } catch (error) {
    console.error('Error delivering to Meta:', error);
  }
}

/**
 * Automatically pushes completed chat transcript to CRM /chats
 */
async function syncToCrm(senderPsid: string, transcript: Array<{ role: 'user' | 'agent'; content: string }>, syncUrl: string) {
  try {
    await fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderPsid,
        platform: 'messenger',
        messages: transcript,
      }),
    });
    console.log(`✅ Synced completed chat transcript to CRM for PSID: ${senderPsid}`);
  } catch (e) {
    console.error('Error syncing chat to CRM:', e);
  }
}
