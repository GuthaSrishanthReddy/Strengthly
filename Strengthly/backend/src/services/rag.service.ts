import { model } from "./model.service";
import { retrieveContext } from "./rag.retrieve";

const RAG_CACHE_TTL_MS = 60_000;
const RAG_CACHE_MAX_ENTRIES = 300;
const responseCache = new Map<string, { answer: string; expiresAt: number }>();

const normalizeAiError = (error: any) => {
  const status = error?.status ?? error?.statusCode;
  const statusText = String(error?.statusText ?? "");

  const retryAfter = (() => {
    const details = Array.isArray(error?.errorDetails) ? error.errorDetails : [];
    const retryInfo = details.find((d: any) =>
      String(d?.["@type"] ?? "").includes("RetryInfo")
    );
    const delay = String(retryInfo?.retryDelay ?? "");
    const match = delay.match(/(\d+)/);
    return match ? Number(match[1]) : undefined;
  })();

  if (status === 429 || statusText.toLowerCase().includes("too many requests")) {
    const err = new Error(
      retryAfter
        ? `AI service rate-limited. Please retry in ${retryAfter}s.`
        : "AI service rate-limited. Please retry shortly."
    ) as Error & { statusCode?: number; retryAfter?: number };
    err.statusCode = 429;
    if (retryAfter) err.retryAfter = retryAfter;
    return err;
  }

  return error;
};

const pruneRagCache = (now: number) => {
  for (const [key, value] of responseCache.entries()) {
    if (value.expiresAt <= now) responseCache.delete(key);
  }

  if (responseCache.size > RAG_CACHE_MAX_ENTRIES) {
    const overflow = responseCache.size - RAG_CACHE_MAX_ENTRIES;
    const keys = Array.from(responseCache.keys()).slice(0, overflow);
    for (const key of keys) responseCache.delete(key);
  }
};

export const ragService = {
  async chat(userId: string, message: string) {
    const cacheKey = `${userId}:${message.trim().toLowerCase()}`;
    const now = Date.now();
    pruneRagCache(now);

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      console.log("Cache hit");
      return cached.answer;
    }

    console.log("Cache miss - running RAG");

    const context = (await retrieveContext(userId, message)) || "No History available";

    const prompt = `
You are a helpful fitness and nutrition assistant.
Answer ONLY using the context below.
If the context is insufficient, say "Not enough data".

Context:
${context}

Question:
${message}
`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (error) {
      throw normalizeAiError(error);
    }
    const answer = result.response.text();

    responseCache.set(cacheKey, { answer, expiresAt: now + RAG_CACHE_TTL_MS });
    return answer;
  },
};
