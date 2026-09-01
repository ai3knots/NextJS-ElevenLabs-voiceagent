import mongoose from 'mongoose';
import LeadModel from './src/models/Lead';
import CallLogModel from './src/models/CallLog';

const uri1 = "mongodb+srv://ai3knots_db_user:yFgAwREGFLu1ahrS@cluster0.pojxbbe.mongodb.net/?appName=Cluster0";
const uri2 = "mongodb+srv://developer3knots_db_user:5nO4qIc3wCNPAcyb@cluster0.dqfgcg5.mongodb.net";

// Simple connection string to bypass DNS issues if it's the SRV issue:
// actually, I'll just use mongoose.connect and if it fails, oh well. Let's try uri2.
async function checkAndClear(uri: string, name: string) {
  try {
    console.log(`Connecting to ${name}...`);
    await mongoose.connect(uri);
    const count = await LeadModel.countDocuments();
    console.log(`${name} Lead count: ${count}`);
    if (count > 0) {
      const res = await LeadModel.deleteMany({});
      console.log(`Deleted ${res.deletedCount} leads from ${name}`);
    }
  } catch (err: any) {
    console.error(`Error connecting to ${name}:`, err.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  await checkAndClear(uri1, "New DB");
  await checkAndClear(uri2, "Old DB");
}
main();
