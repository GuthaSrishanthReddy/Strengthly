import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { model } from "./model.service";
import { embeddingStoreService } from "./embeddingStore.service";
import crypto from "crypto";
import { retrieveContextBySources } from "./rag.retrieve";
import { toVectorLiteral } from "../utils/vector";

export const aiSupplementService = {
  parseSupplementItems(raw: string) {
    const normalize = (text: string) =>
      text
        .replace(/[“”]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/[\u201C\u201D]/g, "\"")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/^\s*json\s*/i, "")
        .trim();

    const extractJson = (text: string) => {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const unfenced = fenceMatch ? fenceMatch[1] : text;
      const cleaned = normalize(
        unfenced.replace(/^```(?:json)?/i, "").replace(/```$/i, "")
      );
      const firstArray = cleaned.indexOf("[");
      const firstObj = cleaned.indexOf("{");
      const start =
        firstArray === -1
          ? firstObj
          : firstObj === -1
          ? firstArray
          : Math.min(firstArray, firstObj);
      if (start === -1) return cleaned;
      const lastArray = cleaned.lastIndexOf("]");
      const lastObj = cleaned.lastIndexOf("}");
      const end =
        lastArray === -1
          ? lastObj
          : lastObj === -1
          ? lastArray
          : Math.max(lastArray, lastObj);
      return end >= start
        ? cleaned.slice(start, end + 1).trim()
        : cleaned.slice(start).trim();
    };

    const jsonText = extractJson(raw);
    let items: Array<{ supplement: string; dosage: string; notes: string }> = [];
    try {
      const parsed = JSON.parse(jsonText);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      let repaired = jsonText;
      if (repaired.startsWith("[") && !repaired.endsWith("]")) repaired += "]";
      if (repaired.startsWith("{") && !repaired.endsWith("}")) repaired += "}";

      try {
        const parsed = JSON.parse(repaired);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        const cleaned = normalize(raw);
        const extracted: Array<{
          supplement: string;
          dosage: string;
          notes: string;
        }> = [];
        const itemRegex =
          /"supplement"\s*:\s*"([^"]+)"[\s\S]*?"dosage"\s*:\s*"([^"]*)"[\s\S]*?"notes"\s*:\s*"([^"]*)"/gi;
        let match: RegExpExecArray | null;
        while ((match = itemRegex.exec(cleaned)) !== null) {
          extracted.push({
            supplement: match[1],
            dosage: match[2],
            notes: match[3],
          });
        }
        items = extracted;
      }
    }
    return items;
  },

  async getLatestSupplements(userId: string) {
    const latest = await embeddingStoreService.getLatestBySource(
      userId,
      "supplement"
    );

    if (!latest) return [];
    return aiSupplementService.parseSupplementItems(latest.content);
  },

  async generateSupplements(userId: string) {
    const retrievedContext = await retrieveContextBySources(
      userId,
      "Generate supplement suggestions using progress and routine data.",
      ["progress", "routine"],
      8,
      3000
    );

    const prompt = `
You are a helpful fitness assistant.
Suggest supplements ONLY if they are clearly useful for the user's goal or deficiencies.
If none are needed, return an empty array [].

Return ONLY valid JSON in this exact shape:
[
  { "supplement": "Creatine", "dosage": "5g daily", "notes": "Take with water" }
]

Retrieved user context:
${retrievedContext || "none"}
Generate supplement suggestions based on the above information.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    console.log("RAW_SUPPLEMENT_RESPONSE:", raw);

    let items = aiSupplementService.parseSupplementItems(raw);
    if (items.length === 0 && raw.trim() !== "[]") {
      const retryPrompt = `
Return ONLY valid JSON (no code fences, no extra text) in this exact shape:
[
  { "supplement": "Creatine", "dosage": "5g daily", "notes": "Take with water" }
]

If you are not confident any supplements are needed, return [].
`;
      const retry = await model.generateContent(retryPrompt);
      const retryRaw = retry.response.text().trim();
      console.log("RAW_SUPPLEMENT_RESPONSE_RETRY:", retryRaw);
      items = aiSupplementService.parseSupplementItems(retryRaw);
    }

    const supplementText = JSON.stringify(items);
    const hasSupplementEmbedding = await embeddingStoreService.hasExactContent(
      userId,
      "supplement",
      supplementText
    );
    if (!hasSupplementEmbedding) {
      const supplementEmbedding = await createEmbedding(supplementText);
      const supplementVector = toVectorLiteral(supplementEmbedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${userId}, 'supplement', ${supplementText}, ${supplementVector}::vector)
      `;
    }

    return items;
  },
};
