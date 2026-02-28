import { api } from "./api";
import type { Plan } from "../types/plan.types";

export const fetchPlan = () =>
{
  return api<Plan>("/plans/my");
}
  