import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // ElevenLabs passes caller_id in the Conversation Initiation Webhook
    // If testing manually, we also allow phone_number as a fallback
    const phone_number = body.caller_id || body.phone_number;

    if (!phone_number) {
      // If no caller_id is provided, return empty dynamic variables
      return NextResponse.json({ dynamic_variables: { found: "false" } });
    }

    // Connect to the database
    await connectDB();

    // Clean the phone number (remove all non-digits)
    const numericPhone = phone_number.replace(/\D/g, '');
    const last10 = numericPhone.slice(-10);
    
    console.log(`Webhook lookup: Original [${phone_number}], Last10 [${last10}]`);

    // Look up the lead in the database using a regex that matches the last 10 digits
    const lead = await Lead.findOne({ phoneNumber: { $regex: last10 + '$' } });

    if (!lead) {
      // Return false in dynamic variables for a brand new caller
      return NextResponse.json({
        dynamic_variables: {
          found: "false"
        }
      });
    }

    // Fetch the last 5 call logs for this lead to get extended context
    const callLogs = await CallLog.find({ leadId: lead._id })
      .sort({ createdAt: -1 })
      .limit(5);

    let recentCallsContext = "";
    if (callLogs.length > 0) {
      recentCallsContext = callLogs.map((log, index) => {
        const date = new Date(log.createdAt).toLocaleDateString();
        return `Call ${index + 1} (${date}): ${log.callSummary || "No summary available. Status: " + log.callStatus}`;
      }).join(" | ");
    } else {
      recentCallsContext = "No past calls found.";
    }

    // Map the database fields to the dynamic variables ElevenLabs expects
    const dynamicVariables = {
      found: "true",
      author_name: lead.firstName || "Unknown",
      book_topic: lead.bookTopic || "Unknown",
      writing_stage: lead.writingStage || "Unknown",
      last_completed_stage: lead.lastCompletedStage || "no_interaction",
      last_summary: lead.callSummary || lead.lastCallSummary || "No previous summary available.",
      company: lead.company || "",
      context: lead.context || "",
      recent_calls_context: recentCallsContext,
      call_direction: "inbound" // Since this webhook only fires on incoming calls
    };

    console.log(`Webhook Response: ${JSON.stringify(dynamicVariables)}`);

    return NextResponse.json({ dynamic_variables: dynamicVariables });

  } catch (error: any) {
    console.error("Error in lookup-caller API:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}
