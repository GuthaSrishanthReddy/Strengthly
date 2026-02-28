import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import trainerRoutes from "./trainer.routes";
import progressRoutes from "./progress.routes";
import planRoutes from "./plan.routes";
import dietRoutes from "./diet.routes";
import supplementRoutes from "./supplement.routes";
import messageRoutes from "./message.routes";
import aiRoutes from "./ai.routes";
import rulesRoutes from "./rules.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/trainers", trainerRoutes);
router.use("/progress", progressRoutes);
router.use("/plans", planRoutes);
router.use("/diet", dietRoutes);
router.use("/supplements", supplementRoutes);
router.use("/messages", messageRoutes);
router.use("/ai", aiRoutes);
router.use("/rules", rulesRoutes);

export default router;
