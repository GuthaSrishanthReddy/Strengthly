import { Router } from "express";


import {
  chatWithAI,
  analyzeProgress,
  chatWithChatbot,
  endChatSession
} from "../controllers/ai.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  ragChatSchema,
  chatbotChatSchema,
  endChatSessionSchema,
} from "../validators/ai.schema";

const router = Router();

router.post("/chat", authMiddleware, validate(ragChatSchema), chatWithAI);
router.post("/chatbot", authMiddleware, validate(chatbotChatSchema), chatWithChatbot);
router.post("/chatbot/end", authMiddleware, validate(endChatSessionSchema), endChatSession);

router.post("/analyze-progress", authMiddleware, analyzeProgress);

export default router;
