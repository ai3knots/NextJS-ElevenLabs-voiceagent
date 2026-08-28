import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { SystemMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { ALEX_SYSTEM_PROMPT } from './prompt';
import { AGENT_TOOLS } from './tools';

// Model initialization with fallback priority
const apiKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export function createAlexChatModel(modelName = 'gemini-3.5-flash-lite') {
  const currentKey = process.env.GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return new ChatGoogleGenerativeAI({
    apiKey: currentKey,
    model: modelName,
    temperature: 0.35,
  }).bindTools(AGENT_TOOLS);
}

// Tool Node that automatically handles tool executions
const toolNode = new ToolNode(AGENT_TOOLS);

// Graph node that invokes the LLM with System Prompt + Conversation Messages
async function callModel(state: typeof MessagesAnnotation.State) {
  const model = createAlexChatModel();
  const messagesWithSystem = [
    new SystemMessage(ALEX_SYSTEM_PROMPT),
    ...state.messages,
  ];
  const response = await model.invoke(messagesWithSystem);
  return { messages: [response] };
}

// Conditional routing function: determine if LLM requested a tool or reached end of turn
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && 'tool_calls' in lastMessage && Array.isArray((lastMessage as AIMessage).tool_calls) && (lastMessage as AIMessage).tool_calls!.length > 0) {
    return 'tools';
  }
  return END;
}

// Construct the LangGraph StateGraph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', shouldContinue, ['tools', END])
  .addEdge('tools', 'agent');

// Export compiled runnable graph
export const alexChatGraph = workflow.compile();
