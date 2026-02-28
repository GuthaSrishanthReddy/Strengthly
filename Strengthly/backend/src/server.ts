import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/db";


const PORT = env.PORT;

/* -------------------- Start Server -------------------- */

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* -------------------- Graceful Shutdown -------------------- */

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("🛑 Server closed & Prisma disconnected");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
