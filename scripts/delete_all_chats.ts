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

import connectDB from '../src/lib/mongodb';
import ChatLogModel from '../src/models/ChatLog';

async function deleteAllChats() {
  try {
    console.log('Connecting to MongoDB via connectDB...');
    const conn = await connectDB();
    console.log('Connected to MongoDB.');

    const countBefore = await ChatLogModel.countDocuments();
    console.log(`Found ${countBefore} chat logs.`);

    const result = await ChatLogModel.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} chat logs.`);

    const countAfter = await ChatLogModel.countDocuments();
    console.log(`Remaining chat logs in database: ${countAfter}`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting chat logs:', error);
    process.exit(1);
  }
}

deleteAllChats();
