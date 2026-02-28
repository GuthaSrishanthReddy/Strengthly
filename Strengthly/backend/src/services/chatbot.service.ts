import crypto from "crypto";
import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { model } from "./model.service";
import { staticKnowledgeService } from "./staticKnowledge.service";
import { toVectorLiteral } from "../utils/vector";

const TOP_K = 3;
const MAX_CONTEXT_CHARS = 1200;
const MAX_SECTION_CHARS = 1400;
const MAX_PROMPT_CONTEXT_CHARS = 5200;
const CHAT_CACHE_TTL_MS = 60_000;
const CHAT_CACHE_MAX_ENTRIES = 300;
const chatResponseCache = new Map<string, { answer: string; expiresAt: number }>();
const pruneChatCache = (now: number) => {
  for (const [key, value] of chatResponseCache.entries()) {
    if (value.expiresAt <= now) {
      chatResponseCache.delete(key);
    }
  }
  if (chatResponseCache.size > CHAT_CACHE_MAX_ENTRIES) {
    const overflow = chatResponseCache.size - CHAT_CACHE_MAX_ENTRIES;
    const keys = Array.from(chatResponseCache.keys()).slice(0, overflow);
    for (const key of keys) chatResponseCache.delete(key);
  }
};

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
    ) as any;
    err.statusCode = 429;
    if (retryAfter) {
      err.retryAfter = retryAfter;
    }
    return err;
  }

  return error;
};

const createEmbeddingSafe = async (text: string) => {
  try {
    return await createEmbedding(text);
  } catch (error) {
    throw normalizeAiError(error);
  }
};

const generateContentSafe = async (prompt: string) => {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    throw normalizeAiError(error);
  }
};

const buildSource = (sessionId: string) => `chat_session:${sessionId}`;
const clip = (value: string, max = MAX_SECTION_CHARS) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

const stringifySafe = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

export const chatbotService = {
  async chat(userId: string, sessionId: string, message: string) {
    const normalized = message.trim();

    if (!sessionId) {
      const err = new Error("Missing sessionId") as Error & {
        statusCode?: number;
      };
      err.statusCode = 400;
      throw err;
    }

    if (!normalized) {
      return "Please enter a message.";
    }

    const cacheKey = `${userId}:${sessionId}:${normalized.toLowerCase()}`;
    const now = Date.now();
    pruneChatCache(now);
    const cached = chatResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.answer;
    }

    await staticKnowledgeService.ensureSeeded();

    const source = buildSource(sessionId);
    const userEmbedding = await createEmbeddingSafe(normalized);
    const userVector = toVectorLiteral(userEmbedding);
    const userDims = userEmbedding.length;
    const contextRows = await prisma.$queryRaw<
      { content: string }[]
    >`
      SELECT content
      FROM "DocumentEmbedding"
      WHERE ("userId" = ${userId} OR "userId" = 'system')
        AND vector_dims(embedding) = ${userDims}
      ORDER BY embedding <-> ${userVector}::vector
      LIMIT ${TOP_K}
    `;
    const retrievedContext = contextRows.map((row) => row.content).join("\n");
    const limitedContext = retrievedContext.slice(0, MAX_CONTEXT_CHARS);

    const [userProfile, latestPlan, latestDiet, latestSupplement, recentProgress] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            fitnessGoal: true,
            fitnessLevel: true,
            activityType: true,
          },
        }),
        prisma.plan.findUnique({
          where: { userId },
          select: {
            calories: true,
            protein: true,
            carbs: true,
            fats: true,
            workoutPlan: true,
            supplementPlan: true,
            meditationPlan: true,
            updatedAt: true,
          },
        }),
        prisma.documentEmbedding.findFirst({
          where: { userId, source: "diet" },
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        }),
        prisma.documentEmbedding.findFirst({
          where: { userId, source: "supplement" },
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        }),
        prisma.progress.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            createdAt: true,
            weight: true,
            bodyFat: true,
            muscleMass: true,
            waistCircumference: true,
            workoutFrequency: true,
            workoutDuration: true,
            cardioMinutes: true,
            sleepHours: true,
            stressLevel: true,
            notes: true,
          },
        }),
      ]);

    const contextSections = [
      `Semantic retrieval:\n${clip(limitedContext || "none")}`,
      `User profile:\n${clip(
        stringifySafe(userProfile) || "none"
      )}`,
      `Latest plan:\n${clip(
        stringifySafe(latestPlan) || "none"
      )}`,
      `Latest diet:\n${clip(
        latestDiet?.content || "none"
      )}`,
      `Latest supplements:\n${clip(
        latestSupplement?.content || "none"
      )}`,
      `Recent progress entries:\n${clip(
        stringifySafe(recentProgress) || "none"
      )}`,
    ];
    const enrichedContext = contextSections.join("\n\n").slice(0, MAX_PROMPT_CONTEXT_CHARS);

    const userContent = `User: ${normalized}`;

    await prisma.$executeRaw`
      INSERT INTO "DocumentEmbedding"
        (id, "userId", source, content, embedding)
      VALUES
        (${crypto.randomUUID()}, ${userId}, ${source}, ${userContent}, ${userVector}::vector)
    `;

    const prompt = `
You are a helpful fitness and nutrition assistant.
Use all provided context sections (semantic retrieval, profile, plan, diet, supplements, and progress).
If a requested detail is missing, clearly say what is missing.
Be concise, practical, and personalized to the user data.

Retrieved context:
${enrichedContext || "none"}

User message:
${normalized}

Respond clearly and concisely.
`;

    const result = await generateContentSafe(prompt);
    const answer = result.response.text();
    chatResponseCache.set(cacheKey, {
      answer,
      expiresAt: now + CHAT_CACHE_TTL_MS,
    });

    return answer;
  },

  async endSession(userId: string, sessionId: string) {
    if (!sessionId) {
      const err = new Error("Missing sessionId") as Error & {
        statusCode?: number;
      };
      err.statusCode = 400;
      throw err;
    }

    const source = buildSource(sessionId);
    await prisma.documentEmbedding.deleteMany({
      where: { userId, source },
    });

    const prefix = `${userId}:${sessionId}:`;
    for (const key of chatResponseCache.keys()) {
      if (key.startsWith(prefix)) chatResponseCache.delete(key);
    }
  },
};
