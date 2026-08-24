import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";
import { getConversationDetails } from "@/lib/elevenlabs";

function verifyElevenLabsSignature(signatureHeader: string | null, rawBody: string, secret?: string): boolean {
  if (!secret || !signatureHeader) return true; // Allow manual testing or unconfigured secret

  try {
    const parts = signatureHeader.split(",");
    let timestamp = "";
    let hash = "";

    for (const part of parts) {
      const [k, v] = part.trim().split("=");
      if (k === "t") timestamp = v;
      if (k === "v0" || k === "v1" || k === "v") hash = v;
    }

    if (timestamp && hash) {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
    }

    const directExpected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(directExpected));
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

// Helper to deep search for keys in nested objects
function findKeyDeep(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== "object") return null;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  for (const k in obj) {
    if (obj[k] && typeof obj[k] === "object") {
      const found = findKeyDeep(obj[k], keys);
      if (found !== undefined && found !== null && found !== "") return found;
    }
  }
  return null;
}

// Helper to find any valid phone number in an object
function findPhoneNumberDeep(obj: any): string | null {
  if (!obj) return null;
  
  // Check known phone keys first
  const phoneKeys = [
    "external_number",
    "caller_id",
    "callerId",
    "phone_number",
    "phoneNumber",
    "from",
    "from_number",
    "to",
    "to_number",
    "confirmed_phone"
  ];
  
  const val = findKeyDeep(obj, phoneKeys);
  if (val) {
    const str = typeof val === "object" ? (val.value || val.phone || "") : String(val);
    const cleaned = String(str).replace(/\D/g, "");
    if (cleaned.length >= 10) return String(str).trim();
  }

  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("--------------------------------------------------");
  console.log("🔔 [PostCallWebhook] Incoming ElevenLabs Webhook Request");

  try {
    const rawText = await request.text();
    const signature = request.headers.get("elevenlabs-signature") || request.headers.get("ElevenLabs-Signature");
    const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;

    console.log(`🔑 [PostCallWebhook] Signature Header: ${signature ? "Present" : "Missing"}`);
    console.log(`🔐 [PostCallWebhook] Secret Configured: ${secret ? "Yes" : "No"}`);

    if (secret && signature && !verifyElevenLabsSignature(signature, rawText, secret)) {
      console.warn("❌ [PostCallWebhook] Invalid ElevenLabs Webhook signature received.");
      return NextResponse.json({ error: "Unauthorized: Invalid Signature" }, { status: 401 });
    }

    const rawBody = JSON.parse(rawText || "{}");
    console.log("📦 [PostCallWebhook] Full Raw Payload:", JSON.stringify(rawBody, null, 2));

    await connectDB();
    console.log("💾 [PostCallWebhook] Connected to MongoDB");

    // 1. Unwrap event data according to ElevenLabs webhook documentation
    const eventData = rawBody.data || rawBody;

    // Robust Conversation ID Extraction
    const convId =
      eventData.conversation_id ||
      eventData.conversationId ||
      eventData.id ||
      rawBody.conversation_id ||
      findKeyDeep(rawBody, ["conversation_id", "conversationId", "call_id", "callId", "id"]);
    
    console.log(`🆔 [PostCallWebhook] Extracted Conversation ID: ${convId || "Unknown"}`);

    // 2. Fetch full conversation details from ElevenLabs API to guarantee complete telephony metadata
    let details: any = { ...rawBody, ...eventData };
    if (convId) {
      console.log(`🌐 [PostCallWebhook] Fetching latest conversation details from ElevenLabs for: ${convId}...`);
      const fetched = await getConversationDetails(convId);
      if (fetched) {
        details = { 
          ...details, 
          ...fetched, 
          metadata: { ...(details.metadata || {}), ...(fetched.metadata || {}) },
          analysis: { ...(details.analysis || {}), ...(fetched.analysis || {}) },
          conversation_initiation_metadata: { 
            ...(details.conversation_initiation_metadata || {}), 
            ...(fetched.conversation_initiation_metadata || {}) 
          }
        };
        console.log("✅ [PostCallWebhook] Successfully fetched extra details from ElevenLabs API");
      } else {
        console.warn("⚠️ [PostCallWebhook] Could not fetch details from ElevenLabs API.");
      }
    }

    // 3. Robust Caller Phone Number Extraction
    const rawPhone = findPhoneNumberDeep(details) || findPhoneNumberDeep(rawBody);
    let phoneNumber = String(rawPhone || "").trim();
    const numericPhone = phoneNumber.replace(/\D/g, "");
    const last10 = numericPhone.slice(-10);

    console.log(`📞 [PostCallWebhook] Caller Phone - Raw: [${rawPhone}], Normalized: [${phoneNumber}], Last10: [${last10}]`);

    // 4. Extract Structured Analysis / Evaluation Fields
    const dataCollection =
      details.analysis?.data_collection_results ||
      details.data?.analysis?.data_collection_results ||
      details.data_collection_results ||
      findKeyDeep(details, ["data_collection_results", "analysis"]) ||
      {};

    const extractVal = (field: any) => {
      if (!field) return null;
      if (typeof field === "string") return field.trim();
      if (field.value !== undefined && field.value !== null) return String(field.value).trim();
      return null;
    };

    let outcome = extractVal(dataCollection.call_outcome) || extractVal(findKeyDeep(details, ["call_outcome"]));
    const lastCompletedStage = extractVal(dataCollection.last_completed_stage) || extractVal(findKeyDeep(details, ["last_completed_stage"]));
    const oneLineSummary = extractVal(dataCollection.one_line_summary) || extractVal(findKeyDeep(details, ["one_line_summary"]));
    const authorName = extractVal(dataCollection.author_name) || extractVal(dataCollection.caller_name) || extractVal(findKeyDeep(details, ["author_name", "caller_name"]));
    const bookTopic = extractVal(dataCollection.book_topic_or_title) || extractVal(dataCollection.book_topic) || extractVal(findKeyDeep(details, ["book_topic_or_title", "book_topic"]));
    const writingStage = extractVal(dataCollection.writing_stage) || extractVal(findKeyDeep(details, ["writing_stage"]));
    const servicesDiscussed = extractVal(dataCollection.services_discussed) || extractVal(findKeyDeep(details, ["services_discussed"]));
    const followUpContext = extractVal(dataCollection.follow_up_context) || extractVal(findKeyDeep(details, ["follow_up_context"]));
    const confirmedEmail = extractVal(dataCollection.confirmed_email) || extractVal(findKeyDeep(details, ["confirmed_email"]));
    const preferredCallbackTime = extractVal(dataCollection.preferred_callback_time) || extractVal(findKeyDeep(details, ["preferred_callback_time"]));
    const callbackReq = extractVal(dataCollection.callback_requested) || extractVal(findKeyDeep(details, ["callback_requested"]));
    const followUpRequired = callbackReq === "true" || callbackReq === "yes" || !!preferredCallbackTime || !!followUpContext;

    const status = (details.status || details.call_status || "completed").toLowerCase();
    const isFailed = ["failed", "canceled", "no_answer", "busy", "error"].includes(status);
    const durationSecs = details.metadata?.call_duration_secs || details.call_duration_secs || details.duration_secs || 0;
    const finalStatus = isFailed ? "failed" : "completed";

    console.log(`📊 [PostCallWebhook] Extracted Evaluations:`, {
      authorName,
      outcome,
      lastCompletedStage,
      oneLineSummary,
      bookTopic,
      writingStage,
      confirmedEmail,
      durationSecs,
      finalStatus
    });

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
      console.log(`👤 [PostCallWebhook] Creating NEW Inbound Lead for phone number: ${phoneNumber || last10}`);
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
      console.log(`✅ [PostCallWebhook] Created Lead ID: ${lead._id}`);
    } else if (lead) {
      console.log(`🔄 [PostCallWebhook] Updating EXISTING Lead: ${lead.firstName} (${lead._id})`);
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
      console.log(`✅ [PostCallWebhook] Successfully updated Lead ID: ${lead._id}`);
    }

    // 6. Create CallLog Record
    if (lead) {
      const newLog = await CallLog.create({
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
      console.log(`📋 [PostCallWebhook] Saved CallLog ID: ${newLog._id} for Lead: ${lead._id}`);
    } else {
      console.warn("⚠️ [PostCallWebhook] Could not associate CallLog because no phone number was found in payload.");
    }

    const elapsed = Date.now() - startTime;
    console.log(`✨ [PostCallWebhook] Finished processing in ${elapsed}ms`);
    console.log("--------------------------------------------------");

    return NextResponse.json({
      success: true,
      lead_id: lead?._id || null,
      conversation_id: convId,
    });
  } catch (error: any) {
    console.error("💥 [PostCallWebhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
