export interface Env {
  META_VERIFY_TOKEN: string;
  META_API: string;
  ELEVENLABS_AGENT_ID: string;
  CRM_SYNC_URL?: string;
  CHAT_SESSION: DurableObjectNamespace;
}

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
              console.log(`💬 [Cloudflare Worker] Routing message for PSID ${senderPsid}: "${messageText}"`);

              // Route directly to user's dedicated Stateful Durable Object
              const id = env.CHAT_SESSION.idFromName(senderPsid);
              const stub = env.CHAT_SESSION.get(id);

              ctx.waitUntil(
                stub.fetch(
                  new Request('https://chat-session/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ senderPsid, text: messageText }),
                  })
                )
              );
            }
          }
          return new Response('EVENT_RECEIVED', { status: 200 });
        }

        return new Response('Not Found', { status: 404 });
      } catch (err: any) {
        console.error('Error in Worker POST:', err);
        return new Response(err.message, { status: 500 });
      }
    }

    return new Response('Messenger-ElevenLabs Durable Worker is running!', { status: 200 });
  },
};

/**
 * Stateful Durable Object that preserves the Live WebSocket session to ElevenLabs per user
 */
export class ChatSession implements DurableObject {
  state: DurableObjectState;
  env: Env;
  ws: WebSocket | null = null;
  transcript: Array<{ role: 'user' | 'agent'; content: string }> = [];
  flushTimer: any = null;
  responseBuffer: string = '';
  inactivityTimer: any = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const { senderPsid, text } = (await request.json()) as { senderPsid: string; text: string };

    this.transcript.push({ role: 'user', content: text });

    // Connect to ElevenLabs if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.initElevenLabsSession(senderPsid);
    }

    // Send user message over the active, persistent WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'user_message',
          text: text,
        })
      );
    }

    // Reset 5-minute inactivity auto-close timer
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      console.log(`⏰ [Durable Object] 5-min inactivity reached. Closing session for ${senderPsid}`);
      this.closeSession(senderPsid);
    }, 5 * 60 * 1000);

    return new Response('PROCESSED', { status: 200 });
  }

  initElevenLabsSession(senderPsid: string): Promise<void> {
    return new Promise((resolve) => {
      const agentId = this.env.ELEVENLABS_AGENT_ID || 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa';
      this.ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`);

      this.ws.addEventListener('open', () => {
        console.log(`🟢 [Durable Object] Live ElevenLabs WebSocket OPEN for PSID: ${senderPsid}`);
        resolve();
      });

      this.ws.addEventListener('message', async (event: any) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === 'agent_response') {
            const chunk = parsed.agent_response_event?.agent_response?.trim();
            if (chunk) {
              this.responseBuffer = this.responseBuffer ? `${this.responseBuffer}\n\n${chunk}` : chunk;

              // Buffer and flush after 1.5s silence
              if (this.flushTimer) clearTimeout(this.flushTimer);
              this.flushTimer = setTimeout(async () => {
                const reply = this.responseBuffer.trim();
                if (reply) {
                  this.transcript.push({ role: 'agent', content: reply });
                  await this.sendToMeta(senderPsid, reply);
                  this.responseBuffer = '';
                }
              }, 1500);
            }
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      });

      this.ws.addEventListener('close', () => {
        console.log(`🔴 [Durable Object] ElevenLabs WS Closed for PSID: ${senderPsid}`);
        this.ws = null;
      });

      this.ws.addEventListener('error', (err) => {
        console.error('WS Error in Durable Object:', err);
      });
    });
  }

  async sendToMeta(recipientId: string, messageText: string) {
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/me/messages?access_token=${this.env.META_API}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText },
        }),
      });
      const result = await res.json();
      console.log(`🚀 [Durable Object] Delivered to Messenger PSID ${recipientId}:`, result);
    } catch (error) {
      console.error('Error sending message to Meta:', error);
    }
  }

  async closeSession(senderPsid: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
    }
    // Sync full conversation transcript to CRM
    if (this.env.CRM_SYNC_URL && this.transcript.length) {
      try {
        await fetch(this.env.CRM_SYNC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderPsid,
            platform: 'messenger',
            messages: this.transcript,
          }),
        });
        console.log(`✅ Synced session transcript to CRM for PSID: ${senderPsid}`);
      } catch (e) {
        console.error('Error syncing transcript to CRM:', e);
      }
    }
  }
}
