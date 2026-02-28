import { z } from "zod";

export const ragChatSchema = z.object({
  message: z.string().min(1).max(4000),
});

export const chatbotChatSchema = z.object({
  sessionId: z.string().min(1).max(128),
  message: z.string().min(1).max(4000),
});

export const endChatSessionSchema = z.object({
  sessionId: z.string().min(1).max(128),
});
