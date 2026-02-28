import { prisma } from "../config/db";

export type EmbeddingSource =
  | "progress"
  | "routine"
  | "diet"
  | "plan"
  | "supplement"
  | string;

type SortOrder = "asc" | "desc";

export const embeddingStoreService = {
  async hasExactContent(
    userId: string,
    source: EmbeddingSource,
    content: string
  ) {
    const existing = await prisma.documentEmbedding.findFirst({
      where: { userId, source, content },
      select: { id: true },
    });
    return Boolean(existing);
  },

  async getAllEmbeddings(userId: string, order: SortOrder = "desc") {
    return prisma.documentEmbedding.findMany({
      where: { userId },
      orderBy: { createdAt: order },
    });
  },

  async getBySource(
    userId: string,
    source: EmbeddingSource,
    order: SortOrder = "desc"
  ) {
    return prisma.documentEmbedding.findMany({
      where: { userId, source },
      orderBy: { createdAt: order },
    });
  },

  async getLatestBySource(userId: string, source: EmbeddingSource) {
    return prisma.documentEmbedding.findFirst({
      where: { userId, source },
      orderBy: { createdAt: "desc" },
    });
  },

  async getContentBySource(
    userId: string,
    source: EmbeddingSource,
    order: SortOrder = "desc"
  ) {
    const rows = await this.getBySource(userId, source, order);
    return rows.map((row) => row.content);
  },
};
