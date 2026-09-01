import mongoose from 'mongoose';
import LeadModel from './src/models/Lead';

const uri = process.env.MONGODB_URI || "mongodb+srv://ai3knots_db_user:yFgAwREGFLu1ahrS@cluster0.pojxbbe.mongodb.net/?appName=Cluster0";

async function clearLeads() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    const res = await LeadModel.deleteMany({});
    console.log(`Deleted ${res.deletedCount} leads.`);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

clearLeads();
