import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genai = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const model = genai.getGenerativeModel({
  model: "models/gemini-2.5-flash",
  generationConfig: {
    maxOutputTokens: 320,
    temperature: 0.25,
    topP: 0.9,
  },
});

export const embeddingModel = genai.getGenerativeModel({
  model: "models/gemini-embedding-001",
});
