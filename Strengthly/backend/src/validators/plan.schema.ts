import { z } from "zod";

export const planSchema = z.object({
  goal: z.enum(["FAT_LOSS", "MUSCLE_GAIN", "MAINTENANCE"]),
  calories: z.number().min(800).max(6000),

  protein: z.number().min(0).max(400),
  carbs: z.number().min(0).max(800),
  fats: z.number().min(0).max(300),

  workoutPlan: z.string().min(10),
  meditationPlan: z.string().optional(),
  supplementPlan: z.string().optional()
});
