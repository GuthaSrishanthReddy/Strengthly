import { prisma } from "../config/db";

export const trainerService = {
  async exploreTrainers() {
    return prisma.trainer.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  },

  async getTrainerProfile(trainerId: string) {
    return prisma.trainer.findUnique({
      where: { userId: trainerId }
    });
  },

  async updateTrainerProfile(trainerId: string, expertise: string[]) {
    try {
      return await prisma.trainer.update({
        where: { userId: trainerId },
        data: { expertise }
      });
    } catch (error: any) {
      if (error?.code === "P2025") {
        const err = new Error("Trainer profile not found") as Error & {
          statusCode?: number;
        };
        err.statusCode = 404;
        throw err;
      }
      throw error;
    }
  },

  async getMyClients(trainerUserId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { userId: trainerUserId },
      select: { id: true }
    });

    if (!trainer) {
      const err = new Error("Trainer profile not found") as Error & {
        statusCode?: number;
      };
      err.statusCode = 404;
      throw err;
    }

    return prisma.clientTrainer.findMany({
      where: { trainerId: trainer.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });
  }
};
