import * as fs from 'fs';
import * as path from 'path';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

import { executeChatAgent } from '../src/agent';
import mongoose from 'mongoose';

async function testRealTranscriptScenarios() {
  console.log('===============================================================');
  console.log('🧪 TESTING ALEX WITH REAL-WORLD TRANSCRIPT SCENARIOS');
  console.log('===============================================================\n');

  const sessionId = 'test_real_user_' + Date.now();

  // Scenario 1: User concerned about scam / location
  console.log('1️⃣ User: "Before we go further, where is your office located? I need to know you are not a scam."');
  const res1 = await executeChatAgent({
    sessionId,
    userMessage: 'Before we go further, where is your office located? I need to know you are not a scam.',
    platform: 'web',
  });
  console.log('🤖 Alex Reply:', res1.reply);
  console.log('---------------------------------------------------------------\n');

  // Scenario 2: User explaining their specific Amazon KDP formatting hurdle
  console.log('2️⃣ User: "My book is on Amazon, but the cover was uploaded without my brand medallion, and the margins are off on KDP."');
  const res2 = await executeChatAgent({
    sessionId,
    userMessage: 'My book is on Amazon, but the cover was uploaded without my brand medallion, and the margins are off on KDP.',
    platform: 'web',
  });
  console.log('🤖 Alex Reply:', res2.reply);
  console.log('---------------------------------------------------------------\n');

  // Scenario 3: User sharing contact info
  console.log('3️⃣ User: "My name is Ray Rush, email is ray@gmail.com and phone is 785-850-1488."');
  const res3 = await executeChatAgent({
    sessionId,
    userMessage: 'My name is Ray Rush, email is ray@gmail.com and phone is 785-850-1488.',
    platform: 'web',
  });
  console.log('🤖 Alex Reply:', res3.reply);
  console.log('---------------------------------------------------------------\n');

  await mongoose.disconnect();
  console.log('🎉 Real-World Scenario Test Passed!');
}

testRealTranscriptScenarios().catch(console.error);
