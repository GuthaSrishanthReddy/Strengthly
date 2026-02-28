import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { progressService } from "../services/progress.service";
import { aiPlanService } from "../services/aiPlan.service";
import { aiDietService } from "../services/aiDiet.service";
import { aiSupplementService } from "../services/aiSupplement.service";

export const getProgressHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const history = await progressService.getProgressHistory(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const progress = await progressService.createOrUpdateProgress(
      userId,
      req.body
    );

    // Plan generation is required for this endpoint.
    await aiPlanService.generatePlan(userId);

    // Diet and supplements are best-effort and should not block progress updates.
    Promise.allSettled([
      aiDietService.generateDiet(userId),
      aiSupplementService.generateSupplements(userId),
    ]).then((results) => {
      for (const [index, result] of results.entries()) {
        if (result.status === "rejected") {
          const label = index === 0 ? "diet" : "supplements";
          console.error(`Failed to generate AI ${label}`, result.reason);
        }
      }
    });

    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
};
