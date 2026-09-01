import { getAgentDetails } from './src/lib/elevenlabs';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

async function testAgent() {
  console.log('Testing New Agent: agent_8401kz69arjce8daj1gtr08vdn8q');
  const details = await getAgentDetails('agent_8401kz69arjce8daj1gtr08vdn8q');
  if (details) {
    console.log('Success! Fetched agent details:');
    console.log(JSON.stringify({
      name: details.name,
      id: details.agent_id,
      prompt: details.conversation_config?.agent?.prompt?.prompt?.substring(0, 50) + '...'
    }, null, 2));
  } else {
    console.log('Failed to fetch details or agent not found.');
  }
}

testAgent();
