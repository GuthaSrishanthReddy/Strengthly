export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  reply: string;
}

export interface ProgressInsight {
  summary: string;
  warnings?: string[];
}
