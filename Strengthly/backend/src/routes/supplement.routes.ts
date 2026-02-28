import { Router } from "express";

import {
  generateAiSupplements,
  getLatestAiSupplements,
} from "../controllers/supplement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/ai", authMiddleware, generateAiSupplements);
router.get("/ai/latest", authMiddleware, getLatestAiSupplements);

export default router;
