/**
 * Types for the Alex LangGraph Chat Agent
 */

export interface ChatAgentOptions {
  sessionId: string;
  userMessage: string;
  platform?: 'web' | 'messenger';
  userProfile?: {
    firstName?: string;
    lastName?: string;
    profilePic?: string;
  };
}

export interface ChatAgentResponse {
  reply: string;
  replies?: string[];
  sessionId: string;
  platform: string;
  chatLogId?: string;
}
