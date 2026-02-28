import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { embeddingStoreService } from "./embeddingStore.service";
import crypto from "crypto";
import { toVectorLiteral } from "../utils/vector";

export const progressService = {
  async getProgressHistory(userId: string) {
    return prisma.progress.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createOrUpdateProgress(userId: string, data: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingToday = await prisma.progress.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const lastProgress = await prisma.progress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const mergedData = { ...data };
    const baseProgress = existingToday ?? lastProgress;

    if (baseProgress) {
      for (const key of Object.keys(baseProgress)) {
        if (key !== "id" && key !== "userId" && key !== "createdAt" && key !== "updatedAt") {
          if (mergedData[key] === undefined || mergedData[key] === null) {
            mergedData[key] = (baseProgress as any)[key];
          }
        }
      }
    } else {
      mergedData.bodyFat = mergedData.bodyFat ?? 15;
      mergedData.systolicBP = mergedData.systolicBP ?? 120;
      mergedData.diastolicBP = mergedData.diastolicBP ?? 80;
      mergedData.restingHeartRate = mergedData.restingHeartRate ?? 70;
      mergedData.creatinine = mergedData.creatinine ?? 0.9;
      mergedData.workoutFrequency = mergedData.workoutFrequency ?? 3;
      mergedData.workoutDuration = mergedData.workoutDuration ?? 45;
      mergedData.cardioMinutes = mergedData.cardioMinutes ?? 0;
      mergedData.sleepHours = mergedData.sleepHours ?? 7;
      mergedData.stressLevel = mergedData.stressLevel ?? 3;
    }

    // Save progress: update today's entry if it exists, otherwise create a new one.
    const progress = existingToday
      ? await prisma.progress.update({
          where: { id: existingToday.id },
          data: mergedData,
        })
      : await prisma.progress.create({
          data: {
            userId,
            ...mergedData,
          },
        });

    const text = `
Date: ${progress.createdAt}
Weight: ${progress.weight} kg
Body Fat: ${progress.bodyFat} %
Muscle Mass: ${progress.muscleMass ?? "N/A"}
Waist: ${progress.waistCircumference ?? "N/A"} cm
Blood Pressure: ${progress.systolicBP}/${progress.diastolicBP}
Heart Rate: ${progress.restingHeartRate}
Fasting Sugar: ${progress.fastingSugar ?? "N/A"}
Post Prandial Sugar: ${progress.postPrandialSugar ?? "N/A"}
HbA1c: ${progress.hba1c ?? "N/A"}
Cholesterol: LDL ${progress.ldl ?? "N/A"}, HDL ${progress.hdl ?? "N/A"}
Triglycerides: ${progress.triglycerides ?? "N/A"}
Workout Frequency: ${progress.workoutFrequency} times/week
Workout Duration: ${progress.workoutDuration} minutes
Cardio Minutes: ${progress.cardioMinutes}
Sleep: ${progress.sleepHours} hours
Stress Level: ${progress.stressLevel}
Notes: ${progress.notes ?? "None"}
`;

    const hasProgressEmbedding = await embeddingStoreService.hasExactContent(
      userId,
      "progress",
      text
    );
    if (!hasProgressEmbedding) {
      const embedding = await createEmbedding(text);
      const embeddingVector = toVectorLiteral(embedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${userId}, 'progress', ${text}, ${embeddingVector}::vector)
      `;
    }

    const routineText = `
Workout Frequency: ${progress.workoutFrequency} times/week
Workout Duration: ${progress.workoutDuration} minutes/session
Cardio Minutes: ${progress.cardioMinutes}
Sleep Hours: ${progress.sleepHours}
Stress Level: ${progress.stressLevel}
Notes: ${progress.notes ?? "None"}
`;

    const hasRoutineEmbedding = await embeddingStoreService.hasExactContent(
      userId,
      "routine",
      routineText
    );
    if (!hasRoutineEmbedding) {
      const routineEmbedding = await createEmbedding(routineText);
      const routineVector = toVectorLiteral(routineEmbedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${userId}, 'routine', ${routineText}, ${routineVector}::vector)
      `;
    }

    return progress;
  },
};
