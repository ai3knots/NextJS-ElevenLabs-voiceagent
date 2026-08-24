import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || "";

    // IMPORTANT: Here you would integrate with your LLM of choice (e.g., OpenAI, Anthropic) 
    // using the specific prompt for agent_5601m0tgt63qe8tt5q9qcnfqf5wa.
    // For demonstration of the natural typing UI, we provide a simulated natural response.
    
    // Simulate natural processing delay (3 to 6 seconds)
    const delay = Math.floor(Math.random() * 3000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    let reply = "I'm here to help you publish your book. Could you tell me a little bit about what you're writing?";
    
    if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
      reply = "Hello! I'm the Nationwide Publishing agent. How can I assist you with your manuscript today?";
    } else if (lastMessage.toLowerCase().includes("cost") || lastMessage.toLowerCase().includes("price")) {
      reply = "Our Nationwide Publishing Plan is currently available for a one-time fee of $999. Would you like me to go over what's included?";
    } else if (lastMessage.length > 20) {
      reply = "That sounds fascinating! Have you already completed the manuscript, or are you still in the writing phase?";
    }

    return NextResponse.json({
      role: "agent",
      content: reply,
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
