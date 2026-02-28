export interface ProgressInput {
  // Body metrics
  weight: number;
  bodyFat: number;
  muscleMass?: number;
  waistCircumference?: number;

  // Vitals
  systolicBP: number;
  diastolicBP: number;
  restingHeartRate: number;

  // Sugar
  fastingSugar?: number;
  postPrandialSugar?: number;
  hba1c?: number;

  // Kidney
  creatinine: number;
  urea?: number;
  uricAcid?: number;

  // Lipids
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;

  // Supplements
  proteinIntake?: number;
  creatineIntake?: number;

  // Lifestyle
  workoutFrequency: number;
  workoutDuration: number;
  cardioMinutes: number;
  sleepHours: number;
  stressLevel: number;

  // Notes
  notes?: string;
}
