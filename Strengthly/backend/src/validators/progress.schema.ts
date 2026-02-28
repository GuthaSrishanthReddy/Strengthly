import { z } from "zod";

export const progressSchema = z.object({
  // Body metrics
  weight: z.number().min(20).max(300),
  bodyFat: z.number().min(2).max(70).optional(),
  muscleMass: z.number().min(5).max(80).optional(),
  waistCircumference: z.number().min(40).max(200).optional(),

  // Vitals
  systolicBP: z.number().min(70).max(250).optional(),
  diastolicBP: z.number().min(40).max(150).optional(),
  restingHeartRate: z.number().min(30).max(200).optional(),

  // Sugar
  fastingSugar: z.number().min(50).max(500).optional(),
  postPrandialSugar: z.number().min(50).max(500).optional(),
  hba1c: z.number().min(3).max(15).optional(),

  // Kidney
  creatinine: z.number().min(0.2).max(20).optional(),
  urea: z.number().min(5).max(200).optional(),
  uricAcid: z.number().min(1).max(20).optional(),

  // Lipids
  totalCholesterol: z.number().min(50).max(600).optional(),
  ldl: z.number().min(10).max(400).optional(),
  hdl: z.number().min(10).max(200).optional(),
  triglycerides: z.number().min(20).max(1000).optional(),

  // Supplements
  proteinIntake: z.number().min(0).max(400).optional(),
  creatineIntake: z.number().min(0).max(20).optional(),

  // Lifestyle
  workoutFrequency: z.number().min(0).max(14).optional(),
  workoutDuration: z.number().min(0).max(300).optional(),
  cardioMinutes: z.number().min(0).max(1000).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  stressLevel: z.number().min(1).max(5).optional(),

  // Notes
  notes: z.string().max(1000).optional()
});
