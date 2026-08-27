import axios from 'axios';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.AGENT_ID;

const client = axios.create({
  baseURL: 'https://api.elevenlabs.io',
  headers: {
    'xi-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

export async function triggerOutboundCall(
  phoneNumber: string, 
  dynamicVariables: Record<string, string> = {}, 
  agentId?: string,
  agentPhoneNumberId?: string
) {
  try {
    const targetPhoneId = agentPhoneNumberId || process.env.AGENT_PHONE_NUMBER_ID;
    
    // Fetch phone numbers config to determine the provider (twilio vs sip_trunk)
    const phoneResponse = await client.get('/v1/convai/phone-numbers');
    const phoneNumbers = phoneResponse.data?.phone_numbers || phoneResponse.data || [];
    const phoneConfig = phoneNumbers.find((p: any) => p.phone_number_id === targetPhoneId);
    
    let endpoint = '/v1/convai/twilio/outbound-call'; // Default to twilio
    if (phoneConfig?.provider === 'sip_trunk') {
      endpoint = '/v1/convai/sip-trunk/outbound-call';
    } else if (phoneConfig?.provider === 'exotel') {
      endpoint = '/v1/convai/exotel/outbound-call';
    }

    const response = await client.post(endpoint, {
      agent_id: agentId || AGENT_ID,
      agent_phone_number_id: targetPhoneId,
      to_number: phoneNumber,
      conversation_initiation_client_data: {
        dynamic_variables: dynamicVariables,
      },
    });
    
    return {
      success: response.data.success !== false,
      conversation_id: response.data.conversation_id || response.data.id || null, // sometimes it's returned as id
      data: response.data,
      error: response.data.message || response.data.error,
    };
  } catch (error: any) {
    console.error('Error triggering ElevenLabs call:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
}

export async function getConversationDetails(conversationId: string) {
  try {
    const response = await client.get(`/v1/convai/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversation details:', error.response?.data || error.message);
    return null;
  }
}

export async function getAgentDetails(agentId: string) {
  try {
    const response = await client.get(`/v1/convai/agents/${agentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching agent details:', error.response?.data || error.message);
    return null;
  }
}

export async function getAgents() {
  try {
    const response = await client.get(`/v1/convai/agents`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching agents:', error.response?.data || error.message);
    return null;
  }
}

export async function updateAgentDetails(agentId: string, payload: any) {
  try {
    // We typically use PATCH for updating agent config, depending on ElevenLabs API specs.
    // The previous laravel code seemed to just pass payload.
    const response = await client.patch(`/v1/convai/agents/${agentId}`, payload);
    return true;
  } catch (error: any) {
    console.error('Error updating agent details:', error.response?.data || error.message);
    return false;
  }
}

export async function getConversations(limit: number = 50, agentId?: string) {
  try {
    const response = await client.get(`/v1/convai/conversations?agent_id=${agentId || AGENT_ID}&page_size=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error.response?.data || error.message);
    return null;
  }
}

export async function getBatchCalls(agentId?: string) {
  try {
    const targetAgentId = agentId || AGENT_ID;
    const url = targetAgentId 
      ? `/v1/convai/batch-calling/workspace?agent_id=${targetAgentId}`
      : '/v1/convai/batch-calling/workspace';
    
    const response = await client.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching batch calls:', error.response?.data || error.message);
    return null;
  }
}

export async function getBatchCallDetails(batchId: string) {
  try {
    const response = await client.get(`/v1/convai/batch-calling/${batchId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching batch call details:', error.response?.data || error.message);
    return null;
  }
}

export async function submitBatchCall(payload: {
  call_name: string;
  agent_id?: string;
  agent_phone_number_id?: string;
  recipients: Array<{
    phone_number: string;
    conversation_initiation_client_data?: {
      dynamic_variables?: Record<string, string>;
    };
  }>;
}) {
  try {
    const response = await client.post('/v1/convai/batch-calling/submit', {
      agent_id: payload.agent_id || AGENT_ID,
      agent_phone_number_id: payload.agent_phone_number_id || process.env.AGENT_PHONE_NUMBER_ID,
      call_name: payload.call_name,
      recipients: payload.recipients,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error submitting batch call:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data || error.message,
    };
  }
}

export async function getPhoneNumbers() {
  try {
    const response = await client.get('/v1/convai/phone-numbers');
    return response.data?.phone_numbers || response.data || [];
  } catch (error: any) {
    console.error('Error fetching phone numbers:', error.response?.data || error.message);
    return [];
  }
}

export async function runConversationAnalysis(conversationId: string) {
  try {
    const response = await client.post(`/v1/convai/conversations/${conversationId}/analysis/run`);
    return response.data;
  } catch (error: any) {
    console.error(`Error running analysis for ${conversationId}:`, error.response?.data || error.message);
    return null;
  }
}

import WebSocket from 'ws';

/**
 * Sends a text message to the ElevenLabs Agent and retrieves the response.
 * Connects via WebSocket, sends a user message, accumulates the agent's response,
 * and resolves once the response stops.
 */
export interface AgentTextOptions {
  historyContext?: string;
  isReturningUser?: boolean;
  agentId?: string;
}

export async function getAgentTextResponse(
  text: string, 
  options: AgentTextOptions = {}
): Promise<string> {
  // Strictly hardcoded Chat Agent ID for Messenger and Text Chats
  const targetAgentId = 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa';
  console.log(`🤖 Using Dedicated Chat Agent ID: ${targetAgentId}`);

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${targetAgentId}`);
      
      const responseChunks: string[] = [];
      let timeoutId: NodeJS.Timeout | null = null;
      let connectionClosed = false;

      // Function to finish the interaction and resolve
      const completeInteraction = () => {
        if (connectionClosed) return;
        connectionClosed = true;
        
        if (timeoutId) clearTimeout(timeoutId);
        
        // Close websocket
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }

        let finalChunks = responseChunks;
        if (options.isReturningUser && responseChunks.length > 1) {
          // Filter out the initial welcome greeting so returning users get a seamless answer
          const withoutGreeting = responseChunks.filter(
            (c) => !c.toLowerCase().includes('welcome to marketing and publishing house')
          );
          if (withoutGreeting.length > 0) {
            finalChunks = withoutGreeting;
          }
        }

        const combined = finalChunks.join('\n\n').trim();
        resolve(combined || "Sorry, I couldn't process that.");
      };

      ws.on('open', () => {
        // If the user has past conversation history, inject it and suppress repeated greeting
        if (options.isReturningUser || options.historyContext) {
          const initPayload = {
            type: 'conversation_initiation_client_data',
            conversation_initiation_client_data: {
              conversation_config_override: {
                agent: {
                  first_message: '',
                },
              },
              dynamic_variables: {
                conversation_history: options.historyContext || '',
              },
            },
          };
          ws.send(JSON.stringify(initPayload));
        }

        // Format message with past context if available to guarantee LLM continuity
        const textToSend = (options.historyContext && !text.startsWith('[Context'))
          ? `[Ongoing Conversation Transcript]:\n${options.historyContext}\n\n[User's Latest Question/Response]:\n${text}`
          : text;

        // Send the user message with a slight delay so initialization is processed
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'user_message',
              text: textToSend,
            }));
          }
        }, 150);
        
        // Failsafe timeout: if agent doesn't reply within 10 seconds, abort
        timeoutId = setTimeout(completeInteraction, 10000);
      });

      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          
          if (parsed.type === 'agent_response') {
            const chunk = parsed.agent_response_event?.agent_response?.trim() || "";
            if (chunk) {
              responseChunks.push(chunk);
              
              // Reset the timeout. Wait 2 seconds after the last chunk before closing
              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(completeInteraction, 2000);
            }
          } else if (parsed.type === 'error') {
            console.error('ElevenLabs WebSocket Error:', parsed);
            responseChunks.push("(Encountered an error with the AI agent)");
            completeInteraction();
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      });

      ws.on('close', () => {
        if (!connectionClosed) completeInteraction();
      });

      ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
        if (!connectionClosed) completeInteraction();
      });

    } catch (error: any) {
      console.error('Error getting agent text response:', error.message);
      resolve("Sorry, I am having trouble connecting to my brain right now.");
    }
  });
}
