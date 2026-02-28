import { api } from "./api";
import type { RagResponse } from "../types/rag.types";

export const askRag = (message: string) =>
  api<RagResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
