import { api } from "./api";

export const askChatbot = (sessionId: string, message: string) =>
  api<string>("/ai/chatbot", {
    method: "POST",
    body: JSON.stringify({ sessionId, message }),
  });
  
export const endChatSession = (sessionId: string) =>
  api<{ ok: boolean }>("/ai/chatbot/end", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
