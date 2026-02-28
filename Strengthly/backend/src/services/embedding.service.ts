import { embeddingModel } from "./model.service";


export async function createEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}
