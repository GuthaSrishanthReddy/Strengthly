import { Router } from "express";

import {
  getMessages,
  sendMessage
} from "../controllers/message.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { messageSchema } from "../validators/message.schema";

const router = Router();

router.get("/:conversationId", authMiddleware, getMessages);

router.post("/:conversationId", authMiddleware, validate(messageSchema), sendMessage);

export default router;
