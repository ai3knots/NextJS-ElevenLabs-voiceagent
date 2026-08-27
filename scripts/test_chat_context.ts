import WebSocket from 'ws';

const AGENT_ID = 'agent_5601m0tgt63qe8tt5q9qcnfqf5wa';

async function testWS(text: string) {
  console.log(`Connecting to chat agent: ${AGENT_ID} with input: "${text}"`);
  const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${AGENT_ID}`);

  ws.on('open', () => {
    console.log('WS Connected!');
    
    // Send user message
    ws.send(JSON.stringify({
      type: 'user_message',
      text: text
    }));
  });

  ws.on('message', (data) => {
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'agent_response') {
      console.log('Agent Response Chunk:', parsed.agent_response_event?.agent_response);
    } else if (parsed.type === 'conversation_initiation_metadata') {
      console.log('Initiation Metadata:', JSON.stringify(parsed));
    } else {
      console.log('Event Type:', parsed.type);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('WS Closed:', code, reason.toString());
  });

  ws.on('error', (err) => {
    console.error('WS Error:', err);
  });

  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 10000);
}

testWS('I am doing good, what about you?');
