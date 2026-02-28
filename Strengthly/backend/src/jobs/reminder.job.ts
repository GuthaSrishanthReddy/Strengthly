import { prisma } from "../config/db";
import { PROGRESS_RULES } from "../utils/constants";
import { daysBetween } from "../utils/date";

/**
 * Runs daily via cron
 */
export const progressReminderJob = async () => {
  const users = await prisma.user.findMany({
    include: {
      progress: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const now = new Date();

  for (const user of users) {
    const lastProgress = user.progress[0];

    if (!lastProgress) continue;

    const gap = daysBetween(now, lastProgress.createdAt);

    if (gap >= PROGRESS_RULES.MIN_GAP_DAYS) {
      // TODO: hook notification/email service
      console.log(
        `🔔 Reminder: User ${user.email} has not updated progress for ${gap} days`
      );
    }
  }
};
