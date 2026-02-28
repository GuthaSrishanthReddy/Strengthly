import { Router } from "express";

import { generateAiDiet, getLatestAiDiet } from "../controllers/diet.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/ai", authMiddleware, generateAiDiet);
router.get("/ai/latest", authMiddleware, getLatestAiDiet);

export default router;
