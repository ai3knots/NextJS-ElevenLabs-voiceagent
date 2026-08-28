"use server";

import connectDB from "@/lib/mongodb";
import ChatLogModel from "@/models/ChatLog";
import LeadModel from "@/models/Lead";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { revalidatePath } from "next/cache";
import { validateEmail, validateUSPhoneNumber } from "@/agent/tools";

/**
 * Fetch a single chat log by ID with populated Lead if available
 */
export async function getChatById(id: string) {
  try {
    await connectDB();
    const chat = await ChatLogModel.findById(id).populate("leadId").lean();
    if (!chat) return null;
    return JSON.parse(JSON.stringify(chat));
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    return null;
  }
}

/**
 * Generate or refresh AI Summary for a specific chat log using Gemini 3.5 Flash-Lite
 */
export async function generateChatSummaryAction(chatId: string) {
  try {
    await connectDB();
    const chat = await ChatLogModel.findById(chatId);
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return { success: false, error: "No messages found to summarize." };
    }

    const apiKey = process.env.GEMINI_API || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API key is not configured." };
    }

    // Format full transcript for LLM
    const transcriptText = chat.messages
      .map((m: any) => `${m.role === "user" ? "Customer" : "Alex (MPH Advisor)"}: ${m.content}`)
      .join("\n");

    const llm = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-3.5-flash-lite",
      temperature: 0.2,
    });

    const prompt = `You are an expert CRM Intelligence Analyst for Marketing And Publishing House LLC (MPH).
Analyze this chat transcript between a website visitor / author and our chat consultant Alex.

Chat Transcript:
${transcriptText}

Output your analysis strictly in valid JSON format with this exact structure:
{
  "summary": "Concise 2-3 sentence executive summary of what was discussed, author needs, and status.",
  "authorName": "Extracted full name of author if mentioned by user (e.g. 'Kashif Ali') or null",
  "email": "Extracted email address if provided or null",
  "phone": "Extracted phone/mobile number if provided or null",
  "bookTopic": "Genre / Topic (e.g. Biography, Children's Book, Memoir) or null",
  "writingStage": "Stage (e.g. Completed Manuscript, Drafting, Idea, Published) or null",
  "servicesNeeded": ["list", "of", "services", "e.g. Editing, Cover Design, Formatting, Distribution"],
  "chatOutcome": "Short outcome e.g. Lead Captured / Follow-Up Scheduled / Discovery",
  "leadSentiment": "High Intent / Interested / Cautious / Casual",
  "recommendedAction": "Actionable next step for Senior Publishing Consultant Elizabeth"
}
Output ONLY the JSON object, without markdown ticks or additional commentary.`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    const rawContent = response.content.toString().trim();
    
    // Clean potential markdown wrap
    const jsonStr = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let analysis: any = {};
    try {
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.warn("Failed to parse json summary, using fallback text:", rawContent);
      analysis = {
        summary: rawContent.slice(0, 300),
        chatOutcome: "Inquiry / Discussion",
      };
    }

    // Update ChatLog in MongoDB
    chat.chatSummary = analysis.summary || chat.chatSummary;
    chat.chatOutcome = analysis.chatOutcome || chat.chatOutcome || "Completed";
    chat.chatStatus = "completed";
    chat.rawWebhookPayload = {
      ...(chat.rawWebhookPayload || {}),
      analysis,
      lastSummarizedAt: new Date().toISOString(),
    };

    // If author contact info is newly found and leadId is missing, create or link lead if valid
    const emailCheck = analysis.email ? validateEmail(analysis.email) : { isValid: false };
    const phoneCheck = analysis.phone ? validateUSPhoneNumber(analysis.phone) : { isValid: false };

    if ((emailCheck.isValid || phoneCheck.isValid) && !chat.leadId) {
      const leadData: any = {
        firstName: analysis.authorName ? analysis.authorName.split(" ")[0] : "Web Author",
        lastName: analysis.authorName && analysis.authorName.split(" ").length > 1 ? analysis.authorName.split(" ").slice(1).join(" ") : "",
        email: emailCheck.isValid ? emailCheck.cleanEmail : undefined,
        phoneNumber: phoneCheck.isValid ? phoneCheck.cleanPhone : "Pending",
        bookTopic: analysis.bookTopic || undefined,
        writingStage: analysis.writingStage ? analysis.writingStage.toLowerCase().replace(/\s+/g, "_") : undefined,
        context: analysis.summary,
        status: "manual",
        callStatus: "pending",
      };

      const newLead = await LeadModel.create(leadData);
      chat.leadId = newLead._id;
    }

    await chat.save();

    revalidatePath(`/chats/${chatId}`);
    revalidatePath("/chats");

    return { 
      success: true, 
      analysis, 
      summary: chat.chatSummary,
      outcome: chat.chatOutcome 
    };
  } catch (error: any) {
    console.error("Error generating chat summary:", error);
    return { success: false, error: error.message || "Failed to generate summary" };
  }
}

/**
 * Delete a chat log
 */
export async function deleteChatAction(chatId: string) {
  try {
    await connectDB();
    await ChatLogModel.findByIdAndDelete(chatId);
    revalidatePath("/chats");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
