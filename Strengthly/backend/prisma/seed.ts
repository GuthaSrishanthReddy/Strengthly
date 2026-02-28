import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trainerUser = await prisma.user.create({
    data: {
      name: "Demo Trainer",
      email: "trainer@test.com",
      password: "hashedpassword",
      role: "TRAINER",
      fitnessGoal: "MAINTENANCE",
      fitnessLevel: "BEGINNER",
      activityType: "WALKING"
    }
  });

  await prisma.trainer.create({
    data: {
      userId: trainerUser.id,
      qualifications: ["ACE", "NASM"],
      expertise: ["Muscle Gain", "Fat Loss"],
      experienceYears: 5
    }
  });

  console.log("Seed data created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
