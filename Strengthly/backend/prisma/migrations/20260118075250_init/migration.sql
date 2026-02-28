-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TRAINER');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('FAT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "complianceScore" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qualifications" TEXT[],
    "expertise" TEXT[],
    "experienceYears" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTrainer" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodyFat" DOUBLE PRECISION NOT NULL,
    "muscleMass" DOUBLE PRECISION,
    "waistCircumference" DOUBLE PRECISION,
    "systolicBP" INTEGER NOT NULL,
    "diastolicBP" INTEGER NOT NULL,
    "restingHeartRate" INTEGER NOT NULL,
    "fastingSugar" DOUBLE PRECISION,
    "postPrandialSugar" DOUBLE PRECISION,
    "hba1c" DOUBLE PRECISION,
    "creatinine" DOUBLE PRECISION NOT NULL,
    "urea" DOUBLE PRECISION,
    "uricAcid" DOUBLE PRECISION,
    "totalCholesterol" DOUBLE PRECISION,
    "ldl" DOUBLE PRECISION,
    "hdl" DOUBLE PRECISION,
    "triglycerides" DOUBLE PRECISION,
    "proteinIntake" DOUBLE PRECISION,
    "creatineIntake" DOUBLE PRECISION,
    "workoutFrequency" INTEGER NOT NULL,
    "workoutDuration" INTEGER NOT NULL,
    "cardioMinutes" INTEGER NOT NULL,
    "sleepHours" DOUBLE PRECISION NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" "Goal" NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fats" INTEGER NOT NULL,
    "workoutPlan" TEXT NOT NULL,
    "meditationPlan" TEXT,
    "supplementPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_userId_key" ON "Trainer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientTrainer_trainerId_userId_key" ON "ClientTrainer"("trainerId", "userId");

-- CreateIndex
CREATE INDEX "Progress_userId_createdAt_idx" ON "Progress"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_userId_key" ON "Plan"("userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTrainer" ADD CONSTRAINT "ClientTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTrainer" ADD CONSTRAINT "ClientTrainer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
