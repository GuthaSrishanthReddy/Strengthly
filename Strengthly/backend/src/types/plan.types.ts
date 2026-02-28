export interface PlanInput {
  goal: "FAT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE";
  calories: number;

  protein: number;
  carbs: number;
  fats: number;

  workoutPlan: string;
  meditationPlan?: string;
  supplementPlan?: string;
}
