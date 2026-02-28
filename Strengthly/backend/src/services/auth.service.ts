import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/db";
import { env } from "../config/env";
import { FitnessGoal, FitnessLevel, ActivityType } from "@prisma/client";

export const authService = {
  async register(data: any) {
    const { email, password, role, name } = data;

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      const err = new Error("User already exists") as Error & {
        statusCode?: number;
      };
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password:hashedPassword,
        role,
        name,

        fitnessGoal: FitnessGoal.MAINTENANCE,
        fitnessLevel: FitnessLevel.BEGINNER,
        activityType: ActivityType.WALKING
      }
    });


    if (role === "TRAINER") {
      await prisma.trainer.create({
        data: {
          userId: user.id,
          qualifications: [],
          expertise: [],
          experienceYears: 0
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _password, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const err = new Error("Invalid credentials") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error("Invalid credentials") as Error & {
        statusCode?: number;
      };
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _password, ...safeUser } = user;
    return { token, user: safeUser };
  }
};

