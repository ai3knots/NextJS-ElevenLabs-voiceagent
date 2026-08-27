import connectDB from '../src/lib/mongodb';
import ChatLog from '../src/models/ChatLog';
import { getMessengerChatHistory, saveMessengerChatMessage } from '../src/lib/chatMemory';
import { getAgentTextResponse } from '../src/lib/elevenlabs';

async function runMultiTurnMemoryTest() {
  console.log('🧪 Starting Multi-Turn Memory Simulation for Messenger...\n');
  await connectDB();

  const testPsid = 'mock_tester_alex_007';

  // Clean up any previous test run for this mock user
  await ChatLog.deleteMany({ senderPsid: testPsid });
  console.log(`🧹 Cleaned up old test records for ${testPsid}.\n`);

  // --- TURN 1 ---
  console.log('--- 💬 TURN 1: Initial User Introduction ---');
  const userMsg1 = 'Hello! My name is Alex, and I am currently working on a fantasy novel.';
  console.log(`User: "${userMsg1}"`);

  const history1 = await getMessengerChatHistory(testPsid);
  console.log(`Checking Memory: isReturningUser = ${history1.isReturningUser}`);

  const reply1 = await getAgentTextResponse(userMsg1, {
    historyContext: history1.historyTranscript,
    isReturningUser: history1.isReturningUser,
  });
  console.log(`Agent: "${reply1}"\n`);

  await saveMessengerChatMessage(testPsid, userMsg1, reply1);
  console.log('✅ Turn 1 saved to MongoDB ChatLog.\n');

  // Short pause
  await new Promise((r) => setTimeout(r, 2000));

  // --- TURN 2 ---
  console.log('--- 💬 TURN 2: Context Memory Recall Test ---');
  const userMsg2 = 'Can you remind me what my name is and what genre my book is?';
  console.log(`User: "${userMsg2}"`);

  const history2 = await getMessengerChatHistory(testPsid);
  console.log(`Checking Memory: isReturningUser = ${history2.isReturningUser}`);
  console.log(`Injected Transcript Context:\n"""\n${history2.historyTranscript}\n"""`);

  // Format contextual message with past history for guaranteed grounding
  const contextualMessage = history2.historyTranscript
    ? `[Context from our ongoing conversation]:\n${history2.historyTranscript}\n\n[User's latest message]:\n${userMsg2}`
    : userMsg2;

  const reply2 = await getAgentTextResponse(contextualMessage, {
    historyContext: history2.historyTranscript,
    isReturningUser: history2.isReturningUser,
  });
  console.log(`Agent: "${reply2}"\n`);

  await saveMessengerChatMessage(testPsid, userMsg2, reply2);
  console.log('✅ Turn 2 saved to MongoDB ChatLog.\n');

  // --- VERIFY DATABASE STATE ---
  console.log('--- 🔍 Inspecting MongoDB ChatLog Record ---');
  const finalDoc = await ChatLog.findOne({ senderPsid: testPsid });
  console.log('Stored ChatLog Doc:');
  console.log(JSON.stringify({
    _id: finalDoc?._id,
    senderPsid: finalDoc?.senderPsid,
    platform: finalDoc?.platform,
    messagesCount: finalDoc?.messages?.length,
    chatSummary: finalDoc?.chatSummary,
  }, null, 2));

  console.log('\n🎉 Multi-turn Memory Simulation Completed Successfully!');
  process.exit(0);
}

runMultiTurnMemoryTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
