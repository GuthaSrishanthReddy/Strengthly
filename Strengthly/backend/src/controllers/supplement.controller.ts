import { Response, NextFunction } from "express";
import { aiSupplementService } from "../services/aiSupplement.service";
import { AuthRequest } from "../types/auth.types";

export const generateAiSupplements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const items = await aiSupplementService.generateSupplements(userId);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getLatestAiSupplements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const items = await aiSupplementService.getLatestSupplements(userId);
    res.json(items);
  } catch (error) {
    next(error);
  }
};
