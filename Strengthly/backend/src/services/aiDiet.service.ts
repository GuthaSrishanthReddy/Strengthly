import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { model } from "./model.service";
import { embeddingStoreService } from "./embeddingStore.service";
import crypto from "crypto";
import { retrieveContextBySources } from "./rag.retrieve";
import { toVectorLiteral } from "../utils/vector";

export const aiDietService = {
  parseDietItems(raw: string) {
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
    let dietItems: Array<{ meal: string; items: string; notes: string }> = [];
    try {
      const parsed = JSON.parse(jsonText);
      dietItems = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      let repaired = jsonText;
      if (repaired.startsWith("[") && !repaired.endsWith("]")) repaired += "]";
      if (repaired.startsWith("{") && !repaired.endsWith("}")) repaired += "}";

      try {
        const parsed = JSON.parse(repaired);
        dietItems = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        const cleaned = normalize(raw);
        const items: Array<{ meal: string; items: string; notes: string }> = [];
        const itemRegex =
          /"meal"\s*:\s*"([^"]+)"[\s\S]*?"items"\s*:\s*"([^"]*)"[\s\S]*?"notes"\s*:\s*"([^"]*)"/gi;
        let match: RegExpExecArray | null;
        while ((match = itemRegex.exec(cleaned)) !== null) {
          items.push({
            meal: match[1],
            items: match[2],
            notes: match[3],
          });
        }
        dietItems = items;
      }
    }
    return dietItems;
  },

  async getLatestDiet(userId: string) {
    const latest = await embeddingStoreService.getLatestBySource(userId, "diet");

    if (!latest) return [];
    return aiDietService.parseDietItems(latest.content);
  },

  async generateDiet(userId: string) {
    const retrievedContext = await retrieveContextBySources(
      userId,
      "Generate a concise nutrition plan from progress and routine data.",
      ["progress", "routine"],
      8,
      3000
    );

    const prompt = `
You are a helpful fitness nutrition assistant.
Use the user's progress history and routine history to generate a concise meal plan.

Return ONLY valid JSON in this exact shape:
[
  { "meal": "Breakfast", "items": "Oats, eggs, banana", "notes": "High protein" }
]

Retrieved user context:
${retrievedContext || "none"}
Generate a meal plan based on the above information.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    console.log("RAW_DIET_RESPONSE:", raw);

    let dietItems = aiDietService.parseDietItems(raw);
    if (dietItems.length === 0) {
      const retryPrompt = `
Return ONLY valid JSON (no code fences, no extra text) in this exact shape:
[
  { "meal": "Breakfast", "items": "Oats, eggs, banana", "notes": "High protein" }
]

If you cannot use the history, return a generic 1-day meal plan with 4 items.
`;
      const retry = await model.generateContent(retryPrompt);
      const retryRaw = retry.response.text().trim();
      console.log("RAW_DIET_RESPONSE_RETRY:", retryRaw);
      dietItems = aiDietService.parseDietItems(retryRaw);
    }

    // Ensure static diet is always printed
    if (dietItems.length === 0) {
      dietItems = [
        { "meal": "Breakfast", "items": "Oatmeal with fruits and nuts", "notes": "High protein and fiber" },
        { "meal": "Snack", "items": "Greek yogurt", "notes": "Protein-rich" },
        { "meal": "Lunch", "items": "Grilled chicken salad with quinoa", "notes": "Balanced meal" },
        { "meal": "Snack", "items": "Apple slices with peanut butter", "notes": "Healthy fats and carbs" },
        { "meal": "Dinner", "items": "Baked salmon, steamed broccoli, and sweet potatoes", "notes": "Omega-3 and vitamins" }
      ];
    }
    console.log("FINAL_DIET_ITEMS:", JSON.stringify(dietItems, null, 2));

    const dietText = JSON.stringify(dietItems);
    const hasDietEmbedding = await embeddingStoreService.hasExactContent(
      userId,
      "diet",
      dietText
    );
    if (!hasDietEmbedding) {
      const dietEmbedding = await createEmbedding(dietText);
      const dietVector = toVectorLiteral(dietEmbedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${userId}, 'diet', ${dietText}, ${dietVector}::vector)
      `;
    }

    return dietItems;
  },
};

export const getDietEmbeddings = async (userId: string) => {
  return embeddingStoreService.getBySource(userId, "diet", "asc");
};

export const getRoutineEmbeddings = async (userId: string) => {
  return embeddingStoreService.getBySource(userId, "routine", "asc");
};
