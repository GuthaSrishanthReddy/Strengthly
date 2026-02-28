import { Router } from "express";

import {
  getProgressHistory,
  createOrUpdateProgress
} from "../controllers/progress.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { progressSchema } from "../validators/progress.schema";

const router = Router();

router.get("/", authMiddleware, getProgressHistory);

router.post("/", authMiddleware, validate(progressSchema), createOrUpdateProgress);

export default router;
