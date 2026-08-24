import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";
import { getConversationDetails } from "@/lib/elevenlabs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    console.log("=== ElevenLabs Post-Call Webhook Received ===");
    console.log("Payload:", JSON.stringify(rawBody, null, 2));

    await connectDB();

    // 1. Identify Conversation ID
    const convId = rawBody.conversation_id || rawBody.id || rawBody.metadata?.conversation_id;

    // 2. Fetch full conversation details from ElevenLabs if not fully present in webhook
    let details = rawBody;
    if (convId && (!rawBody.analysis || !rawBody.transcript)) {
      const fetched = await getConversationDetails(convId);
      if (fetched) {
        details = { ...rawBody, ...fetched };
      }
    }

    // 3. Extract Caller Phone Number
    const rawPhone =
      details.conversation_initiation_metadata?.external_number ||
      details.metadata?.external_number ||
      details.conversation_initiation_client_data?.dynamic_variables?.phone_number ||
      details.metadata?.caller_id ||
      details.caller_id ||
      details.phone_number ||
      details.analysis?.data_collection_results?.confirmed_phone?.value ||
      details.analysis?.data_collection_results?.confirmed_phone;

    let phoneNumber = String(rawPhone || "").trim();
    const numericPhone = phoneNumber.replace(/\D/g, "");
    const last10 = numericPhone.slice(-10);

    console.log(`Caller identification - Raw: [${rawPhone}], Cleaned: [${numericPhone}], Last10: [${last10}]`);

    // 4. Extract Structured Analysis / Evaluation Fields
    const dataCollection = details.analysis?.data_collection_results || {};
    const extractVal = (field: any) => {
      if (!field) return null;
      if (typeof field === "string") return field.trim();
      if (field.value !== undefined && field.value !== null) return String(field.value).trim();
      return null;
    };

    let outcome = extractVal(dataCollection.call_outcome);
    const lastCompletedStage = extractVal(dataCollection.last_completed_stage);
    const oneLineSummary = extractVal(dataCollection.one_line_summary);
    const authorName = extractVal(dataCollection.author_name) || extractVal(dataCollection.caller_name);
    const bookTopic = extractVal(dataCollection.book_topic_or_title) || extractVal(dataCollection.book_topic);
    const writingStage = extractVal(dataCollection.writing_stage);
    const servicesDiscussed = extractVal(dataCollection.services_discussed);
    const followUpContext = extractVal(dataCollection.follow_up_context);
    const confirmedEmail = extractVal(dataCollection.confirmed_email);
    const preferredCallbackTime = extractVal(dataCollection.preferred_callback_time);
    const callbackReq = extractVal(dataCollection.callback_requested);
    const followUpRequired = callbackReq === "true" || callbackReq === "yes" || !!preferredCallbackTime || !!followUpContext;

    const status = (details.status || "completed").toLowerCase();
    const isFailed = ["failed", "canceled", "no_answer", "busy", "error"].includes(status);
    const durationSecs = details.metadata?.call_duration_secs || details.call_duration_secs || 0;
    const finalStatus = isFailed ? "failed" : "completed";

    // Summary Text Generation
    let summaryText =
      oneLineSummary ||
      details.analysis?.transcript_summary ||
      details.analysis?.summary ||
      details.call_summary_title ||
      null;

    if (!summaryText && Array.isArray(details.transcript)) {
      const transcriptMessages = details.transcript.map((turn: any) => {
        const role = (turn.role || "speaker") === "agent" ? "AI Agent" : "Caller";
        const msg = (turn.message || "").replace(/^"|"$/g, "").trim();
        return `${role}: ${msg}`;
      });
      summaryText = transcriptMessages.join("\n");
    }

    if (!summaryText) {
      summaryText = finalStatus === "failed" ? "Call declined, unanswered, or disconnected." : "Call completed.";
    }

    if (!outcome) {
      outcome = finalStatus;
    }

    // 5. Look up Lead or Create New Lead
    let lead = null;
    if (last10) {
      lead = await Lead.findOne({ phoneNumber: { $regex: last10 + "$" } });
    }

    if (!lead && last10) {
      console.log(`Creating new Inbound Lead for phone number: ${phoneNumber || last10}`);
      lead = await Lead.create({
        firstName: authorName || "Inbound Caller",
        lastName: "",
        phoneNumber: phoneNumber.startsWith("+") ? phoneNumber : `+1${last10}`,
        email: confirmedEmail || undefined,
        bookTopic: bookTopic || undefined,
        writingStage: writingStage || undefined,
        callType: "manual",
        source: "inbound",
        status: "new",
        callStatus: finalStatus,
        elevenlabsConversationId: convId,
        callSummary: summaryText,
        lastCallOutcome: outcome,
        lastCallSummary: oneLineSummary || summaryText,
        lastConversationId: convId,
        lastCompletedStage: lastCompletedStage || "no_interaction",
        context: followUpContext || summaryText || undefined,
        followUpNotes: followUpContext || undefined,
        preferredCallbackTime: preferredCallbackTime || undefined,
        followUpStatus: followUpRequired ? "callback_requested" : "none",
      });
    } else if (lead) {
      console.log(`Updating existing Lead: ${lead.firstName} (${lead._id})`);
      const updates: any = {
        callStatus: finalStatus,
        callSummary: summaryText,
        lastCallOutcome: outcome,
        lastCallSummary: oneLineSummary || summaryText,
        lastConversationId: convId,
        lastCompletedStage: lastCompletedStage || lead.lastCompletedStage || "no_interaction",
      };

      if (authorName && lead.firstName === "Inbound Caller") {
        updates.firstName = authorName;
      }
      if (confirmedEmail && !lead.email) updates.email = confirmedEmail;
      if (bookTopic && !lead.bookTopic) updates.bookTopic = bookTopic;
      if (writingStage && !lead.writingStage) updates.writingStage = writingStage;
      if (followUpContext) {
        updates.context = followUpContext;
        updates.followUpNotes = followUpContext;
      } else if (summaryText && !lead.context) {
        updates.context = summaryText;
      }
      if (preferredCallbackTime) {
        updates.preferredCallbackTime = preferredCallbackTime;
        updates.followUpStatus = "callback_requested";
      }

      await Lead.updateOne({ _id: lead._id }, { $set: updates });
    }

    // 6. Create CallLog Record
    if (lead) {
      await CallLog.create({
        leadId: lead._id,
        callStatus: finalStatus,
        callDurationSecs: durationSecs,
        elevenlabsConversationId: convId,
        callSummary: oneLineSummary || summaryText,
        callOutcome: outcome,
        lastCompletedStage: lastCompletedStage || "no_interaction",
        followUpRequired,
        preferredCallbackTime: preferredCallbackTime || undefined,
        bookTopic: bookTopic || (lead ? lead.bookTopic : undefined) || undefined,
        writingStage: writingStage || (lead ? lead.writingStage : undefined) || undefined,
        servicesDiscussed: servicesDiscussed || undefined,
        followUpContext: followUpContext || undefined,
        confirmedEmail: confirmedEmail || (lead ? lead.email : undefined) || undefined,
        confirmedPhone: phoneNumber || (lead ? lead.phoneNumber : undefined) || undefined,
        callAnalysis: details.analysis || undefined,
        rawWebhookPayload: details,
      });
      console.log(`Saved CallLog for leadId: ${lead._id}`);
    } else {
      console.warn("Could not associate CallLog because no phone number was found in payload.");
    }

    return NextResponse.json({
      success: true,
      lead_id: lead?._id || null,
      conversation_id: convId,
    });
  } catch (error: any) {
    console.error("Error in post-call webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
