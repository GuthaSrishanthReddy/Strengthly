import json
import os
import random
import re
import time
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from joblib import dump, load
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=_ENV_PATH, override=False)

HOST = os.getenv("ML_HOST", "0.0.0.0")
PORT = int(os.getenv("ML_PORT", "8000"))
EMBED_DIMS = int(os.getenv("ML_EMBED_DIMS", "384"))
MODEL_DIR = os.getenv("ML_MODEL_DIR", "artifacts")
MODEL_FILE = os.path.join(MODEL_DIR, "trained_plan_diet_model.joblib")
K_NEIGHBORS = int(os.getenv("ML_K_NEIGHBORS", "7"))
MIN_TRAIN_ROWS = int(os.getenv("ML_MIN_TRAIN_ROWS", "15"))
DB_URL = os.getenv("ML_DATABASE_URL") or os.getenv("DATABASE_URL") or ""

WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


class GenerationConfig(BaseModel):
    responseMimeType: Optional[str] = None
    maxOutputTokens: Optional[int] = None
    temperature: Optional[float] = None
    topP: Optional[float] = None


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    generationConfig: Optional[GenerationConfig] = None


class GenerateResponse(BaseModel):
    text: str


class EmbedRequest(BaseModel):
    text: str = Field(..., min_length=1)


class EmbedResponse(BaseModel):
    embedding: List[float]


class TrainResponse(BaseModel):
    success: bool
    rows: int
    message: str
    trainedAt: str


class ResetResponse(BaseModel):
    success: bool
    message: str
    modelFileRemoved: bool
    retrained: bool
    rows: int
    trainedAt: str


@dataclass
class TrainRow:
    user_id: str
    features: List[float]
    plan: List[Dict[str, Any]]
    diet: List[Dict[str, Any]]


class PlannerDietModel:
    def __init__(self) -> None:
        self.vectorizer = HashingVectorizer(
            n_features=EMBED_DIMS,
            alternate_sign=False,
            norm="l2",
            lowercase=True,
        )
        self.scaler: Optional[StandardScaler] = None
        self.nn: Optional[NearestNeighbors] = None
        self.feature_matrix: Optional[np.ndarray] = None
        self.rows: List[TrainRow] = []
        self.last_trained_at = ""
        self.load_or_train()

    def _connect(self):
        if not DB_URL:
            raise RuntimeError("ML_DATABASE_URL (or DATABASE_URL) is not configured")
        return psycopg2.connect(DB_URL)

    @staticmethod
    def _to_float(value: Any, default: float = 0.0) -> float:
        if value is None:
            return default
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def _enum_maps(self, conn) -> Tuple[Dict[str, int], Dict[str, int], Dict[str, int]]:
        with conn.cursor() as cur:
            cur.execute("SELECT unnest(enum_range(NULL::\"FitnessGoal\"))::text")
            goals = [r[0] for r in cur.fetchall()]
            cur.execute("SELECT unnest(enum_range(NULL::\"FitnessLevel\"))::text")
            levels = [r[0] for r in cur.fetchall()]
            cur.execute("SELECT unnest(enum_range(NULL::\"ActivityType\"))::text")
            activities = [r[0] for r in cur.fetchall()]
        return (
            {v: i for i, v in enumerate(goals)},
            {v: i for i, v in enumerate(levels)},
            {v: i for i, v in enumerate(activities)},
        )

    @staticmethod
    def _safe_json_loads(raw: Any, fallback: Any) -> Any:
        if raw is None:
            return fallback
        if isinstance(raw, (list, dict)):
            return raw
        try:
            parsed = json.loads(str(raw))
            return parsed
        except Exception:
            return fallback

    @staticmethod
    def _normalize_plan(plan_raw: Any) -> List[Dict[str, Any]]:
        parsed = PlannerDietModel._safe_json_loads(plan_raw, [])
        if not isinstance(parsed, list):
            return []
        output: List[Dict[str, Any]] = []
        for day_item in parsed:
            if not isinstance(day_item, dict):
                continue
            day = str(day_item.get("day", "")).strip()
            focus = str(day_item.get("focus", "General")).strip() or "General"
            workouts_raw = day_item.get("workouts", [])
            workouts: List[Dict[str, str]] = []
            if isinstance(workouts_raw, list):
                for w in workouts_raw:
                    if not isinstance(w, dict):
                        continue
                    name = str(w.get("workoutName", "")).strip()
                    if not name:
                        continue
                    workouts.append(
                        {
                            "workoutName": name,
                            "setsReps": str(w.get("setsReps", "")).strip(),
                            "notes": str(w.get("notes", "")).strip(),
                        }
                    )
            if day:
                output.append({"day": day, "focus": focus, "workouts": workouts})
        return output

    @staticmethod
    def _normalize_diet(diet_raw: Any) -> List[Dict[str, str]]:
        parsed = PlannerDietModel._safe_json_loads(diet_raw, [])
        if not isinstance(parsed, list):
            return []
        out: List[Dict[str, str]] = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            meal = str(item.get("meal", "")).strip()
            foods = str(item.get("items", "")).strip()
            notes = str(item.get("notes", "")).strip()
            if meal:
                out.append({"meal": meal, "items": foods, "notes": notes})
        return out

    @staticmethod
    def _extract_num(text: str, patterns: List[str], default: float) -> float:
        for pat in patterns:
            m = re.search(pat, text, flags=re.IGNORECASE)
            if m:
                try:
                    return float(m.group(1))
                except (TypeError, ValueError):
                    continue
        return default

    def _prompt_features(
        self,
        prompt: str,
        goal_map: Dict[str, int],
        level_map: Dict[str, int],
        activity_map: Dict[str, int],
    ) -> List[float]:
        p = prompt.lower()
        goal = "MAINTENANCE"
        if "fat loss" in p or "lose fat" in p or "cut" in p:
            goal = "FAT_LOSS"
        elif "muscle" in p or "hypertrophy" in p:
            goal = "MUSCLE_GAIN"
        elif "weight gain" in p or "bulk" in p:
            goal = "WEIGHT_GAIN"
        elif "strength" in p:
            goal = "STRENGTH_INCREASE"
        elif "endurance" in p:
            goal = "ENDURANCE_INCREASE"

        level = "BEGINNER"
        if "advanced" in p:
            level = "ADVANCED"
        elif "intermediate" in p:
            level = "INTERMEDIATE"

        weight = self._extract_num(prompt, [r"weight[:\s]+(\d+(?:\.\d+)?)"], 70.0)
        body_fat = self._extract_num(
            prompt,
            [r"body\s*fat[:\s]+(\d+(?:\.\d+)?)", r"body\s*fat\s*(\d+(?:\.\d+)?)"],
            18.0,
        )
        sleep = self._extract_num(prompt, [r"sleep[:\s]+(\d+(?:\.\d+)?)"], 7.0)
        stress = self._extract_num(prompt, [r"stress(?:\s*level)?[:\s]+(\d+(?:\.\d+)?)"], 4.0)
        workout_freq = self._extract_num(
            prompt,
            [
                r"workout\s*frequency[:\s]+(\d+(?:\.\d+)?)",
                r"(\d+)\s*(?:days|times)\s*(?:/|per)\s*week",
            ],
            3.0,
        )

        # Must match training feature order/length from _fetch_rows() exactly (23 features).
        return [
            0.0,
            weight,
            body_fat,
            0.0,
            0.0,
            120.0,
            80.0,
            70.0,
            0.9,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            0.0,
            workout_freq,
            45.0,
            0.0,
            sleep,
            stress,
            float(goal_map.get(goal, 0)),
            float(level_map.get(level, 0)),
            float(activity_map.get("WALKING", 0)),
        ]

    def _fetch_rows(self) -> List[TrainRow]:
        conn = self._connect()
        try:
            goal_map, level_map, activity_map = self._enum_maps(conn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT
                      u.id AS user_id,
                      u."fitnessGoal"::text AS fitness_goal,
                      u."fitnessLevel"::text AS fitness_level,
                      u."activityType"::text AS activity_type,
                      p.weight, p."bodyFat", p."muscleMass", p."waistCircumference",
                      p."systolicBP", p."diastolicBP", p."restingHeartRate",
                      p.creatinine, p.urea, p."uricAcid", p."totalCholesterol",
                      p.ldl, p.hdl, p.triglycerides,
                      p."workoutFrequency", p."workoutDuration", p."cardioMinutes",
                      p."sleepHours", p."stressLevel",
                      pl."workoutPlan",
                      dd.content AS diet_content
                    FROM "User" u
                    JOIN LATERAL (
                      SELECT *
                      FROM "Progress" pr
                      WHERE pr."userId" = u.id
                      ORDER BY pr."createdAt" DESC
                      LIMIT 1
                    ) p ON TRUE
                    LEFT JOIN "Plan" pl ON pl."userId" = u.id
                    LEFT JOIN LATERAL (
                      SELECT content
                      FROM "DocumentEmbedding" de
                      WHERE de."userId" = u.id
                        AND de.source = 'diet'
                      ORDER BY de."createdAt" DESC
                      LIMIT 1
                    ) dd ON TRUE
                    WHERE pl."workoutPlan" IS NOT NULL;
                    """
                )
                rows = cur.fetchall()

            out: List[TrainRow] = []
            for r in rows:
                (
                    user_id,
                    fitness_goal,
                    fitness_level,
                    activity_type,
                    weight,
                    body_fat,
                    muscle_mass,
                    waist,
                    sys_bp,
                    dia_bp,
                    hr,
                    creatinine,
                    urea,
                    uric_acid,
                    total_chol,
                    ldl,
                    hdl,
                    trig,
                    workout_freq,
                    workout_dur,
                    cardio,
                    sleep_hours,
                    stress_level,
                    workout_plan,
                    diet_content,
                ) = r

                plan = self._normalize_plan(workout_plan)
                if not plan:
                    continue

                diet = self._normalize_diet(diet_content)
                features = [
                    0.0,
                    self._to_float(weight, 70.0),
                    self._to_float(body_fat, 18.0),
                    self._to_float(muscle_mass, 0.0),
                    self._to_float(waist, 0.0),
                    self._to_float(sys_bp, 120.0),
                    self._to_float(dia_bp, 80.0),
                    self._to_float(hr, 70.0),
                    self._to_float(creatinine, 0.9),
                    self._to_float(urea, 0.0),
                    self._to_float(uric_acid, 0.0),
                    self._to_float(total_chol, 0.0),
                    self._to_float(ldl, 0.0),
                    self._to_float(hdl, 0.0),
                    self._to_float(trig, 0.0),
                    self._to_float(workout_freq, 3.0),
                    self._to_float(workout_dur, 45.0),
                    self._to_float(cardio, 0.0),
                    self._to_float(sleep_hours, 7.0),
                    self._to_float(stress_level, 4.0),
                    float(goal_map.get(str(fitness_goal), 0)),
                    float(level_map.get(str(fitness_level), 0)),
                    float(activity_map.get(str(activity_type), 0)),
                ]

                out.append(TrainRow(user_id=user_id, features=features, plan=plan, diet=diet))
            return out
        finally:
            conn.close()

    def train(self) -> Tuple[bool, int, str]:
        try:
            rows = self._fetch_rows()
        except Exception as exc:  # noqa: BLE001
            print(f"Training data fetch failed: {exc}")
            return (
                False,
                0,
                "Training data fetch failed. Check database URL, credentials, and network connectivity.",
            )

        if len(rows) < MIN_TRAIN_ROWS:
            return False, len(rows), (
                f"Insufficient training rows ({len(rows)}). Need at least {MIN_TRAIN_ROWS}."
            )

        X = np.array([row.features for row in rows], dtype=float)
        scaler = StandardScaler()
        Xs = scaler.fit_transform(X)

        n_neighbors = min(K_NEIGHBORS, len(rows))
        nn = NearestNeighbors(n_neighbors=n_neighbors, metric="euclidean")
        nn.fit(Xs)

        self.rows = rows
        self.scaler = scaler
        self.feature_matrix = Xs
        self.nn = nn
        self.last_trained_at = datetime.now(timezone.utc).isoformat()

        os.makedirs(MODEL_DIR, exist_ok=True)
        dump(
            {
                "rows": rows,
                "scaler": scaler,
                "neighbors": nn,
                "feature_matrix": Xs,
                "last_trained_at": self.last_trained_at,
            },
            MODEL_FILE,
        )
        return True, len(rows), "Model trained from user data."

    def reset(self) -> bool:
        self.rows = []
        self.scaler = None
        self.nn = None
        self.feature_matrix = None
        self.last_trained_at = ""

        removed = False
        if os.path.exists(MODEL_FILE):
            try:
                os.remove(MODEL_FILE)
                removed = True
            except Exception as exc:  # noqa: BLE001
                print(f"Failed to remove model file: {exc}")
        return removed

    def load_or_train(self) -> None:
        if os.path.exists(MODEL_FILE):
            try:
                artifact = load(MODEL_FILE)
                self.rows = artifact["rows"]
                self.scaler = artifact["scaler"]
                self.nn = artifact["neighbors"]
                self.feature_matrix = artifact["feature_matrix"]
                self.last_trained_at = artifact.get("last_trained_at", "")
                return
            except Exception:
                pass
        self.train()

    def _weights_from_dist(self, distances: np.ndarray) -> np.ndarray:
        return 1.0 / (distances + 1e-6)

    def _weighted_sample_names(
        self,
        weighted_items: List[Tuple[str, float]],
        k: int,
        rng: random.Random,
    ) -> List[str]:
        pool = [(name, float(max(weight, 0.0))) for name, weight in weighted_items if name]
        chosen: List[str] = []
        k = max(0, min(k, len(pool)))
        for _ in range(k):
            total = sum(w for _n, w in pool)
            if total <= 0:
                idx = rng.randrange(len(pool))
            else:
                r = rng.random() * total
                upto = 0.0
                idx = 0
                for i, (_n, w) in enumerate(pool):
                    upto += w
                    if upto >= r:
                        idx = i
                        break
            name, _w = pool.pop(idx)
            chosen.append(name)
        return chosen

    def _similar_rows(self, prompt_features: List[float]) -> List[Tuple[TrainRow, float]]:
        if not self.rows or self.scaler is None or self.nn is None:
            raise RuntimeError("Model is not trained")

        expected = int(getattr(self.scaler, "n_features_in_", len(prompt_features)))
        aligned = list(prompt_features[:expected])
        if len(aligned) < expected:
            aligned.extend([0.0] * (expected - len(aligned)))

        x = np.array([aligned], dtype=float)
        xs = self.scaler.transform(x)
        distances, indices = self.nn.kneighbors(xs)
        w = self._weights_from_dist(distances[0])
        out: List[Tuple[TrainRow, float]] = []
        for idx, weight in zip(indices[0], w):
            out.append((self.rows[int(idx)], float(weight)))
        return out

    def _merge_plan(
        self,
        neighbors: List[Tuple[TrainRow, float]],
        rng: random.Random,
    ) -> List[Dict[str, Any]]:
        day_focus: Dict[str, Counter] = {d: Counter() for d in WEEK_DAYS}
        day_workout_score: Dict[str, Dict[str, float]] = {d: defaultdict(float) for d in WEEK_DAYS}
        sets_votes: Dict[Tuple[str, str], Counter] = defaultdict(Counter)
        notes_votes: Dict[Tuple[str, str], Counter] = defaultdict(Counter)
        global_workout_score: Dict[str, float] = defaultdict(float)
        global_sets_votes: Dict[str, Counter] = defaultdict(Counter)
        global_notes_votes: Dict[str, Counter] = defaultdict(Counter)
        workout_days_votes: List[int] = []

        for row, weight in neighbors:
            active_days = 0
            day_map = {str(item.get("day", "")).strip(): item for item in row.plan}
            for day in WEEK_DAYS:
                item = day_map.get(day)
                if not item:
                    continue
                workouts = item.get("workouts", [])
                if workouts:
                    active_days += 1
                day_focus[day][str(item.get("focus", "General"))] += weight
                for w in workouts:
                    name = str(w.get("workoutName", "")).strip()
                    if not name:
                        continue
                    day_workout_score[day][name] += weight
                    global_workout_score[name] += weight
                    sets_votes[(day, name)][str(w.get("setsReps", "")).strip()] += weight
                    notes_votes[(day, name)][str(w.get("notes", "")).strip()] += weight
                    global_sets_votes[name][str(w.get("setsReps", "")).strip()] += weight
                    global_notes_votes[name][str(w.get("notes", "")).strip()] += weight
            workout_days_votes.append(active_days)

        target_days = int(round(float(np.mean(workout_days_votes)))) if workout_days_votes else 4
        if rng.random() < 0.45:
            target_days += rng.choice([-1, 1])
        target_days = int(np.clip(target_days, 2, 6))

        day_rank = sorted(
            WEEK_DAYS,
            key=lambda d: sum(day_workout_score[d].values()) + (rng.random() * 1e-6),
            reverse=True,
        )
        train_days = set(day_rank[:target_days])

        plan: List[Dict[str, Any]] = []
        filler_exercises = [
            ("Push-up", "3 x 12", "Controlled tempo"),
            ("Bodyweight Squat", "3 x 15", "Full range"),
            ("Hip Hinge", "3 x 12", "Keep spine neutral"),
            ("Plank", "3 x 45 sec", "Brace core"),
            ("Walking Lunge", "3 x 10 each leg", "Steady balance"),
        ]
        for day in WEEK_DAYS:
            if day not in train_days:
                plan.append({"day": day, "focus": "Rest", "workouts": []})
                continue

            if day_focus[day]:
                focus_pool = day_focus[day].most_common(3)
                picked_focus = self._weighted_sample_names(
                    [(name, score) for name, score in focus_pool],
                    1,
                    rng,
                )
                focus = picked_focus[0] if picked_focus else focus_pool[0][0]
            else:
                focus = "General"
            candidates = sorted(
                day_workout_score[day].items(),
                key=lambda kv: kv[1],
                reverse=True,
            )
            candidate_pool: List[Tuple[str, float]] = candidates[: min(9, len(candidates))]
            if len(candidate_pool) < 7:
                seen = {name for name, _w in candidate_pool}
                global_candidates = sorted(
                    global_workout_score.items(),
                    key=lambda kv: kv[1],
                    reverse=True,
                )
                for name, score in global_candidates:
                    if name in seen:
                        continue
                    candidate_pool.append((name, score * 0.7))
                    seen.add(name)
                    if len(candidate_pool) >= 12:
                        break

            picked_names = self._weighted_sample_names(candidate_pool, min(5, len(candidate_pool)), rng)
            workouts: List[Dict[str, str]] = []
            for name in picked_names:
                sets = (
                    sets_votes[(day, name)].most_common(1)[0][0]
                    if sets_votes[(day, name)]
                    else (
                        global_sets_votes[name].most_common(1)[0][0]
                        if global_sets_votes[name]
                        else "3 x 10"
                    )
                )
                note = (
                    notes_votes[(day, name)].most_common(1)[0][0]
                    if notes_votes[(day, name)]
                    else (
                        global_notes_votes[name].most_common(1)[0][0]
                        if global_notes_votes[name]
                        else ""
                    )
                )
                workouts.append({"workoutName": name, "setsReps": sets, "notes": note})

            if len(workouts) < 5:
                used = {w["workoutName"] for w in workouts}
                for name, sets, note in filler_exercises:
                    if name in used:
                        continue
                    workouts.append({"workoutName": name, "setsReps": sets, "notes": note})
                    if len(workouts) >= 5:
                        break
            plan.append({"day": day, "focus": focus, "workouts": workouts})

        return plan

    def _merge_diet(self, neighbors: List[Tuple[TrainRow, float]]) -> List[Dict[str, str]]:
        meal_score: Dict[str, float] = defaultdict(float)
        items_votes: Dict[str, Counter] = defaultdict(Counter)
        notes_votes: Dict[str, Counter] = defaultdict(Counter)

        for row, weight in neighbors:
            for d in row.diet:
                meal = str(d.get("meal", "")).strip()
                if not meal:
                    continue
                meal_score[meal] += weight
                items_votes[meal][str(d.get("items", "")).strip()] += weight
                notes_votes[meal][str(d.get("notes", "")).strip()] += weight

        if not meal_score:
            return []

        ordered = sorted(meal_score.items(), key=lambda kv: kv[1], reverse=True)[:6]
        out: List[Dict[str, str]] = []
        for meal, _ in ordered:
            items = items_votes[meal].most_common(1)[0][0] if items_votes[meal] else ""
            notes = notes_votes[meal].most_common(1)[0][0] if notes_votes[meal] else ""
            out.append({"meal": meal, "items": items, "notes": notes})
        return out

    def generate_plan(self, prompt: str) -> str:
        if not DB_URL:
            raise RuntimeError("ML_DATABASE_URL is required for trained generation")
        conn = self._connect()
        try:
            goal_map, level_map, activity_map = self._enum_maps(conn)
        finally:
            conn.close()

        feats = self._prompt_features(prompt, goal_map, level_map, activity_map)
        neighbors = self._similar_rows(feats)
        rng = random.Random()
        rng.seed((time.time_ns() ^ hash(prompt)) & 0xFFFFFFFF)
        return json.dumps(self._merge_plan(neighbors, rng))

    def generate_diet(self, prompt: str) -> str:
        if not DB_URL:
            raise RuntimeError("ML_DATABASE_URL is required for trained generation")
        conn = self._connect()
        try:
            goal_map, level_map, activity_map = self._enum_maps(conn)
        finally:
            conn.close()

        feats = self._prompt_features(prompt, goal_map, level_map, activity_map)
        neighbors = self._similar_rows(feats)
        return json.dumps(self._merge_diet(neighbors))

    def embed(self, text: str) -> List[float]:
        vec = self.vectorizer.transform([text]).toarray()[0]
        return [float(v) for v in vec]


def detect_task(prompt: str) -> str:
    t = prompt.lower()
    is_json_generation = "return only valid json" in t or "responsemimetype" in t
    if ('"workoutname"' in t or "weekly workout plan" in t or "exact structure" in t) and is_json_generation:
        return "plan"
    if ('"meal"' in t or "meal plan" in t or "nutrition plan" in t) and is_json_generation:
        return "diet"
    if ('"supplement"' in t or "supplement suggestion" in t or "suggest supplements" in t) and is_json_generation:
        return "supplement"
    if ('"overview"' in t and '"bodycomposition"' in t) and is_json_generation:
        return "insight"
    return "chat"


def _extract_chat_sections(prompt: str) -> Tuple[str, str]:
    context = ""
    user_message = ""

    context_match = re.search(
        r"Retrieved context:\s*(.*?)\s*User message:",
        prompt,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if context_match:
        context = context_match.group(1).strip()

    user_match = re.search(
        r"User message:\s*(.*?)\s*(Respond clearly and concisely\.|$)",
        prompt,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if user_match:
        user_message = user_match.group(1).strip()
    else:
        user_message = prompt.strip()

    return context, user_message


def _try_parse_plan_from_text(text: str) -> List[Dict[str, Any]]:
    if not text:
        return []
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return []
    try:
        parsed = json.loads(text[start : end + 1])
        if isinstance(parsed, list):
            return parsed
    except Exception:
        return []
    return []


def _chat_answer(prompt: str) -> str:
    context, user_message = _extract_chat_sections(prompt)
    question = user_message.lower()
    plan = _try_parse_plan_from_text(context) or _try_parse_plan_from_text(user_message)

    if plan:
        day_map = {
            str(item.get("day", "")).strip().lower(): item
            for item in plan
            if isinstance(item, dict)
        }
        day_match = re.search(
            r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
            question,
        )
        if day_match:
            day = day_match.group(1)
            item = day_map.get(day)
            if not item:
                return f"I could not find a {day.title()} entry in your current plan."
            workouts = item.get("workouts", []) if isinstance(item.get("workouts", []), list) else []
            focus = str(item.get("focus", "General"))
            if not workouts:
                return f"Your {day.title()} split is {focus} (no workouts scheduled)."
            names = [str(w.get("workoutName", "")).strip() for w in workouts if isinstance(w, dict)]
            names = [n for n in names if n]
            return f"Your {day.title()} split is {focus}. Workouts: {', '.join(names)}."

        if "explain" in question or "about my workout" in question or "split" in question:
            train_days = 0
            summary: List[str] = []
            for item in plan:
                if not isinstance(item, dict):
                    continue
                day = str(item.get("day", "")).strip()
                focus = str(item.get("focus", "General")).strip()
                workouts = item.get("workouts", []) if isinstance(item.get("workouts", []), list) else []
                if workouts:
                    train_days += 1
                    summary.append(f"{day}: {focus} ({len(workouts)} exercises)")
            return (
                f"This is a {train_days}-day split with planned rest/recovery days. "
                + " | ".join(summary[:5])
            )

    return (
        "I can explain your plan day-by-day. Ask like: "
        "'What is my split on Tuesday?' or 'Explain my current workout split.'"
    )


def _extract_context_block(prompt: str) -> str:
    match = re.search(
        r"Retrieved user context:\s*(.*)$",
        prompt,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if match:
        return match.group(1).strip()
    return prompt.strip()


def _supplement_json(prompt: str) -> str:
    text = _extract_context_block(prompt).lower()
    items: List[Dict[str, str]] = []

    if any(k in text for k in ["strength", "muscle", "hypertrophy", "power"]):
        items.append(
            {
                "supplement": "Creatine Monohydrate",
                "dosage": "3-5g daily",
                "notes": "Consistent daily intake with water.",
            }
        )

    if any(k in text for k in ["protein", "low protein", "muscle", "recovery"]):
        items.append(
            {
                "supplement": "Whey Protein",
                "dosage": "20-30g as needed",
                "notes": "Use only to meet daily protein target.",
            }
        )

    if any(k in text for k in ["fat loss", "cut", "cardio", "endurance"]):
        items.append(
            {
                "supplement": "Caffeine",
                "dosage": "100-200mg pre-workout",
                "notes": "Avoid close to bedtime.",
            }
        )

    # Return [] when no clear indication is detected.
    return json.dumps(items)


def _insight_json(prompt: str) -> str:
    text = _extract_context_block(prompt).lower()
    weight_trend = "stable"
    if "weight: " in text and "body fat" in text and "fat loss" in text:
        weight_trend = "down"
    elif any(k in text for k in ["weight gain", "bulk", "muscle gain"]):
        weight_trend = "up"

    training_consistency = "average"
    if any(k in text for k in ["workout frequency: 5", "workout frequency: 6"]):
        training_consistency = "good"
    elif any(k in text for k in ["workout frequency: 1", "workout frequency: 2"]):
        training_consistency = "poor"

    stress_level = "moderate"
    if "stress level: 1" in text or "stress level: 2" in text or "stress level: 3" in text:
        stress_level = "low"
    elif any(k in text for k in ["stress level: 8", "stress level: 9", "stress level: 10"]):
        stress_level = "high"

    insights = {
        "overview": "Progress is moving with identifiable strengths and recoverable gaps.",
        "bodyComposition": {
            "weightTrend": weight_trend,
            "muscleMassStatus": "improving" if "muscle" in text else "stable",
            "bodyFatStatus": "improving" if "fat loss" in text else "stable",
        },
        "healthMarkers": {
            "bloodPressure": "normal",
            "heartRate": "good",
            "sugarStatus": "normal",
            "cholesterolStatus": "good",
            "kidneyHealth": "normal",
        },
        "lifestyle": {
            "trainingConsistency": training_consistency,
            "recoveryQuality": "good" if "sleep: 7" in text or "sleep: 8" in text else "poor",
            "stressLevel": stress_level,
        },
        "strengths": ["Training structure exists", "Progress logs are available"],
        "concerns": ["Recovery and progression need consistent monitoring"],
        "recommendations": [
            "Track top sets weekly and progress gradually.",
            "Keep protein intake consistent daily.",
            "Prioritize sleep and stress management.",
        ],
    }
    return json.dumps(insights)


app = FastAPI(title="Strengthly Trained ML Service", version="3.0.0")
engine = PlannerDietModel()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "modelType": "trained-user-data-ml",
        "trainedRows": len(engine.rows),
        "lastTrainedAt": engine.last_trained_at,
        "modelFile": MODEL_FILE,
        "dbConfigured": bool(DB_URL),
        "embeddingDims": EMBED_DIMS,
    }


@app.post("/train", response_model=TrainResponse)
def retrain() -> TrainResponse:
    ok, rows, message = engine.train()
    return TrainResponse(
        success=ok,
        rows=rows,
        message=message,
        trainedAt=engine.last_trained_at,
    )


@app.post("/reset", response_model=ResetResponse)
def reset_model(retrain: bool = False) -> ResetResponse:
    removed = engine.reset()
    if retrain:
        ok, rows, message = engine.train()
        return ResetResponse(
            success=ok,
            message=(
                f"Model reset complete. {message}"
                if ok
                else f"Model reset complete, retrain failed: {message}"
            ),
            modelFileRemoved=removed,
            retrained=ok,
            rows=rows,
            trainedAt=engine.last_trained_at,
        )

    return ResetResponse(
        success=True,
        message="Model knowledge reset. Call /train after adding desired training data.",
        modelFileRemoved=removed,
        retrained=False,
        rows=0,
        trainedAt=engine.last_trained_at,
    )


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest) -> GenerateResponse:
    try:
        task = detect_task(req.prompt)
        if task == "plan":
            text = engine.generate_plan(req.prompt)
        elif task == "diet":
            text = engine.generate_diet(req.prompt)
        elif task == "supplement":
            text = _supplement_json(req.prompt)
        elif task == "insight":
            text = _insight_json(req.prompt)
        else:
            text = _chat_answer(req.prompt)
        return GenerateResponse(text=text)
    except Exception as exc:  # noqa: BLE001
        print(f"Generation failed: {exc}")
        raise HTTPException(status_code=500, detail="Generation failed.") from exc


@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest) -> EmbedResponse:
    try:
        return EmbedResponse(embedding=engine.embed(req.text))
    except Exception as exc:  # noqa: BLE001
        print(f"Embedding failed: {exc}")
        raise HTTPException(status_code=500, detail="Embedding failed.") from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host=HOST, port=PORT, reload=False)
