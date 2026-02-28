import { api } from "./api";
import type { AuthResponse } from "../types/auth.types";

const trimEmail = (email: string) => email.trim();

export const loginApi = (email: string, password: string) =>
  api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: trimEmail(email), password }),
  });

export const registerApi = (data: {
  name: string;
  email: string;
  password: string;
  role: "USER" | "TRAINER";
}) =>
  api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      email: trimEmail(data.email).toLowerCase(),
    }),
  });
