"use server";

import { getBatchCalls, getBatchCallDetails, submitBatchCall, runConversationAnalysis, getConversationDetails } from "@/lib/elevenlabs";
import { getCurrentAgentId, getSelectedPhoneNumber } from "@/actions/agent.actions";
import connectDB from "@/lib/mongodb";
import CallLog from "@/models/CallLog";
import Lead from "@/models/Lead";
import { revalidatePath } from "next/cache";

export async function fetchBatchCalls() {
  const currentAgentId = await getCurrentAgentId();
  return await getBatchCalls(currentAgentId);
}

export async function fetchBatchCallDetails(batchId: string) {
  return await getBatchCallDetails(batchId);
}

export async function createBatchCallAction(payload: {
  callName: string;
  agentId?: string;
  recipients: Array<{
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    bookTopic?: string;
    writingStage?: string;
    context?: string;
  }>;
}) {
  if (!payload.callName) {
    return { success: false, error: "Batch campaign name is required" };
  }

  if (!payload.recipients || payload.recipients.length === 0) {
    return { success: false, error: "At least one recipient phone number is required" };
  }

  await connectDB();

  const activeAgentId = payload.agentId || await getCurrentAgentId();
  const activePhoneNumberId = await getSelectedPhoneNumber();

  // 1. Ensure all recipients exist in MongoDB Lead collection & prepare dynamic variables
  const createdOrUpdatedLeadIds: string[] = [];
  const formattedRecipients = [];

  for (const r of payload.recipients) {
    const cleanPhone = r.phoneNumber.trim();
    const fName = r.firstName?.trim() || "there";
    const lName = r.lastName?.trim() || "";
    const ctx = r.context?.trim() || "";

    // Find existing lead or create new lead
    let lead = await Lead.findOne({ phoneNumber: cleanPhone });
    if (lead) {
      // Update batch information and append new context if provided
      const updatedContext = ctx ? (lead.context ? `${lead.context} | ${ctx}` : ctx) : lead.context;
      lead.batchName = payload.callName;
      lead.context = updatedContext;
      if (r.bookTopic) lead.bookTopic = r.bookTopic;
      if (r.writingStage) lead.writingStage = r.writingStage;
      if (r.email && !lead.email) lead.email = r.email;
      if (r.company && !lead.company) lead.company = r.company;
      lead.callStatus = "initiating";
      await lead.save();
    } else {
      lead = await Lead.create({
        firstName: fName,
        lastName: lName,
        phoneNumber: cleanPhone,
        email: r.email?.trim(),
        company: r.company?.trim(),
        bookTopic: r.bookTopic?.trim(),
        writingStage: r.writingStage?.trim(),
        context: ctx,
        batchName: payload.callName,
        source: "batch_import",
        status: "new",
        callStatus: "initiating",
        callType: "auto",
      });
    }

    createdOrUpdatedLeadIds.push(lead._id.toString());

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

    // Prepare ElevenLabs recipient payload with dynamic context
    formattedRecipients.push({
      phone_number: cleanPhone,
      conversation_initiation_client_data: {
        dynamic_variables: {
          found: "true",
          author_name: fName,
          company: lead.company || r.company || "",
          book_topic: lead.bookTopic || r.bookTopic || "Unknown",
          writing_stage: lead.writingStage || r.writingStage || "Unknown",
          last_completed_stage: lead.lastCompletedStage || "no_interaction",
          last_outcome: lead.lastCallOutcome || "no_interaction",
          last_summary: lead.lastCallSummary || lead.callSummary || "No previous summary available.",
          context: lead.context || ctx || "",
          recent_calls_context: recentCallsContext,
          call_direction: "outbound"
        },
      },
    });
  }

  // 2. Dispatch batch call to ElevenLabs
  const res = await submitBatchCall({
    call_name: payload.callName,
    agent_id: activeAgentId,
    agent_phone_number_id: activePhoneNumberId,
    recipients: formattedRecipients,
  });

  if (res.success) {
    const batchId = res.data?.batch_id || res.data?.id || null;
    
    // Update batchId reference on all affected leads
    if (batchId) {
      await Lead.updateMany(
        { _id: { $in: createdOrUpdatedLeadIds } },
        { $set: { batchId } }
      );
    }

    revalidatePath("/batches");
    revalidatePath("/leads");
    revalidatePath("/");
  }

  return res;
}

export async function reanalyzeBatchAction(batchId: string, limit?: number, skipProcessed: boolean = false) {
  try {
    const details = await getBatchCallDetails(batchId);
    if (!details) return { success: false, error: "Batch details not found" };

    const rawRecipients = details.recipients || details.recipient_calls || details.calls || details.conversations || details.items || [];
    let conversationIds = rawRecipients
      .map((r: any) => r.conversation_id || r.id || r.elevenlabs_conversation_id)
      .filter(Boolean);

    await connectDB();

    if (skipProcessed) {
      const existingLogs = await CallLog.find({
        elevenlabsConversationId: { $in: conversationIds },
        callOutcome: { $nin: [null, ""] }
      }).select("elevenlabsConversationId").lean();

      const processedSet = new Set(existingLogs.map((l: any) => l.elevenlabsConversationId));
      conversationIds = conversationIds.filter((id: string) => !processedSet.has(id));
    }

    if (limit && limit > 0) {
      conversationIds = conversationIds.slice(0, limit);
    }

    if (conversationIds.length === 0) {
      return { success: true, processedCount: 0, totalCount: 0, message: "All calls in this batch are already evaluated!" };
    }
    let processedCount = 0;

    // Process conversations in chunks of 25 to avoid API rate limits while keeping HTTP execution fast
    const chunkSize = 25;
    for (let i = 0; i < conversationIds.length; i += chunkSize) {
      const chunk = conversationIds.slice(i, i + chunkSize);

      await Promise.all(
        chunk.map(async (convId: string) => {
          try {
            // 1. Run LLM re-analysis on ElevenLabs
            await runConversationAnalysis(convId);
            
            // 2. Fetch updated details
            const convDetails = await getConversationDetails(convId);
            if (!convDetails) return;

            const dataCollection = convDetails.analysis?.data_collection_results;
            
            // Extract call outcome
            let outcome = null;
            if (dataCollection?.call_outcome) {
              const outcomeObj = dataCollection.call_outcome;
              outcome = typeof outcomeObj === 'string' ? outcomeObj : (outcomeObj.value ?? null);
            }

            // Extract structured follow-up & book context
            const extractVal = (field: any) => {
              if (!field) return null;
              if (typeof field === 'string') return field.trim();
              if (field.value !== undefined && field.value !== null) return String(field.value).trim();
              return null;
            };

            const callbackReqVal = extractVal(dataCollection?.callback_requested);
            const followUpRequired = callbackReqVal === 'true' || callbackReqVal === 'yes' || !!extractVal(dataCollection?.preferred_callback_time);
            const preferredCallbackTime = extractVal(dataCollection?.preferred_callback_time);
            const bookTopic = extractVal(dataCollection?.book_topic_or_title) || extractVal(dataCollection?.book_topic);
            const writingStage = extractVal(dataCollection?.writing_stage);
            const servicesDiscussed = extractVal(dataCollection?.services_discussed);
            const followUpContext = extractVal(dataCollection?.follow_up_context);
            const confirmedEmail = extractVal(dataCollection?.confirmed_email);
            const confirmedPhone = extractVal(dataCollection?.confirmed_phone);

            const summary = convDetails.analysis?.transcript_summary || convDetails.transcript_summary || null;
            const durationSecs = convDetails.metadata?.call_duration_secs || 0;
            const status = convDetails.status || "completed";

            // Fallback outcome if LLM data_collection was empty/null (e.g. voicemail, no answer, short call)
            if (!outcome) {
              const statusLower = String(status).toLowerCase();
              const transcript = convDetails.transcript || [];
              if (statusLower.includes("voicemail")) {
                outcome = "voicemail";
              } else if (statusLower.includes("no_answer") || statusLower.includes("no answer")) {
                outcome = "no_answer";
              } else if (statusLower.includes("busy")) {
                outcome = "busy_hangup";
              } else if (statusLower.includes("failed") || statusLower.includes("error")) {
                outcome = "failed";
              } else if (Array.isArray(transcript) && transcript.length === 0 && durationSecs > 0) {
                outcome = "speak_no_word";
              } else {
                outcome = "not_evaluated";
              }
            }

            // 3. Find or Associate with Lead
            const recipientPhone = convDetails.metadata?.phone_call?.to_number || 
                                   convDetails.metadata?.to_number || 
                                   convDetails.metadata?.phone_number || null;

            let lead = null;
            if (recipientPhone) {
              lead = await Lead.findOne({ phoneNumber: recipientPhone });
            }

            // 4. Upsert into CallLog
            const callLogData: any = {
              elevenlabsConversationId: convId,
              batchId: batchId,
              callOutcome: outcome,
              callSummary: summary,
              callDurationSecs: durationSecs,
              callStatus: status,
              callAnalysis: convDetails.analysis || null,
              followUpRequired,
              preferredCallbackTime: preferredCallbackTime || null,
              bookTopic: bookTopic || null,
              writingStage: writingStage || null,
              servicesDiscussed: servicesDiscussed || null,
              followUpContext: followUpContext || null,
              confirmedEmail: confirmedEmail || null,
              confirmedPhone: confirmedPhone || null,
            };

            if (lead) {
              callLogData.leadId = lead._id;
            }

            await CallLog.updateOne(
              { elevenlabsConversationId: convId },
              { $set: callLogData },
              { upsert: true }
            );

            // 5. Update Lead with latest conversation context and follow-up data
            if (lead) {
              const leadUpdates: any = {
                callStatus: status === "completed" || status === "done" ? "completed" : status,
                lastCallOutcome: outcome,
                lastCallSummary: summary,
                lastConversationId: convId,
              };

              if (followUpContext) {
                leadUpdates.context = followUpContext;
                leadUpdates.followUpNotes = followUpContext;
              } else if (summary && !lead.context) {
                leadUpdates.context = summary;
              }

              if (preferredCallbackTime) {
                leadUpdates.preferredCallbackTime = preferredCallbackTime;
                leadUpdates.followUpStatus = "callback_requested";
              }

              if (bookTopic) leadUpdates.bookTopic = bookTopic;
              if (writingStage) leadUpdates.writingStage = writingStage;
              if (confirmedEmail && !lead.email) leadUpdates.email = confirmedEmail;

              await Lead.updateOne({ _id: lead._id }, { $set: leadUpdates });
            }

            processedCount++;
          } catch (err: any) {
            console.error(`Error processing conversation ${convId}:`, err);
          }
        })
      );
    }

    revalidatePath(`/batches/${batchId}`);
    revalidatePath("/batches");
    revalidatePath("/conversations");
    revalidatePath("/leads");

    return {
      success: true,
      processedCount,
      totalCount: conversationIds.length,
    };
  } catch (error: any) {
    console.error("Error reanalyzing batch:", error);
    return { success: false, error: error.message };
  }
}
