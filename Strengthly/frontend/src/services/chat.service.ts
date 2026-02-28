import { api } from "./api";
import type { ChatMessage } from "../types/chat.types";

export const fetchMessages = (conversationId: string) =>
  api<ChatMessage[]>(`/messages/${conversationId}`);

export const sendMessage = (conversationId: string, content: string) =>
  api<void>(`/messages/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
