import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../types/auth.types";
import { FitnessLevel } from "@prisma/client";

/**
 * Defines the order of fitness levels.
 * Used to resolve enum comparison safely (Prisma enums have no < or <=).
 */
const LEVEL_ORDER: FitnessLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "ATHLETE"
];

/**
 * GET /api/rules/activities
 * ?goal=FAT_LOSS&level=BEGINNER
 */
export const getAllowedActivities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { goal, level } = req.query;

    if (!goal || !level) {
      res.status(400).json({
        message: "fitness goal and fitness level are required"
      });
      return;
    }

    const levelIndex = LEVEL_ORDER.indexOf(level as FitnessLevel);

    if (levelIndex === -1) {
      res.status(400).json({
        message: "Invalid fitness level"
      });
      return;
    }

    // Allow all rules whose minLevel <= user level
    const allowedLevels = LEVEL_ORDER.slice(0, levelIndex + 1);

    const rules = await prisma.goalActivityRule.findMany({
      where: {
        goal: goal as any,
        minLevel: {
          in: allowedLevels
        }
      },
      select: {
        activity: true
      }
    });

    res.json(rules);
  } catch (error) {
    next(error);
  }
};
