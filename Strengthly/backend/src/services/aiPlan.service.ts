import { prisma } from "../config/db";
import { createEmbedding } from "./embedding.service";
import { model } from "./model.service";
import { embeddingStoreService } from "./embeddingStore.service";
import { planTemplate } from "../utils/constants";
import crypto from "crypto";
import { retrieveContextBySources } from "./rag.retrieve";
import { toVectorLiteral } from "../utils/vector";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type WeekDay = (typeof WEEK_DAYS)[number];
type PlanWorkout = {
  workoutName: string;
  setsReps: string;
  notes: string;
};

type PlanItem = {
  day: WeekDay;
  focus: string;
  workouts: PlanWorkout[];
};
export type PlanGenerationResult = {
  plan: PlanItem[];
  usedFallback: boolean;
  banner?: string;
};

const hasWorkoutRows = (plan: PlanItem[]) =>
  plan.some((item) => (item.workouts?.length ?? 0) > 0);

const emergencyWorkoutDays: Array<{ focus: string; workouts: PlanWorkout[] }> = [
  {
    focus: "Full Body Strength",
    workouts: [
      { workoutName: "Goblet Squat", setsReps: "4 x 8", notes: "Controlled depth, keep core braced." },
      { workoutName: "Romanian Deadlift", setsReps: "4 x 8", notes: "Hinge from hips, neutral spine." },
      { workoutName: "Dumbbell Bench Press", setsReps: "4 x 10", notes: "Smooth tempo, full range." },
      { workoutName: "Seated Cable Row", setsReps: "4 x 10", notes: "Squeeze shoulder blades each rep." },
      { workoutName: "Plank", setsReps: "3 x 45 sec", notes: "Keep hips level, breathe steadily." },
    ],
  },
  {
    focus: "Upper Body Push/Pull",
    workouts: [
      { workoutName: "Incline Dumbbell Press", setsReps: "4 x 8", notes: "Keep shoulder blades retracted." },
      { workoutName: "Lat Pulldown", setsReps: "4 x 10", notes: "Drive elbows down, avoid swinging." },
      { workoutName: "Overhead Press", setsReps: "3 x 8", notes: "Brace core and avoid overextension." },
      { workoutName: "One-Arm Dumbbell Row", setsReps: "3 x 10", notes: "Pull to hip, pause at top." },
      { workoutName: "Lateral Raise", setsReps: "3 x 12", notes: "Light weight, strict control." },
    ],
  },
  {
    focus: "Lower Body + Core",
    workouts: [
      { workoutName: "Back Squat", setsReps: "4 x 6", notes: "Work with stable depth and form." },
      { workoutName: "Walking Lunges", setsReps: "3 x 10 each leg", notes: "Long stride, upright torso." },
      { workoutName: "Leg Press", setsReps: "3 x 12", notes: "Control both eccentric and concentric." },
      { workoutName: "Hamstring Curl", setsReps: "3 x 12", notes: "Pause briefly at contraction." },
      { workoutName: "Hanging Knee Raise", setsReps: "3 x 12", notes: "Avoid momentum, slow reps." },
    ],
  },
  {
    focus: "Hypertrophy Mix",
    workouts: [
      { workoutName: "Flat Bench Press", setsReps: "4 x 8", notes: "Maintain bar path and tight setup." },
      { workoutName: "Chest-Supported Row", setsReps: "4 x 10", notes: "Control pull and lower slowly." },
      { workoutName: "Bulgarian Split Squat", setsReps: "3 x 10 each leg", notes: "Balance and full range." },
      { workoutName: "Cable Face Pull", setsReps: "3 x 15", notes: "Elbows high, squeeze rear delts." },
      { workoutName: "Cable Crunch", setsReps: "3 x 15", notes: "Exhale fully on each rep." },
    ],
  },
  {
    focus: "Strength + Conditioning",
    workouts: [
      { workoutName: "Deadlift", setsReps: "3 x 5", notes: "Prioritize technique over load." },
      { workoutName: "Push-up", setsReps: "4 x 12", notes: "Full lockout and consistent tempo." },
      { workoutName: "Seated Row", setsReps: "4 x 10", notes: "Keep torso stable." },
      { workoutName: "Kettlebell Swing", setsReps: "3 x 15", notes: "Explosive hips, neutral spine." },
      { workoutName: "Bike Intervals", setsReps: "8 x 30s hard / 60s easy", notes: "Maintain repeatable effort." },
    ],
  },
];

const buildEmergencyPlan = (workoutFrequency: number): PlanItem[] => {
  const safeFrequency = Math.min(6, Math.max(2, Math.round(workoutFrequency)));
  const startOffset = Math.floor(Math.random() * emergencyWorkoutDays.length);
  return WEEK_DAYS.map((day, idx) => {
    if (idx < safeFrequency) {
      const template = emergencyWorkoutDays[(idx + startOffset) % emergencyWorkoutDays.length];
      return {
        day,
        focus: template.focus,
        workouts: template.workouts,
      };
    }
    return {
      day,
      focus: "Rest",
      workouts: [],
    };
  });
};

const normalizeDay = (value: unknown, index: number): WeekDay => {
  const fallback = WEEK_DAYS[index % WEEK_DAYS.length];
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().toLowerCase();
  const matched = WEEK_DAYS.find((d) => d.toLowerCase() === cleaned);
  return matched ?? fallback;
};

const generatePlanContent = async (prompt: string) => {
  const result = await model.generateContent(prompt);
  return result;
};

const groupPlanByDay = (
  flatItems: Array<{
    day: WeekDay;
    focus: string;
    workoutName: string;
    setsReps: string;
    notes: string;
  }>
): PlanItem[] => {
  const grouped = new Map<WeekDay, { focus: string; workouts: PlanWorkout[] }>();

  for (const item of flatItems) {
    if (!grouped.has(item.day)) {
      grouped.set(item.day, { focus: item.focus, workouts: [] });
    }
    const existing = grouped.get(item.day)!;
    if (!existing.focus && item.focus) {
      existing.focus = item.focus;
    }
    existing.workouts.push({
      workoutName: item.workoutName,
      setsReps: item.setsReps,
      notes: item.notes,
    });
  }

  return WEEK_DAYS.filter((day) => grouped.has(day)).map((day) => ({
    day,
    focus: grouped.get(day)!.focus || "General",
    workouts: grouped.get(day)!.workouts,
  }));
};

export const aiPlanService = {
  parsePlanItems(raw: string) {
    const normalize = (text: string) =>
      text
        .replace(/[“”]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/[\u201C\u201D]/g, "\"")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/^\s*json\s*/i, "")
        .trim();

    const extractJson = (text: string) => {
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const unfenced = fenceMatch ? fenceMatch[1] : text;
      const cleaned = normalize(
        unfenced.replace(/^```(?:json)?/i, "").replace(/```$/i, "")
      );
      const firstArray = cleaned.indexOf("[");
      const firstObj = cleaned.indexOf("{");
      const start =
        firstArray === -1
          ? firstObj
          : firstObj === -1
          ? firstArray
          : Math.min(firstArray, firstObj);
      if (start === -1) return cleaned;
      const lastArray = cleaned.lastIndexOf("]");
      const lastObj = cleaned.lastIndexOf("}");
      const end =
        lastArray === -1
          ? lastObj
          : lastObj === -1
          ? lastArray
          : Math.max(lastArray, lastObj);
      return end >= start
        ? cleaned.slice(start, end + 1).trim()
        : cleaned.slice(start).trim();
    };

    const jsonText = extractJson(raw);
    let planItems: Array<{
      day?: string;
      focus?: string;
      workouts?: Array<{
        workoutName?: string;
        workout?: string;
        setsReps?: string;
        sets?: string;
        notes?: string;
      }>;
      workoutName?: string;
      workout?: string;
      setsReps?: string;
      sets?: string;
      notes?: string;
    }> = [];
    try {
      const parsed = JSON.parse(jsonText);
      planItems = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Attempt simple repair: close missing brackets/braces
      let repaired = jsonText;
      if (repaired.startsWith("[") && !repaired.endsWith("]")) repaired += "]";
      if (repaired.startsWith("{") && !repaired.endsWith("}")) repaired += "}";

      try {
        const parsed = JSON.parse(repaired);
        planItems = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Last-resort regex extraction
        const cleaned = normalize(raw);
        const items: Array<{
          day?: string;
          focus?: string;
          workoutName: string;
          setsReps: string;
          notes: string;
        }> = [];
        const itemRegex =
          /(?:"day"\s*:\s*"([^"]*)")?[\s\S]*?"(?:workoutName|workout)"\s*:\s*"([^"]+)"[\s\S]*?"(?:setsReps|sets x reps|sets_reps|sets)"\s*:\s*"([^"]*)"[\s\S]*?"notes"\s*:\s*"([^"]*)"/gi;
        let match: RegExpExecArray | null;
        while ((match = itemRegex.exec(cleaned)) !== null) {
          items.push({
            day: match[1],
            workoutName: match[2],
            setsReps: match[3],
            notes: match[4],
          });
        }
        planItems = items;
      }
    }

    const grouped = new Map<WeekDay, { focus: string; workouts: PlanWorkout[] }>();

    for (let idx = 0; idx < planItems.length; idx += 1) {
      const item = planItems[idx];
      const day = normalizeDay(item.day, idx);
      const focus = String(item.focus ?? "").trim();

      if (!grouped.has(day)) {
        grouped.set(day, { focus: focus || "General", workouts: [] });
      } else if (focus) {
        grouped.get(day)!.focus = focus;
      }

      const dayEntry = grouped.get(day)!;
      if (Array.isArray(item.workouts)) {
        for (const workout of item.workouts) {
          const workoutName = String(workout.workoutName ?? workout.workout ?? "").trim();
          if (!workoutName) continue;
          dayEntry.workouts.push({
            workoutName,
            setsReps: String(workout.setsReps ?? workout.sets ?? "").trim(),
            notes: String(workout.notes ?? "").trim(),
          });
        }
      } else {
        const workoutName = String(item.workoutName ?? item.workout ?? "").trim();
        if (workoutName) {
          dayEntry.workouts.push({
            workoutName,
            setsReps: String(item.setsReps ?? item.sets ?? "").trim(),
            notes: String(item.notes ?? "").trim(),
          });
        }
      }
    }

    return WEEK_DAYS.filter((day) => grouped.has(day)).map((day) => ({
      day,
      focus: grouped.get(day)!.focus || "General",
      workouts: grouped.get(day)!.workouts,
    }));
  },

  async getLatestPlan(userId: string) {
    const latest = await embeddingStoreService.getLatestBySource(userId, "plan");

    if (!latest) return [];
    return aiPlanService.parsePlanItems(latest.content);
  },

  async generatePlan(userId: string): Promise<PlanGenerationResult> {
    const variationSeed = crypto.randomUUID();
    const retrievedContext = await retrieveContextBySources(
      userId,
      "Generate an optimal weekly workout plan from latest progress and routine data.",
      ["progress", "routine"],
      5,
      1800
    );


    const prompt = `
You are an elite strength & conditioning coach and certified personal trainer.

Your task is to generate a structured, professional, evidence-based workout program using the user's progress history and routine history.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON.
- The JSON MUST strictly follow this exact structure:
${planTemplate}
- Do NOT include explanations, markdown, or extra text.
- Do NOT add fields that are not defined in the template.
- Use the key name "focus" exactly (all lowercase). Never use "Focus".
- Ensure proper JSON formatting (no trailing commas, valid quotes).

PROGRAM DESIGN REQUIREMENTS:
1. Use the user's progress history and routine history to:
   - Maintain progressive overload where appropriate.
   - Avoid repeating ineffective patterns.
   - Build on demonstrated strengths.
   - Address potential weak points.
   -know their workout frequency per week and strictly design the program accordingly
   -The workout frequency number of days must be assigned with gym workouts and the rest of the days(exceeding workout frequency number of days) of the week should be left empty (no workouts assigned) and focus must be Rest.
   - Generate a balanced beginner full-body program.
   - Include exactly 5 exercises per workout day.
3. Base the program strictly on the user's workout frequency per week.
4. Prioritize:
   - Scientifically proven, well-known exercise variations.
   - Optimal exercise sequencing (compound → secondary → accessory).
   - Balanced weekly volume per muscle group.
5. Every exercise must include:
   - Sets
   - Reps (or rep range)
   - Rest time
   - Clear coaching notes (form cues, intensity guidance, RPE or progression tips).
6. Ensure:
   - Logical muscle group splits.
   - Proper recovery between sessions.
   - Realistic weekly training volume.
   - Professional programming standards (no random exercise selection).

Progress history:
${retrievedContext || "none"}

Generate the most optimal structured workout plan possible based on the above information and the user's weekly training frequency.
Variation seed: ${variationSeed}
`;

    let planItems: PlanItem[] = [];
    try {
      const result = await generatePlanContent(prompt);
      const raw = result.response.text().trim();
      console.log("RAW_PLAN_RESPONSE:", raw);
      planItems = aiPlanService.parsePlanItems(raw);
    } catch (error) {
      console.error("Plan generation model call failed", error);
    }

    if (planItems.length > 0 && !hasWorkoutRows(planItems)) {
      const retryPrompt = `
Return ONLY valid JSON array using this exact structure:
${planTemplate}

Rules:
- Keep key name "focus" lowercase.
- For each non-Rest day, include exactly 5 workouts.
- Each workout must have workoutName, setsReps, notes.
- Rest days must have focus "Rest" and workouts: [].
- No markdown and no extra text.

User context:
${retrievedContext || "none"}
`;
      try {
        const retry = await generatePlanContent(retryPrompt);
        const retryRaw = retry.response.text().trim();
        console.log("RAW_PLAN_RESPONSE_RETRY_EMPTY_WORKOUTS:", retryRaw);
        const retryItems = aiPlanService.parsePlanItems(retryRaw);
        if (hasWorkoutRows(retryItems)) {
          planItems = retryItems;
        }
      } catch (error) {
        console.error("Plan generation empty-workout retry failed", error);
      }
    }

    if (planItems.length === 0 || !hasWorkoutRows(planItems)) {
      // Fallback: if generation failed, return previous available plan without storing anything new.
      const previousPlan = await prisma.plan.findUnique({
        where: { userId },
        select: { workoutPlan: true },
      });

      const previousFromPlanTable = previousPlan?.workoutPlan
        ? aiPlanService.parsePlanItems(previousPlan.workoutPlan)
        : [];

      const latestEmbedding = await embeddingStoreService.getLatestBySource(userId, "plan");
      const previousFromEmbedding = latestEmbedding
        ? aiPlanService.parsePlanItems(latestEmbedding.content)
        : [];

      // Do not return previous stored plans here because they can lock the user into identical output.
      // Keep parsing above for optional diagnostics and future fallback chaining.
      void previousFromPlanTable;
      void previousFromEmbedding;

      const latestProgress = await prisma.progress.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { workoutFrequency: true },
      });
      const emergencyPlan = buildEmergencyPlan(latestProgress?.workoutFrequency ?? 3);
      const emergencyText = JSON.stringify(emergencyPlan);

      const userForEmergency = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          fitnessGoal: true,
          activityType: true,
          fitnessLevel: true,
        },
      });

      if (userForEmergency) {
        const existingPlan = await prisma.plan.findUnique({
          where: { userId },
          select: {
            calories: true,
            protein: true,
            carbs: true,
            fats: true,
          },
        });

        const defaultMacrosByGoal = {
          FAT_LOSS: { calories: 1800, protein: 140, carbs: 170, fats: 60 },
          WEIGHT_GAIN: { calories: 2600, protein: 160, carbs: 320, fats: 75 },
          MUSCLE_GAIN: { calories: 2400, protein: 165, carbs: 280, fats: 70 },
          MAINTENANCE: { calories: 2100, protein: 140, carbs: 220, fats: 70 },
          STRENGTH_INCREASE: { calories: 2400, protein: 160, carbs: 260, fats: 70 },
          ENDURANCE_INCREASE: { calories: 2300, protein: 140, carbs: 290, fats: 65 },
          FLEXIBILITY: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
          MOBILITY: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
          BALANCE: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
          ATHLETIC_PERFORMANCE: { calories: 2600, protein: 170, carbs: 320, fats: 75 },
          PHYSICAL_REHABILITATION: { calories: 2100, protein: 145, carbs: 220, fats: 70 },
        } as const;

        const fallbackMacros = defaultMacrosByGoal[userForEmergency.fitnessGoal];
        const calories = existingPlan?.calories ?? fallbackMacros.calories;
        const protein = existingPlan?.protein ?? fallbackMacros.protein;
        const carbs = existingPlan?.carbs ?? fallbackMacros.carbs;
        const fats = existingPlan?.fats ?? fallbackMacros.fats;

        await prisma.plan.upsert({
          where: { userId },
          update: {
            goal: userForEmergency.fitnessGoal,
            activity: userForEmergency.activityType,
            level: userForEmergency.fitnessLevel,
            workoutPlan: emergencyText,
          },
          create: {
            userId,
            goal: userForEmergency.fitnessGoal,
            activity: userForEmergency.activityType,
            level: userForEmergency.fitnessLevel,
            calories,
            protein,
            carbs,
            fats,
            workoutPlan: emergencyText,
          },
        });
      }

      const hasEmergencyEmbedding = await embeddingStoreService.hasExactContent(
        userId,
        "plan",
        emergencyText
      );
      if (!hasEmergencyEmbedding) {
        const planEmbedding = await createEmbedding(emergencyText);
        const planVector = toVectorLiteral(planEmbedding);
        await prisma.$executeRaw`
          INSERT INTO "DocumentEmbedding"
            (id, "userId", source, content, embedding)
          VALUES
            (${crypto.randomUUID()}, ${userId}, 'plan', ${emergencyText}, ${planVector}::vector)
        `;
      }

      console.log("FINAL_PLAN_ITEMS (Emergency Fallback):", JSON.stringify(emergencyPlan, null, 2));
      return {
        plan: emergencyPlan,
        usedFallback: true,
      };
    }

    console.log("FINAL_PLAN_ITEMS:", JSON.stringify(planItems, null, 2));
    const planText = JSON.stringify(planItems);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fitnessGoal: true,
        activityType: true,
        fitnessLevel: true,
      },
    });

    if (!user) {
      const err = new Error("User not found") as Error & { statusCode?: number };
      err.statusCode = 404;
      throw err;
    }

    const existingPlan = await prisma.plan.findUnique({
      where: { userId },
      select: {
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
      },
    });

    const defaultMacrosByGoal = {
      FAT_LOSS: { calories: 1800, protein: 140, carbs: 170, fats: 60 },
      WEIGHT_GAIN: { calories: 2600, protein: 160, carbs: 320, fats: 75 },
      MUSCLE_GAIN: { calories: 2400, protein: 165, carbs: 280, fats: 70 },
      MAINTENANCE: { calories: 2100, protein: 140, carbs: 220, fats: 70 },
      STRENGTH_INCREASE: { calories: 2400, protein: 160, carbs: 260, fats: 70 },
      ENDURANCE_INCREASE: { calories: 2300, protein: 140, carbs: 290, fats: 65 },
      FLEXIBILITY: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
      MOBILITY: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
      BALANCE: { calories: 2000, protein: 125, carbs: 220, fats: 65 },
      ATHLETIC_PERFORMANCE: { calories: 2600, protein: 170, carbs: 320, fats: 75 },
      PHYSICAL_REHABILITATION: { calories: 2100, protein: 145, carbs: 220, fats: 70 },
    } as const;

    const fallbackMacros = defaultMacrosByGoal[user.fitnessGoal];
    const calories = existingPlan?.calories ?? fallbackMacros.calories;
    const protein = existingPlan?.protein ?? fallbackMacros.protein;
    const carbs = existingPlan?.carbs ?? fallbackMacros.carbs;
    const fats = existingPlan?.fats ?? fallbackMacros.fats;

    await prisma.plan.upsert({
      where: { userId },
      update: {
        goal: user.fitnessGoal,
        activity: user.activityType,
        level: user.fitnessLevel,
        workoutPlan: planText,
      },
      create: {
        userId,
        goal: user.fitnessGoal,
        activity: user.activityType,
        level: user.fitnessLevel,
        calories,
        protein,
        carbs,
        fats,
        workoutPlan: planText,
      },
    });

    const hasPlanEmbedding = await embeddingStoreService.hasExactContent(
      userId,
      "plan",
      planText
    );
    if (!hasPlanEmbedding) {
      const planEmbedding = await createEmbedding(planText);
      const planVector = toVectorLiteral(planEmbedding);
      await prisma.$executeRaw`
        INSERT INTO "DocumentEmbedding"
          (id, "userId", source, content, embedding)
        VALUES
          (${crypto.randomUUID()}, ${userId}, 'plan', ${planText}, ${planVector}::vector)
      `;
    }

    return {
      plan: planItems,
      usedFallback: false,
    };
  },
};
