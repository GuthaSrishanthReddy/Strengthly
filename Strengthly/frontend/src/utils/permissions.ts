import type { UserRole } from "../types/auth.types";

export const canAccessUser = (role: UserRole) => role === "USER";
export const canAccessTrainer = (role: UserRole) => role === "TRAINER";
