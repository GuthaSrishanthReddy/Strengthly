/*
  Warnings:

  - Added the required column `activity` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `goal` on the `Plan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `activityType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fitnessGoal` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fitnessLevel` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('FAT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_GAIN', 'MAINTENANCE', 'STRENGTH_INCREASE', 'ENDURANCE_INCREASE', 'FLEXIBILITY', 'MOBILITY', 'BALANCE', 'ATHLETIC_PERFORMANCE', 'PHYSICAL_REHABILITATION');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('WEIGHT_TRAINING', 'BODYWEIGHT', 'YOGA', 'PILATES', 'RUNNING', 'WALKING', 'HIKING', 'CYCLING', 'SWIMMING', 'CROSSFIT', 'HIIT', 'DANCE', 'MARTIAL_ARTS', 'SPORTS', 'HOME_WORKOUTS', 'OUTDOOR_TRAINING', 'MIXED_TRAINING');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ATHLETE');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "activity" "ActivityType" NOT NULL,
ADD COLUMN     "level" "FitnessLevel" NOT NULL,
DROP COLUMN "goal",
ADD COLUMN     "goal" "FitnessGoal" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityType" "ActivityType" NOT NULL,
ADD COLUMN     "fitnessGoal" "FitnessGoal" NOT NULL,
ADD COLUMN     "fitnessLevel" "FitnessLevel" NOT NULL;

-- DropEnum
DROP TYPE "Goal";

-- CreateTable
CREATE TABLE "GoalActivityRule" (
    "id" TEXT NOT NULL,
    "goal" "FitnessGoal" NOT NULL,
    "activity" "ActivityType" NOT NULL,
    "minLevel" "FitnessLevel" NOT NULL,

    CONSTRAINT "GoalActivityRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalActivityRule_goal_idx" ON "GoalActivityRule"("goal");

-- CreateIndex
CREATE INDEX "GoalActivityRule_goal_minLevel_idx" ON "GoalActivityRule"("goal", "minLevel");

-- CreateIndex
CREATE UNIQUE INDEX "GoalActivityRule_goal_activity_key" ON "GoalActivityRule"("goal", "activity");
