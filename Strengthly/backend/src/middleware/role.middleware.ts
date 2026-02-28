import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { Role } from "@prisma/client";

export const roleMiddleware =
  (role: Role) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
