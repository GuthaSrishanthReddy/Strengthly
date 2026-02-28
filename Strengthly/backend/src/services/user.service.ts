import { prisma } from "../config/db";
import { ActivityType, FitnessGoal, FitnessLevel } from "@prisma/client";

export const userService = {
  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
  },

  async updateMe(userId: string, data: any) {
    const allowed: Record<string, unknown> = {};

    if (typeof data?.name === "string" && data.name.trim().length > 0) {
      allowed.name = data.name.trim();
    }

    if (data?.fitnessGoal && Object.values(FitnessGoal).includes(data.fitnessGoal)) {
      allowed.fitnessGoal = data.fitnessGoal;
    }

    if (data?.fitnessLevel && Object.values(FitnessLevel).includes(data.fitnessLevel)) {
      allowed.fitnessLevel = data.fitnessLevel;
    }

    if (data?.activityType && Object.values(ActivityType).includes(data.activityType)) {
      allowed.activityType = data.activityType;
    }

    if (Object.keys(allowed).length === 0) {
      const err = new Error("No valid fields provided") as Error & {
        statusCode?: number;
      };
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: allowed
    });
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
};
