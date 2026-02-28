import { Role } from "@prisma/client";
import { Request } from "express";

/**
 * This is the ONLY user shape that exists in auth.
 * Used in JWT payload, req.user, and controllers.
 */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Alias JwtUser to AuthUser
 * (JWT payload must contain all fields)
 */
export type JwtUser = AuthUser;

/**
 * Express request extended with authenticated user
 */
export interface AuthRequest extends Request {
  user?: AuthUser;
}
