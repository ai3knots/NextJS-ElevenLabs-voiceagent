import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";
import { getConversationDetails } from "@/lib/elevenlabs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id: leadId } = await params;

  const lead = await Lead.findById(leadId);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (["completed", "failed"].includes(lead.callStatus)) {
    return NextResponse.json({ call_status: lead.callStatus, updated: false });
  }

  let convId = lead.elevenlabsConversationId;

  if (!convId) {
    const callLog = await CallLog.findOne({ leadId, elevenlabsConversationId: { $ne: null } }).sort({ createdAt: -1 });
    if (callLog) {
      convId = callLog.elevenlabsConversationId;
      await Lead.updateOne({ _id: leadId }, { elevenlabsConversationId: convId });
    }
  }

  if (!convId) {
    return NextResponse.json({
      call_status: lead.callStatus,
      call_error_reason: lead.callErrorReason,
      updated: false,
    });
  }

  const details = await getConversationDetails(convId);

  if (!details) {
    const errorReason = "Conversation record not found on ElevenLabs.";
    await Lead.updateOne({ _id: leadId }, { callStatus: "failed", callErrorReason: errorReason });
    await CallLog.updateMany({ elevenlabsConversationId: convId }, { callStatus: "failed", callErrorReason: errorReason });
    
    return NextResponse.json({
      call_status: "failed",
      updated: true,
      summary: errorReason,
    });
  }

  const status = (details.status || "").toLowerCase();
  const startTime = details.metadata?.start_time_unix_secs || null;
  const elapsedSeconds = startTime ? (Date.now() / 1000 - startTime) : 0;

  const isDone = ["done", "completed", "ended", "finished"].includes(status);
  const isFailed = ["failed", "canceled", "no_answer", "busy", "error"].includes(status);
  const isTimedOut = ["initiated", "in_progress"].includes(status) && elapsedSeconds > 45;

  if (isDone || isFailed || isTimedOut) {
    const finalStatus = isFailed || (isTimedOut && !details.transcript?.length) ? "failed" : "completed";

    let summaryText = details.analysis?.transcript_summary || details.analysis?.summary || details.call_summary_title || null;

    if (summaryText) {
      summaryText = typeof summaryText === "object" ? JSON.stringify(summaryText, null, 2) : summaryText;
    } else {
      const transcriptMessages = (details.transcript || []).map((turn: any) => {
        const role = (turn.role || "speaker") === "agent" ? "AI Agent" : "Lead";
        const msg = (turn.message || "").replace(/^"|"$/g, "").trim();
        return `${role}: ${msg}`;
      });

      summaryText = transcriptMessages.length > 0 
        ? transcriptMessages.join("\n") 
        : (finalStatus === "failed" ? "Call declined, unanswered, or ended by recipient." : "Call finished.");
    }

    const errorReason = finalStatus === "failed" ? (details.error || "Call declined or unanswered by lead.") : null;

    // Extract structured data collection & follow-up context
    const dataCollection = details.analysis?.data_collection_results;
    const extractVal = (field: any) => {
      if (!field) return null;
      if (typeof field === 'string') return field.trim();
      if (field.value !== undefined && field.value !== null) return String(field.value).trim();
      return null;
    };

    let outcome = extractVal(dataCollection?.call_outcome);
    const lastCompletedStage = extractVal(dataCollection?.last_completed_stage);
    const oneLineSummary = extractVal(dataCollection?.one_line_summary);
    const callbackReq = extractVal(dataCollection?.callback_requested);
    const preferredCallbackTime = extractVal(dataCollection?.preferred_callback_time);
    const bookTopic = extractVal(dataCollection?.book_topic_or_title) || extractVal(dataCollection?.book_topic);
    const writingStage = extractVal(dataCollection?.writing_stage);
    const servicesDiscussed = extractVal(dataCollection?.services_discussed);
    const followUpContext = extractVal(dataCollection?.follow_up_context);
    const confirmedEmail = extractVal(dataCollection?.confirmed_email);
    const confirmedPhone = extractVal(dataCollection?.confirmed_phone);

    const followUpRequired = callbackReq === 'true' || callbackReq === 'yes' || !!preferredCallbackTime || !!followUpContext;
    const durationSecs = details.metadata?.call_duration_secs || details.call_duration_secs || 0;

    // Fallback outcome calculation
    if (!outcome) {
      const statusLower = String(status).toLowerCase();
      const transcript = details.transcript || [];
      if (statusLower.includes("voicemail")) outcome = "voicemail";
      else if (statusLower.includes("no_answer") || statusLower.includes("no answer")) outcome = "no_answer";
      else if (statusLower.includes("busy")) outcome = "busy_hangup";
      else if (statusLower.includes("failed") || statusLower.includes("error")) outcome = "failed";
      else if (Array.isArray(transcript) && transcript.length === 0 && durationSecs > 0) outcome = "speak_no_word";
      else outcome = finalStatus;
    }

    const leadUpdates: any = {
      callStatus: finalStatus,
      callSummary: summaryText,
      callErrorReason: errorReason,
      lastCallOutcome: outcome,
      lastCallSummary: summaryText || oneLineSummary,
      lastConversationId: convId,
      lastCompletedStage: lastCompletedStage || "no_interaction",
    };

    if (followUpContext) {
      leadUpdates.context = followUpContext;
      leadUpdates.followUpNotes = followUpContext;
    } else if (summaryText && !lead.context) {
      leadUpdates.context = summaryText;
    }

    if (preferredCallbackTime) {
      leadUpdates.preferredCallbackTime = preferredCallbackTime;
      leadUpdates.followUpStatus = "callback_requested";
    }
    if (bookTopic && !lead.bookTopic) leadUpdates.bookTopic = bookTopic;
    if (writingStage && !lead.writingStage) leadUpdates.writingStage = writingStage;
    if (confirmedEmail && !lead.email) leadUpdates.email = confirmedEmail;

    await Lead.updateOne({ _id: leadId }, { $set: leadUpdates });

    await CallLog.updateMany(
      { elevenlabsConversationId: convId },
      {
        $set: {
          callStatus: finalStatus,
          callOutcome: outcome,
          callSummary: summaryText || oneLineSummary,
          callDurationSecs: durationSecs,
          callErrorReason: errorReason,
          lastCompletedStage: lastCompletedStage || "no_interaction",
          followUpRequired,
          preferredCallbackTime: preferredCallbackTime || null,
          bookTopic: bookTopic || null,
          writingStage: writingStage || null,
          servicesDiscussed: servicesDiscussed || null,
          followUpContext: followUpContext || null,
          confirmedEmail: confirmedEmail || null,
          confirmedPhone: confirmedPhone || null,
          callAnalysis: details.analysis || null,
          rawWebhookPayload: details,
        }
      }
    );

    return NextResponse.json({
      call_status: finalStatus,
      updated: true,
      summary: summaryText,
      call_outcome: outcome,
      follow_up_context: followUpContext,
      preferred_callback_time: preferredCallbackTime,
    });
  }

  return NextResponse.json({
    call_status: lead.callStatus,
    updated: false,
  });
}
