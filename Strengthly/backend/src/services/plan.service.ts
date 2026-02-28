import { prisma } from "../config/db";
import { ActivityType, FitnessGoal, FitnessLevel } from "@prisma/client";

export const planService = {
  async getMyPlan(userId: string) {
    return prisma.plan.findFirst({
      where: { userId }
    });
  },

  async updateMyPlan(userId: string, data: any) {
    const allowed: Record<string, unknown> = {};

    if (data?.goal && Object.values(FitnessGoal).includes(data.goal)) {
      allowed.goal = data.goal;
    }

    if (data?.activity && Object.values(ActivityType).includes(data.activity)) {
      allowed.activity = data.activity;
    }

    if (data?.level && Object.values(FitnessLevel).includes(data.level)) {
      allowed.level = data.level;
    }

    const numericFields = ["calories", "protein", "carbs", "fats"] as const;
    for (const field of numericFields) {
      if (typeof data?.[field] === "number" && Number.isFinite(data[field])) {
        allowed[field] = data[field];
      }
    }

    const stringFields = ["workoutPlan", "meditationPlan", "supplementPlan"] as const;
    for (const field of stringFields) {
      if (typeof data?.[field] === "string") {
        allowed[field] = data[field];
      }
    }

    if (Object.keys(allowed).length === 0) {
      const err = new Error("No valid plan fields provided") as Error & {
        statusCode?: number;
      };
      err.statusCode = 400;
      throw err;
    }

    const existing = await prisma.plan.findFirst({
      where: { userId },
      select: { id: true }
    });

    if (existing) {
      return prisma.plan.update({
        where: { userId },
        data: allowed
      });
    }

    const requiredForCreate = [
      "goal",
      "activity",
      "level",
      "calories",
      "protein",
      "carbs",
      "fats",
      "workoutPlan"
    ];

    const missing = requiredForCreate.filter((key) => allowed[key] === undefined);
    if (missing.length > 0) {
      const err = new Error(
        `Missing required plan fields: ${missing.join(", ")}`
      ) as Error & { statusCode?: number };
      err.statusCode = 400;
      throw err;
    }

    return prisma.plan.create({
      data: {
        userId,
        goal: allowed.goal as FitnessGoal,
        activity: allowed.activity as ActivityType,
        level: allowed.level as FitnessLevel,
        calories: allowed.calories as number,
        protein: allowed.protein as number,
        carbs: allowed.carbs as number,
        fats: allowed.fats as number,
        workoutPlan: allowed.workoutPlan as string,
        meditationPlan: allowed.meditationPlan as string | undefined,
        supplementPlan: allowed.supplementPlan as string | undefined,
      }
    });
  }
};
