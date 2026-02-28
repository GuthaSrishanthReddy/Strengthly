import { api } from "./api";

export type PlanWorkout = {
  workoutName: string;
  setsReps: string;
  notes: string;
};

export type PlanItem = {
  day: string;
  focus?: string;
  workouts: PlanWorkout[];
};
export type GeneratePlanResponse = {
  plan: PlanItem[];
  usedFallback: boolean;
  banner?: string;
};

export type DietItem = {
  meal: string;
  items: string;
  notes: string;
};

export type SupplementItem = {
  supplement: string;
  dosage: string;
  notes: string;
};

export const generateAiPlan = () =>
  api<GeneratePlanResponse>("/plans/ai", {
    method: "POST",
  });

export const fetchLatestAiPlan = () =>
  api<PlanItem[]>("/plans/ai/latest", {
    cache: "no-store",
  });

export const generateAiDiet = () =>
  api<DietItem[]>("/diet/ai", {
    method: "POST",
  });

export const fetchLatestAiDiet = () =>
  api<DietItem[]>("/diet/ai/latest", {
    cache: "no-store",
  });

export const generateAiSupplements = () =>
  api<SupplementItem[]>("/supplements/ai", {
    method: "POST",
  });

export const fetchLatestAiSupplements = () =>
  api<SupplementItem[]>("/supplements/ai/latest", {
    cache: "no-store",
  });
