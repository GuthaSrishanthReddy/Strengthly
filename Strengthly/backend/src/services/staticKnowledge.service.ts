import crypto from "crypto";
import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { toVectorLiteral } from "../utils/vector";

const SYSTEM_USER_ID = "system";
const STATIC_SOURCE = "knowledge:static";

const STATIC_KNOWLEDGE_DOCS = [
  "Progressive overload: increase load, reps, sets, or training density gradually over time while preserving technique.",
  "Protein intake for active adults is commonly set around 1.6 to 2.2 grams per kilogram bodyweight daily, spread across meals.",
  "Beginner strength plans should prioritize compound movements and consistent weekly frequency over high exercise variety.",
  "Fat loss is driven primarily by a sustainable calorie deficit while preserving resistance training and adequate protein intake.",
  "Recovery fundamentals: 7 to 9 hours sleep, manageable stress, and rest days improve adaptation and reduce injury risk.",
];

let seededInProcess = false;

export const staticKnowledgeService = {
  async ensureSeeded() {
    if (seededInProcess) return;

    const existing = await prisma.documentEmbedding.findFirst({
      where: { userId: SYSTEM_USER_ID, source: STATIC_SOURCE },
      select: { id: true },
    });
    if (existing) {
      seededInProcess = true;
      return;
    }

    for (const content of STATIC_KNOWLEDGE_DOCS) {
      const embedding = await createEmbedding(content);
      const embeddingVector = toVectorLiteral(embedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${SYSTEM_USER_ID}, ${STATIC_SOURCE}, ${content}, ${embeddingVector}::vector)
      `;
    }

    seededInProcess = true;
  },
};
