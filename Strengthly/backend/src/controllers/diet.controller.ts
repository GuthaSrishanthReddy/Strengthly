import { Response, NextFunction } from "express";
import { aiDietService } from "../services/aiDiet.service";
import { AuthRequest } from "../types/auth.types";

export const generateAiDiet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const dietItems = await aiDietService.generateDiet(userId);
    res.json(dietItems);
  } catch (error) {
    next(error);
  }
};

export const getLatestAiDiet = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const dietItems = await aiDietService.getLatestDiet(userId);
    res.json(dietItems);
  } catch (error) {
    next(error);
  }
};
