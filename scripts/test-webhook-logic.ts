import mongoose from 'mongoose';

// Define a simplified schema for Lead
const LeadSchema = new mongoose.Schema({
  phoneNumber: String,
  firstName: String,
  bookTopic: String,
}, { strict: false });

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

async function testLookup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://ai3knots_db_user:yFgAwREGFLu1ahrS@cluster0.pojxbbe.mongodb.net/?appName=Cluster0');
    console.log('Connected!');

    // Test cases
    const testCases = [
      "+19432094556", // Exact match in DB format
      "9432094556",   // Format sent by ElevenLabs
      "(943) 209-4556", // Weird formatting
    ];

    for (const phone_number of testCases) {
      console.log(`\n--- Testing caller_id: ${phone_number} ---`);
      
      const numericPhone = phone_number.replace(/\D/g, '');
      const last10 = numericPhone.slice(-10);
      console.log(`Cleaned numeric: ${numericPhone}, Last 10: ${last10}`);

      const lead = await Lead.findOne({ phoneNumber: { $regex: last10 + '$' } });
      
      if (lead) {
        console.log(`SUCCESS! Found lead: ${lead.firstName} (Saved Phone: ${lead.phoneNumber})`);
      } else {
        console.log(`FAILED! Could not find lead for ${phone_number}`);
      }
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testLookup();
