import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types";
import { trainerService } from "../services/trainer.service";

export const exploreTrainers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const trainers = await trainerService.exploreTrainers();
    res.json(trainers);
  } catch (error) {
    next(error);
  }
};

export const getTrainerProfile = async (
  req: AuthRequest,   // ✅ FIXED
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trainerId = req.user.id;
    const profile = await trainerService.getTrainerProfile(trainerId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const getMyClients = async (
  req: AuthRequest,   // ✅ FIXED
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trainerId = req.user.id;
    const clients = await trainerService.getMyClients(trainerId);
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const updateTrainerProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { expertise } = req.body;
    if (!Array.isArray(expertise)) {
      return res.status(400).json({ message: "Expertise must be an array" });
    }

    const trainerId = req.user.id;
    const updated = await trainerService.updateTrainerProfile(
      trainerId,
      expertise
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
