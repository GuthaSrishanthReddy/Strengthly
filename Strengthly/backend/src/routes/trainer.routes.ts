import { Router } from "express";

import {
  getTrainerProfile,
  exploreTrainers,
  getMyClients,
  updateTrainerProfile
} from "../controllers/trainer.controller";

import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

router.get("/", exploreTrainers);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("TRAINER"),
  getTrainerProfile
);

router.get(
  "/clients",
  authMiddleware,
  roleMiddleware("TRAINER"),
  getMyClients
);

router.put(
  "/me",
  authMiddleware,
  roleMiddleware("TRAINER"),
  updateTrainerProfile
);

export default router;
