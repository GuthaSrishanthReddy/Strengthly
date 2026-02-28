import { Request, Response, NextFunction } from "express";
import { planService } from "../services/plan.service";
import { aiPlanService } from "../services/aiPlan.service";
import { AuthRequest } from "../types/auth.types";

export const getMyPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const plan = await planService.getMyPlan(userId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const updateMyPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const plan = await planService.updateMyPlan(userId, req.body);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const generateAiPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const result = await aiPlanService.generatePlan(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getLatestAiPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const planItems = await aiPlanService.getLatestPlan(userId);
    res.json(planItems);
  } catch (error) {
    next(error);
  }
};
