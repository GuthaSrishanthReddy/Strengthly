export interface ProgressInput {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  waistCircumference?: number;
  systolicBP?: number;
  diastolicBP?: number;
  restingHeartRate?: number;
  fastingSugar?: number;
  postPrandialSugar?: number;
  hba1c?: number;
  creatinine?: number;
  urea?: number;
  uricAcid?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  proteinIntake?: number;
  creatineIntake?: number;
  workoutFrequency?: number;
  workoutDuration?: number;
  cardioMinutes?: number;
  sleepHours?: number;
  stressLevel?: number;
  notes?: string;
}

export interface ProgressRecord extends ProgressInput {
  id: string;
  userId: string;
  createdAt: string;
}
