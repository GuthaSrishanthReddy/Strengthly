export const SAFE_RANGES = {
  bloodPressure: {
    systolic: { min: 90, max: 120 },
    diastolic: { min: 60, max: 80 }
  },
  sugar: {
    fasting: { min: 70, max: 100 },
    postPrandial: { min: 70, max: 140 },
    hba1c: { min: 4, max: 5.6 }
  },
  creatinine: {
    min: 0.7,
    max: 1.3
  },
  cholesterol: {
    total: { max: 200 },
    ldl: { max: 100 },
    hdl: { min: 40 },
    triglycerides: { max: 150 }
  }
};
