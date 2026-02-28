export const ROLES = {
  USER: "USER",
  TRAINER: "TRAINER"
} as const;

export const PROGRESS_RULES = {
  MAX_PER_DAY: 1,
  MIN_GAP_DAYS: 10
};

export const AI_LIMITS = {
  MAX_CONTEXT_ENTRIES: 5
};

export const planTemplate = 
    [
  {
    "day": "Monday",
    "focus": "Push A (Chest Emphasis)",
    "workouts": [
      { "workoutName": "Barbell Bench Press", "setsReps": "3 x 5-8", "notes": "Primary strength movement; leave 1-2 reps in reserve" },
      { "workoutName": "Incline Dumbbell Press", "setsReps": "3 x 8-10", "notes": "Upper chest focus; controlled eccentric" },
      { "workoutName": "Seated Dumbbell Shoulder Press", "setsReps": "3 x 8-10", "notes": "Stable vertical press to limit lower back fatigue" },
      { "workoutName": "Cable Lateral Raises", "setsReps": "3 x 12-15", "notes": "Strict form for medial delts" },
      { "workoutName": "Overhead Cable Tricep Extension", "setsReps": "2-3 x 10-12", "notes": "Long head emphasis" },
      { "workoutName": "Tricep Pushdowns", "setsReps": "2 x 12-15", "notes": "Controlled lockout, no elbow flare" }
    ]
  },
  {
    "day": "Tuesday",
    "focus": "Pull A (Lat Emphasis)",
    "workouts": [
      { "workoutName": "Pull-Ups or Assisted Pull-Ups", "setsReps": "3 x 6-10", "notes": "Full stretch at bottom; controlled reps" },
      { "workoutName": "Chest-Supported Row", "setsReps": "3 x 8-10", "notes": "Mid-back focus without lower back strain" },
      { "workoutName": "Single-Arm Lat Pulldown", "setsReps": "2-3 x 10-12", "notes": "Improve symmetry and mind-muscle connection" },
      { "workoutName": "Face Pulls", "setsReps": "3 x 12-15", "notes": "Rear delts and shoulder health" },
      { "workoutName": "Incline Dumbbell Curls", "setsReps": "2-3 x 10-12", "notes": "Long head stretch" },
      { "workoutName": "Hammer Curls", "setsReps": "2 x 12", "notes": "Brachialis and forearm development" }
    ]
  },
  {
    "day": "Wednesday",
    "focus": "Legs A (Quad Emphasis)",
    "workouts": [
      { "workoutName": "Back Squats", "setsReps": "3 x 5-8", "notes": "Primary quad compound; stop short of failure" },
      { "workoutName": "Bulgarian Split Squats", "setsReps": "3 x 8-10 each leg", "notes": "Unilateral quad and glute focus" },
      { "workoutName": "Leg Press (Feet Lower on Platform)", "setsReps": "2-3 x 10-12", "notes": "Quad bias; controlled depth" },
      { "workoutName": "Seated Leg Curls", "setsReps": "2-3 x 10-12", "notes": "Hamstring balance without excessive volume" },
      { "workoutName": "Standing Calf Raises", "setsReps": "3 x 10-15", "notes": "Pause at stretch and contraction" }
    ]
  },
  {
    "day": "Thursday",
    "focus": "Push B (Shoulder Emphasis)",
    "workouts": [
      { "workoutName": "Standing Barbell Overhead Press", "setsReps": "3 x 5-8", "notes": "Primary vertical press; core tight" },
      { "workoutName": "Flat Dumbbell Press", "setsReps": "3 x 8-10", "notes": "Chest stimulus with less joint stress" },
      { "workoutName": "Machine or Cable Chest Fly", "setsReps": "2-3 x 12-15", "notes": "Stretch-focused hypertrophy work" },
      { "workoutName": "Dumbbell Lateral Raises", "setsReps": "3 x 12-15", "notes": "Controlled tempo, no swinging" },
      { "workoutName": "Cable Upright Rows (Wide Grip)", "setsReps": "2 x 12", "notes": "Light weight; focus on delts, not traps" },
      { "workoutName": "Skull Crushers or Cable Extensions", "setsReps": "2-3 x 10-12", "notes": "Moderate load, protect elbows" }
    ]
  },
  {
    "day": "Friday",
    "focus": "Pull B (Mid-Back & Thickness Emphasis)",
    "workouts": [
      { "workoutName": "Barbell or T-Bar Rows", "setsReps": "3 x 6-8", "notes": "Heavy horizontal pull; neutral spine" },
      { "workoutName": "Neutral Grip Lat Pulldown", "setsReps": "3 x 8-10", "notes": "Controlled stretch and squeeze" },
      { "workoutName": "Seated Cable Rows (Wide Grip)", "setsReps": "2-3 x 10-12", "notes": "Upper back focus" },
      { "workoutName": "Reverse Pec Deck", "setsReps": "3 x 12-15", "notes": "Rear delt isolation" },
      { "workoutName": "EZ-Bar Curls", "setsReps": "2-3 x 8-12", "notes": "Controlled reps; avoid momentum" },
      { "workoutName": "Cable Curls (Short Head Focus)", "setsReps": "2 x 12-15", "notes": "Squeeze at peak contraction" }
    ]
  },
  {
    "day": "Saturday",
    "focus": "Legs B (Posterior Chain Emphasis)",
    "workouts": [
      { "workoutName": "Romanian Deadlifts", "setsReps": "3 x 6-8", "notes": "Hip hinge; slow eccentric for hamstrings" },
      { "workoutName": "Front Squats or Hack Squats", "setsReps": "3 x 8-10", "notes": "Quad focus with upright torso" },
      { "workoutName": "Walking Lunges", "setsReps": "2-3 x 10-12 each leg", "notes": "Glute engagement; controlled steps" },
      { "workoutName": "Lying Leg Curls", "setsReps": "2-3 x 10-12", "notes": "Direct hamstring work" },
      { "workoutName": "Seated Calf Raises", "setsReps": "3 x 12-15", "notes": "Soleus emphasis; full stretch" },
      { "workoutName": "Cable Crunches or Hanging Leg Raises", "setsReps": "2-3 x 12-15", "notes": "Core stability and control" }
    ]
  }
];