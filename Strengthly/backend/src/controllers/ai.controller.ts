import { Response, NextFunction } from "express";
import { ragService } from "../services/rag.service";
import { chatbotService } from "../services/chatbot.service";
import { insightService } from "../services/insight.service";
import { AuthRequest } from "../types/auth.types";

export const chatWithAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const answer = await ragService.chat(userId, req.body.message);
    res.json({ answer });
  } catch (error) {
    next(error);
  }
};

export const analyzeProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const insight = await insightService.analyzeProgress(userId);
    res.json(insight);
  } catch (error) {
    next(error);
  }
};

export const chatWithChatbot = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const response = await chatbotService.chat(
      userId,
      req.body.sessionId,
      req.body.message
    );
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const endChatSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    await chatbotService.endSession(userId, req.body.sessionId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};
