import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const transcriptMessages = messages.map((m: any) => {
        const role = m.role === "agent" ? "AI Agent" : "Visitor";
        return `${role}: ${m.content}`;
    });

    const summaryText = transcriptMessages.join("\n\n");

    const newChat = await ChatLog.create({
      chatStatus: "completed",
      chatSummary: summaryText,
      chatOutcome: "completed",
      followUpRequired: false,
      rawWebhookPayload: { source: "web_ui_fallback", messages }
    });

    console.log(`💬 Saved ChatLog ID: ${newChat._id} directly from Web UI`);
    return NextResponse.json({ success: true, id: newChat._id });
  } catch (err: any) {
    console.error("Failed to save chat manually:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
