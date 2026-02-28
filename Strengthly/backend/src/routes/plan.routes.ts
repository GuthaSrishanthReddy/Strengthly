import { Router } from "express";

import {
  generateAiPlan,
  getLatestAiPlan,
  getMyPlan,
  updateMyPlan,
} from "../controllers/plan.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/my", authMiddleware, getMyPlan);
router.put("/my", authMiddleware, updateMyPlan);
router.post("/ai", authMiddleware, generateAiPlan);
router.get("/ai/latest", authMiddleware, getLatestAiPlan);

export default router;
