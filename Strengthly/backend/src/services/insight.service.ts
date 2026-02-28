import { prisma } from "../config/db";
import { model } from "./model.service";

const parseJsonPayload = (raw: string) => {
  const text = raw.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const unfenced = fenceMatch ? fenceMatch[1].trim() : text;
  const firstObj = unfenced.indexOf("{");
  const lastObj = unfenced.lastIndexOf("}");
  const candidate =
    firstObj >= 0 && lastObj > firstObj
      ? unfenced.slice(firstObj, lastObj + 1).trim()
      : unfenced;
  const repaired =
    candidate.startsWith("{") && !candidate.endsWith("}")
      ? `${candidate}}`
      : candidate;

  try {
    return JSON.parse(repaired);
  } catch {
    return null;
  }
};

export const insightService = {
  async analyzeProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fitnessGoal: true },
    });

    // Fetch latest progress entries

    const progressEntries = await prisma.progress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (progressEntries.length === 0) {
      return {
        status: "no-data",
        message: "No progress data available",
      };
    }

    const aiInput = progressEntries.map((entry) => ({
      date: entry.createdAt,
      weight: entry.weight,
      bodyFat: entry.bodyFat,
      muscleMass: entry.muscleMass,
      waistCircumference: entry.waistCircumference,

      systolicBP: entry.systolicBP,
      diastolicBP: entry.diastolicBP,
      restingHeartRate: entry.restingHeartRate,

      fastingSugar: entry.fastingSugar,
      postPrandialSugar: entry.postPrandialSugar,
      hba1c: entry.hba1c,

      creatinine: entry.creatinine,
      urea: entry.urea,
      uricAcid: entry.uricAcid,

      totalCholesterol: entry.totalCholesterol,
      ldl: entry.ldl,
      hdl: entry.hdl,
      triglycerides: entry.triglycerides,

      proteinIntake: entry.proteinIntake,
      creatineIntake: entry.creatineIntake,

      workoutFrequency: entry.workoutFrequency,
      workoutDuration: entry.workoutDuration,
      cardioMinutes: entry.cardioMinutes,
      sleepHours: entry.sleepHours,
      stressLevel: entry.stressLevel,
    }));


    const prompt = `
      You are a fitness and health AI analyzing user progress data.

      Analyze the LAST 5 progress entries and return ONLY valid JSON
      in the exact format below. Do not include explanations or markdown.

      {
        "overview": "short summary",
        "bodyComposition": {
          "weightTrend": "up | down | stable",
          "muscleMassStatus": "improving | stable | declining",
          "bodyFatStatus": "improving | stable | worsening"
        },
        "healthMarkers": {
          "bloodPressure": "normal | elevated | high",
          "heartRate": "good | needs-attention",
          "sugarStatus": "normal | prediabetic | diabetic",
          "cholesterolStatus": "good | borderline | high",
          "kidneyHealth": "normal | needs-attention"
        },
        "lifestyle": {
          "trainingConsistency": "good | average | poor",
          "recoveryQuality": "good | poor",
          "stressLevel": "low | moderate | high"
        },
        "strengths": ["..."],
        "concerns": ["..."],
        "recommendations": ["..."]
      }

      Rules:
      - Align recommendations to this goal: ${user?.fitnessGoal ?? "MAINTENANCE"}
      - Base conclusions ONLY on provided data
      - Keep text concise and actionable
      - Use medical judgment implicitly, do not explain ranges

      Progress data:
      ${JSON.stringify(aiInput)}
      `;


    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    } as any);
    const aiText = result.response.text();


    let insights;
    insights = parseJsonPayload(aiText);
    if (!insights) {
      const retry = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Convert this to valid JSON object only (no markdown, no prose):\n${aiText}`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json" },
      } as any);
      insights = parseJsonPayload(retry.response.text());
    }
    if (!insights) {
      console.error("AI JSON parse failed:", aiText);
      return {
        status: "error",
        message: "AI returned invalid JSON",
      };
    }

    return {
      status: "success",
      insights,
      rawData: progressEntries,
    };
  },
};
