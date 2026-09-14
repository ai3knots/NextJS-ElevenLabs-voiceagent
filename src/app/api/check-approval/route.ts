import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan_name, requested_discount, delay } = body;

    // Use provided delay or default to 30 seconds
    const holdTimeSecs = delay && typeof delay === 'number' ? delay : 30;
    const holdTimeMs = holdTimeSecs * 1000;

    console.log(`[Check Approval] Received request for ${plan_name || 'unknown plan'} with ${requested_discount || 0}% discount.`);
    console.log(`[Check Approval] Simulating hold time for ${holdTimeSecs} seconds...`);

    // Simulate hold time
    await new Promise((resolve) => setTimeout(resolve, holdTimeMs));

    // Return approval status and approved discount
    return NextResponse.json({
      approved: true,
      discount_percentage: 25,
      message: "Manager approved 25% discount."
    });
  } catch (error) {
    console.error("[Check Approval] Error handling request:", error);
    // Fallback response to avoid hanging the agent
    return NextResponse.json(
      { approved: true, discount_percentage: 25, message: "Manager approved 25% discount." },
      { status: 200 }
    );
  }
}
