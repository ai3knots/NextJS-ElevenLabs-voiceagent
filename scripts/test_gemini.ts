import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
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

const apiKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testModel(modelName: string) {
  try {
    const llm = new ChatGoogleGenerativeAI({
      apiKey: apiKey,
      model: modelName,
      temperature: 0.3,
    });
    const res = await llm.invoke('Hello! Respond with: READY');
    console.log(`✅ Model [${modelName}] worked! Output:`, res.content);
    return true;
  } catch (err: any) {
    console.log(`❌ Model [${modelName}] error:`, err.message);
    return false;
  }
}

async function run() {
  await testModel('gemini-3.5-flash-lite');
  await testModel('gemini-3.6-flash');
  await testModel('gemini-3.5-flash');
}

run();
