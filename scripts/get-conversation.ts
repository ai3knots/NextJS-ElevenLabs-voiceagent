import axios from 'axios';

const API_KEY = "sk_736e777aa83d1948c3bd0a9c0606f3411b594fd2a216ac8a";
const convId = process.argv[2] || "conv_9001m0tasrkeexrt1f92jbmxk5pr";

async function main() {
  try {
    console.log(`Fetching ElevenLabs Conversation: ${convId}...\n`);
    const res = await axios.get(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
      headers: {
        'xi-api-key': API_KEY
      }
    });

    const d = res.data;
    console.log("================ ELEVENLABS CONVERSATION DETAILS ================");
    console.log("Conversation ID:", d.conversation_id || d.id);
    console.log("Status:", d.status);
    console.log("Duration (secs):", d.metadata?.call_duration_secs);
    console.log("\n--- OVERVIEW & DETAILED SUMMARY ---");
    console.log(d.analysis?.transcript_summary || d.transcript_summary || "(No transcript_summary)");

    console.log("\n--- DATA COLLECTION RESULTS ---");
    console.log(JSON.stringify(d.analysis?.data_collection_results || {}, null, 2));

    console.log("\n--- METADATA ---");
    console.log(JSON.stringify(d.metadata || {}, null, 2));
    console.log("==================================================================");
  } catch (err: any) {
    console.error("Error:", err.response?.data || err.message);
  }
}

main();
