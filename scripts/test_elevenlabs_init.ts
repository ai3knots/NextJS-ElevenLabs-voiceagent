import WebSocket from 'ws';

const AGENT_ID = 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa';

async function testInitPayload() {
  const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`);

  ws.on('open', () => {
    console.log('WS Connected. Sending conversation_initiation_client_data...');
    
    const initPayload = {
      type: 'conversation_initiation_client_data',
      conversation_initiation_client_data: {
        conversation_config_override: {
          agent: {
            first_message: 'Welcome back!',
          }
        },
        dynamic_variables: {
          user_name: 'Alex',
        }
      }
    };
    ws.send(JSON.stringify(initPayload));
  });

  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());
    console.log('Message Received:', parsed.type, JSON.stringify(parsed));
  });

  ws.on('error', (err) => {
    console.error('Error:', err);
  });

  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 5000);
}

testInitPayload();
