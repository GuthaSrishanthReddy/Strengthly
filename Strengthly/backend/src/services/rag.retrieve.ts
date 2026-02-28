import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { Prisma } from "@prisma/client";
import { toVectorLiteral } from "../utils/vector";

const TOP_K = 3;
const DEFAULT_MAX_CHARS = 2000;

export async function retrieveContext(
  userId: string,
  query: string
): Promise<string> {

  const queryEmbedding = await createEmbedding(query);
  const queryVector = toVectorLiteral(queryEmbedding);
  const queryDims = queryEmbedding.length;

  const results = await prisma.$queryRaw<
    { content: string }[]
  >`
    SELECT content
    FROM "DocumentEmbedding"
    WHERE "userId" = ${userId}
      AND vector_dims(embedding) = ${queryDims}
    ORDER BY embedding <-> ${queryVector}::vector
    LIMIT ${TOP_K}
  `;

  if (results.length === 0) return "";
  else return results.map(r => r.content).join("\n");
}

export async function retrieveContextBySources(
  userId: string,
  query: string,
  sources: string[],
  topK = TOP_K,
  maxChars = DEFAULT_MAX_CHARS
): Promise<string> {
  if (sources.length === 0) return "";

  const queryEmbedding = await createEmbedding(query);
  const queryVector = toVectorLiteral(queryEmbedding);
  const queryDims = queryEmbedding.length;
  const results = await prisma.$queryRaw<
    { content: string }[]
  >`
    SELECT content
    FROM "DocumentEmbedding"
    WHERE "userId" = ${userId}
      AND source IN (${Prisma.join(sources)})
      AND vector_dims(embedding) = ${queryDims}
    ORDER BY embedding <-> ${queryVector}::vector
    LIMIT ${topK}
  `;

  if (results.length === 0) return "";
  return results.map((r) => r.content).join("\n").slice(0, maxChars);
}
