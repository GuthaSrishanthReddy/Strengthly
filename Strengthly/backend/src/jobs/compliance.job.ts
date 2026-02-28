import { prisma } from "../config/db";
import { daysBetween } from "../utils/date";

/**
 * Runs daily or weekly
 */
export const complianceJob = async () => {
  const users = await prisma.user.findMany({
    include: {
      progress: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  for (const user of users) {
    if (user.progress.length === 0) continue;

    const gaps: number[] = [];

    for (let i = 1; i < user.progress.length; i++) {
      gaps.push(
        daysBetween(
          user.progress[i - 1].createdAt,
          user.progress[i].createdAt
        )
      );
    }

    const avgGap =
      gaps.reduce((sum, g) => sum + g, 0) / (gaps.length || 1);

    const complianceScore = Math.max(0, 100 - avgGap * 5);

    await prisma.user.update({
      where: { id: user.id },
      data: { complianceScore }
    });
  }
};
