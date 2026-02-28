import { Router } from "express";
import { getAllowedActivities } from "../controllers/rules.controller";

const router = Router();

router.get("/activities", getAllowedActivities);

export default router;
