import { NextResponse } from 'next/server';
import { executeChatAgent } from '@/agent';
import { sendMessageToMeta, sendSenderActionToMeta } from '@/lib/meta';
import { appendChatMessage } from '@/lib/chatLog';
import ChatLogModel from '@/models/ChatLog';
import { isEmmaAutoReplyEnabled, withChatSessionLock } from '@/lib/emmaSettings';
import { waitUntil } from '@vercel/functions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// This is the Verify Token you set up in the Meta App Dashboard
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔥 INCOMING WEBHOOK PAYLOAD:", JSON.stringify(body, null, 2));

    // Check if this is an event from a page subscription
    if (body.object === 'page') {
      
      // Iterate over each entry - there may be multiple if batched
      for (const entry of body.entry) {
        // Get the webhook event. entry.messaging is an array, but 
        // will only ever contain one event, so we get index 0
        const webhookEvent = entry.messaging?.[0];
        
        if (!webhookEvent) continue;

        // Ignore echo messages (messages sent by the page/bot itself)
        if (webhookEvent.message?.is_echo) {
          console.log('Ignoring echo message.');
          continue;
        }

        // Get the sender PSID
        const senderPsid = webhookEvent.sender?.id;
        
        // Check if the event is a message with text
        if (senderPsid && webhookEvent.message && webhookEvent.message.text) {
          const incomingText = webhookEvent.message.text;
          console.log(`💬 Received Messenger message from ${senderPsid}: "${incomingText}"`);

          waitUntil(
            withChatSessionLock(senderPsid, async () => {
              try {
                const chatLog = await appendChatMessage({
                  senderPsid,
                  platform: 'messenger',
                  role: 'user',
                  content: incomingText,
                });

                const globalOn = await isEmmaAutoReplyEnabled();
                const latest = await ChatLogModel.findById(chatLog._id).select('agentEnabled').lean();
                console.log(`Emma gate for ${senderPsid}: global=${globalOn} chat=${latest?.agentEnabled}`);

                if (!globalOn) {
                  console.log(`Global Emma switch is off; inbound saved only for ${senderPsid}.`);
                  return;
                }

                if (latest && latest.agentEnabled === false) {
                  console.log(`This chat is in human takeover; Emma skipped for ${senderPsid}.`);
                  return;
                }

                const agentResponse = await executeChatAgent({
                  sessionId: senderPsid,
                  userMessage: incomingText,
                  platform: 'messenger',
                  skipPersistUserMessage: true,
                });

                console.log(`🤖 Alex Agent Reply for ${senderPsid}:`, agentResponse.replies);

                const replies = agentResponse.replies && agentResponse.replies.length > 0
                  ? agentResponse.replies
                  : [agentResponse.reply];

                for (const text of replies) {
                  if (!text?.trim()) continue;
                  await sendSenderActionToMeta(senderPsid, 'typing_on');
                  const delayMs = Math.min(400 + (text.length * 8), 1500);
                  await new Promise((resolve) => setTimeout(resolve, delayMs));
                  const sent = await sendMessageToMeta(senderPsid, text);
                  if (!sent.success) {
                    console.error(`Meta send failed for ${senderPsid}:`, sent.error);
                  }
                }
              } catch (error) {
                console.error(`Error processing background message for ${senderPsid}:`, error);
              }
            })
          );
        }
      }

      // Return a '200 OK' response to all requests
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error in Webhook POST handler:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
