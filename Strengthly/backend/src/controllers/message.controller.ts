import { Response, NextFunction } from "express";
import { messageService } from "../services/message.service";
import { AuthRequest } from "../types/auth.types";

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await messageService.getMessages(
      conversationId,
      userId
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { conversationId } = req.params;
    const userId = req.user.id;

    const message = await messageService.sendMessage(
      conversationId,
      userId,
      req.body
    );

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
