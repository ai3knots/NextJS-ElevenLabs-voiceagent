import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { MessagesAnnotation } from '@langchain/langgraph';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { 
  STAGE_INITIAL_ENGAGEMENT_PROMPT, 
  STAGE_QUALIFYING_PROMPT, 
  STAGE_VALUE_CREATION_PROMPT,
  STAGE_CONTACT_CAPTURE_PROMPT, 
  STAGE_PLANS_PROMPT,
  STAGE_SCHEDULING_PROMPT
} from './prompt';
import { AGENT_TOOLS } from './tools';

// Define Custom State
export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  conversationStage: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "INITIAL_ENGAGEMENT"
  }),
});

export function createAlexChatModel(modelName = 'gemini-3.5-flash-lite') {
  const currentKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return new ChatGoogleGenerativeAI({
    apiKey: currentKey,
    model: modelName,
    temperature: 0.1,
  }).bindTools(AGENT_TOOLS);
}

// ============================================================================
// 1. STAGE EVALUATOR NODE (The Router Logic)
// ============================================================================
async function evaluateStageTransition(state: typeof AgentState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (!lastMessage || lastMessage._getType() !== 'human') {
    return {}; 
  }
  
  const currentStage = state.conversationStage || 'INITIAL_ENGAGEMENT';
  
  const transitionSchema = z.object({
    nextStage: z.enum(["INITIAL_ENGAGEMENT", "QUALIFYING", "VALUE_CREATION", "CONTACT_CAPTURE", "PLANS", "SCHEDULING"]),
    reasoning: z.string().describe("Explanation for why this stage was chosen based on the rules.")
  });

  const currentKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const evaluatorModel = new ChatGoogleGenerativeAI({
    apiKey: currentKey,
    model: 'gemini-3.5-flash-lite',
    temperature: 0,
  }).withStructuredOutput(transitionSchema);

  const prompt = `You are a conversation router for a publishing consultant chatbot.
Current Stage: ${currentStage}

Rules for transitioning:
- If Current Stage is INITIAL_ENGAGEMENT: Move to QUALIFYING if the user shares details about a book, intent to publish, or answers questions about their book. Otherwise, stay in INITIAL_ENGAGEMENT.
- If Current Stage is QUALIFYING: If the user explicitly refuses a call (e.g., "no", "not interested in a call"), move to PLANS. Otherwise, move to VALUE_CREATION if the user provides sufficient details about their book (e.g. pages, length, goals). If they haven't provided details or just say "yes" without details, stay in QUALIFYING.
- If Current Stage is VALUE_CREATION: Move to CONTACT_CAPTURE if the user shows interest in hearing about the plans, scheduling, or if all their questions are answered and they are ready to move forward. Otherwise stay in VALUE_CREATION to continue providing value and answering questions.
- If Current Stage is CONTACT_CAPTURE: Move to PLANS if they provide contact info (email/phone number) OR if they explicitly refuse to provide it (e.g., "no", "not comfortable"). Otherwise stay in CONTACT_CAPTURE.
- If Current Stage is PLANS: Move to SCHEDULING if they say "yes" to scheduling a call, explicitly pick a plan, or are ready to move forward. If they refuse the call, prefer to see plans in chat, or are asking questions, stay in PLANS.
- General Rule: DO NOT move to SCHEDULING unless the author is completely satisfied, all questions have been answered, and they are explicitly ready to move forward to a call.
- If Current Stage is SCHEDULING: Stay in SCHEDULING.

Evaluate the conversation history and determine the next stage.`;

  try {
    const response = await evaluatorModel.invoke([
      new SystemMessage(prompt),
      ...state.messages,
    ]);

    console.log(`[Stage Evaluator LLM] Reason: ${response.reasoning} | Old Stage: ${currentStage} | New Stage: ${response.nextStage}`);
    return { conversationStage: response.nextStage };
  } catch (error) {
    console.error("[Stage Evaluator LLM] Error:", error);
    return { conversationStage: currentStage };
  }
}

// ============================================================================
// 2. AGENT STAGE NODES
// ============================================================================
async function runInitialEngagementNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_INITIAL_ENGAGEMENT_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

async function runQualifyingNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_QUALIFYING_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

async function runValueCreationNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_VALUE_CREATION_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

async function runContactNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_CONTACT_CAPTURE_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

async function runPlansNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_PLANS_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

async function runSchedulingNode(state: typeof AgentState.State) {
  const model = createAlexChatModel();
  const response = await model.invoke([
    new SystemMessage(STAGE_SCHEDULING_PROMPT),
    ...state.messages,
  ]);
  return { messages: [response] };
}

const toolNode = new ToolNode(AGENT_TOOLS);

// ============================================================================
// 3. GRAPH ROUTING & COMPILATION
// ============================================================================

function routeToStage(state: typeof AgentState.State) {
  return state.conversationStage || 'INITIAL_ENGAGEMENT';
}

function shouldContinueFromStage(state: typeof AgentState.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && 'tool_calls' in lastMessage && Array.isArray((lastMessage as AIMessage).tool_calls) && (lastMessage as AIMessage).tool_calls!.length > 0) {
    return 'tools';
  }
  return END;
}

const workflow = new StateGraph(AgentState)
  // Add Nodes
  .addNode('evaluator', evaluateStageTransition)
  .addNode('INITIAL_ENGAGEMENT', runInitialEngagementNode)
  .addNode('QUALIFYING', runQualifyingNode)
  .addNode('VALUE_CREATION', runValueCreationNode)
  .addNode('CONTACT_CAPTURE', runContactNode)
  .addNode('PLANS', runPlansNode)
  .addNode('SCHEDULING', runSchedulingNode)
  .addNode('tools', toolNode)
  
  // Start by evaluating the state
  .addEdge(START, 'evaluator')
  
  // Then route to the correct stage node
  .addConditionalEdges('evaluator', routeToStage, {
    'INITIAL_ENGAGEMENT': 'INITIAL_ENGAGEMENT',
    'QUALIFYING': 'QUALIFYING',
    'VALUE_CREATION': 'VALUE_CREATION',
    'CONTACT_CAPTURE': 'CONTACT_CAPTURE',
    'PLANS': 'PLANS',
    'SCHEDULING': 'SCHEDULING'
  })
  
  // From each stage, either end or go to tools
  .addConditionalEdges('INITIAL_ENGAGEMENT', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  .addConditionalEdges('QUALIFYING', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  .addConditionalEdges('VALUE_CREATION', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  .addConditionalEdges('CONTACT_CAPTURE', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  .addConditionalEdges('PLANS', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  .addConditionalEdges('SCHEDULING', shouldContinueFromStage, {
    'tools': 'tools',
    [END]: END
  })
  
  // If tools ran, we need to go back to the current stage node to process tool output
  .addConditionalEdges('tools', routeToStage, {
    'INITIAL_ENGAGEMENT': 'INITIAL_ENGAGEMENT',
    'QUALIFYING': 'QUALIFYING',
    'VALUE_CREATION': 'VALUE_CREATION',
    'CONTACT_CAPTURE': 'CONTACT_CAPTURE',
    'PLANS': 'PLANS',
    'SCHEDULING': 'SCHEDULING'
  });

export const alexChatGraph = workflow.compile();
