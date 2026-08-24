import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb';
import Lead from '../src/models/Lead';
import CallLog from '../src/models/CallLog';

process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://ai3knots_db_user:yFgAwREGFLu1ahrS@cluster0.pojxbbe.mongodb.net/?appName=Cluster0";

async function check() {
  await connectDB();
  
  const lead = await Lead.findOne().sort({ updatedAt: -1 });
  console.log("\n=== LATEST LEAD IN DB ===");
  console.log("ID:", lead?._id);
  console.log("Phone:", lead?.phoneNumber);
  console.log("Name:", lead?.firstName);
  console.log("callSummary:", lead?.callSummary);
  console.log("lastCallSummary:", lead?.lastCallSummary);
  console.log("lastCompletedStage:", lead?.lastCompletedStage);
  console.log("context:", lead?.context);

  const log = await CallLog.findOne().sort({ createdAt: -1 });
  console.log("\n=== LATEST CALLLOG IN DB ===");
  console.log("Log ID:", log?._id);
  console.log("Lead ID:", log?.leadId);
  console.log("callSummary:", log?.callSummary);

  await mongoose.disconnect();
}

check();
