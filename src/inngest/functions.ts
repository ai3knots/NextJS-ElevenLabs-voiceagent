import { inngest } from "./client";
import connectDB from "../lib/mongodb";
import Lead from "../models/Lead";
import CallLog from "../models/CallLog";
import { triggerOutboundCall } from "../lib/elevenlabs";

export const initiateOutboundCall = inngest.createFunction(
  { id: "initiate-outbound-call", triggers: [{ event: "calls/initiate" }] },
  async ({ event, step }) => {
    const { leadId, agentId, agentPhoneNumberId } = event.data as { leadId: string; agentId?: string; agentPhoneNumberId?: string };

    await connectDB();
    
    let lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    if (["initiating", "in_progress", "ringing"].includes(lead.callStatus)) {
      return { message: "Call already initiated or is active." };
    }

    if (lead.callType === "auto" && lead.callDelayMinutes && lead.callDelayMinutes > 0) {
      await step.sleep("wait-for-delay", `${lead.callDelayMinutes}m`);
      
      // Re-fetch lead after sleep to ensure it hasn't been cancelled or called manually
      await connectDB();
      lead = await Lead.findById(leadId);
      if (!lead || ["initiating", "in_progress", "ringing"].includes(lead.callStatus)) {
        return { message: "Call status changed during delay. Aborting." };
      }
    }

    const result = await step.run("trigger-elevenlabs-call", async () => {
      await connectDB();
      const newLog = await CallLog.create({
        leadId: lead._id,
        callStatus: "initiating",
      });

      await Lead.updateOne({ _id: lead._id }, { callStatus: "initiating" });

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

      const dynamicVariables = {
        found: "true",
        author_name: lead.firstName || "Unknown",
        company: lead.company || "",
        book_topic: lead.bookTopic || "Unknown",
        writing_stage: lead.writingStage || "Unknown",
        last_completed_stage: lead.lastCompletedStage || "no_interaction",
        last_outcome: lead.lastCallOutcome || "no_interaction",
        last_summary: lead.lastCallSummary || lead.callSummary || "No previous summary available.",
        context: lead.context || "",
        recent_calls_context: recentCallsContext,
        call_direction: "outbound"
      };

      const response = await triggerOutboundCall(lead.phoneNumber, dynamicVariables, agentId, agentPhoneNumberId);

      if (response.success && response.conversation_id) {
        await CallLog.updateOne(
          { _id: newLog._id },
          {
            elevenlabsConversationId: response.conversation_id,
            callStatus: "in_progress",
          }
        );

        await Lead.updateOne(
          { _id: lead._id },
          {
            elevenlabsConversationId: response.conversation_id,
            callStatus: "in_progress",
            callErrorReason: null,
          }
        );
        return { success: true, conversation_id: response.conversation_id };
      } else {
        const errorMsg = response.error || "Unknown error occurred";
        await CallLog.updateOne(
          { _id: newLog._id },
          { callStatus: "failed", callErrorReason: errorMsg }
        );
        await Lead.updateOne(
          { _id: lead._id },
          { callStatus: "failed", callErrorReason: errorMsg }
        );
        return { success: false, error: errorMsg };
      }
    });

    return result;
  }
);
