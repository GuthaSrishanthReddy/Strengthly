import { useEffect, useMemo, useState } from "react";
import { fetchProgress, submitProgress } from "../../services/progress.service";
import type { ProgressInput, ProgressRecord } from "../../types/progress.types";
import "./ProgressUpdateForm.css";

const emptyProgress: ProgressInput = {
  weight: 0,
  bodyFat: 0,
  muscleMass: undefined,
  waistCircumference: undefined,
  systolicBP: 0,
  diastolicBP: 0,
  restingHeartRate: 0,
  fastingSugar: undefined,
  postPrandialSugar: undefined,
  hba1c: undefined,
  creatinine: 0,
  urea: undefined,
  uricAcid: undefined,
  totalCholesterol: undefined,
  ldl: undefined,
  hdl: undefined,
  triglycerides: undefined,
  proteinIntake: undefined,
  creatineIntake: undefined,
  workoutFrequency: 0,
  workoutDuration: 0,
  cardioMinutes: 0,
  sleepHours: 0,
  stressLevel: 1,
  notes: "",
};

const toNumberOrUndefined = (value: string) => {
  if (value.trim() === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const emptyFormState = {
  weight: "",
  bodyFat: "",
  muscleMass: "",
  waistCircumference: "",
  systolicBP: "",
  diastolicBP: "",
  restingHeartRate: "",
  fastingSugar: "",
  postPrandialSugar: "",
  hba1c: "",
  creatinine: "",
  urea: "",
  uricAcid: "",
  totalCholesterol: "",
  ldl: "",
  hdl: "",
  triglycerides: "",
  proteinIntake: "",
  creatineIntake: "",
  workoutFrequency: "",
  workoutDuration: "",
  cardioMinutes: "",
  sleepHours: "",
  stressLevel: "1",
  notes: "",
};

type FormState = typeof emptyFormState;

type ProgressUpdateFormProps = {
  title?: string;
};

export default function ProgressUpdateForm({
  title = "Update Progress",
}: ProgressUpdateFormProps) {
  const [progressHistory, setProgressHistory] = useState<ProgressRecord[]>([]);
  const [form, setForm] = useState<FormState>(() => ({ ...emptyFormState }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const history = await fetchProgress();
        setProgressHistory(history);
      } catch {
        // ignore load errors here
      }
    };
    load();
  }, []);

  const lastUpdated = useMemo(() => {
    if (progressHistory.length === 0) return null;
    const sorted = [...progressHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0];
  }, [progressHistory]);

  const daysSinceLastUpdate = useMemo(() => {
    if (!lastUpdated) return null;
    const last = new Date(lastUpdated.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }, [lastUpdated]);

  const canUpdateToday = useMemo(() => {
    if (!lastUpdated) return true;
    const last = new Date(lastUpdated.createdAt);
    const now = new Date();
    return (
      last.getFullYear() !== now.getFullYear() ||
      last.getMonth() !== now.getMonth() ||
      last.getDate() !== now.getDate()
    );
  }, [lastUpdated]);

  const showWeeklyBanner =
    daysSinceLastUpdate === null || daysSinceLastUpdate >= 7;

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canUpdateToday) {
      setError("You can update progress only once per day.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProgressInput = {
        ...emptyProgress,
        weight: Number(form.weight),
        bodyFat: toNumberOrUndefined(form.bodyFat),
        muscleMass: toNumberOrUndefined(form.muscleMass),
        waistCircumference: toNumberOrUndefined(form.waistCircumference),
        systolicBP: toNumberOrUndefined(form.systolicBP),
        diastolicBP: toNumberOrUndefined(form.diastolicBP),
        restingHeartRate: toNumberOrUndefined(form.restingHeartRate),
        fastingSugar: toNumberOrUndefined(form.fastingSugar),
        postPrandialSugar: toNumberOrUndefined(form.postPrandialSugar),
        hba1c: toNumberOrUndefined(form.hba1c),
        creatinine: toNumberOrUndefined(form.creatinine),
        urea: toNumberOrUndefined(form.urea),
        uricAcid: toNumberOrUndefined(form.uricAcid),
        totalCholesterol: toNumberOrUndefined(form.totalCholesterol),
        ldl: toNumberOrUndefined(form.ldl),
        hdl: toNumberOrUndefined(form.hdl),
        triglycerides: toNumberOrUndefined(form.triglycerides),
        proteinIntake: toNumberOrUndefined(form.proteinIntake),
        creatineIntake: toNumberOrUndefined(form.creatineIntake),
        workoutFrequency: toNumberOrUndefined(form.workoutFrequency),
        workoutDuration: toNumberOrUndefined(form.workoutDuration),
        cardioMinutes: toNumberOrUndefined(form.cardioMinutes),
        sleepHours: toNumberOrUndefined(form.sleepHours),
        stressLevel: toNumberOrUndefined(form.stressLevel) ?? 1,
        notes: form.notes.trim() ? form.notes.trim() : undefined,
      };

      await submitProgress(payload);
      setSuccess("Progress updated successfully.");
      setForm({ ...emptyFormState });
      const refreshed = await fetchProgress();
      setProgressHistory(refreshed);
    } catch (err: any) {
      setError(err?.message || "Failed to update progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="progress-update">
      <div className="progress-update__header">
        <h2>{title}</h2>
        {showWeeklyBanner && (
          <div className="progress-update__banner">
            You have not updated your progress in at least a week. Please update
            today.
          </div>
        )}
      </div>

      {!canUpdateToday && (
        <p className="progress-update__note">
          You already updated your progress today.
        </p>
      )}
      {error && <p className="progress-update__error">{error}</p>}
      {success && <p className="progress-update__success">{success}</p>}

      <form className="progress-update__form" onSubmit={handleSubmit}>
        <div className="progress-update__grid">
          <label>
            Weight (kg)
            <input
              type="number"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              required
              min={20}
              max={300}
            />
          </label>
          <label>
            Body Fat (%)
            <input
              type="number"
              value={form.bodyFat}
              onChange={(e) => handleChange("bodyFat", e.target.value)}
              min={2}
              max={70}
            />
          </label>
          <label>
            Muscle Mass (kg)
            <input
              type="number"
              value={form.muscleMass}
              onChange={(e) => handleChange("muscleMass", e.target.value)}
              min={5}
              max={80}
            />
          </label>
          <label>
            Waist Circumference (cm)
            <input
              type="number"
              value={form.waistCircumference}
              onChange={(e) => handleChange("waistCircumference", e.target.value)}
              min={40}
              max={200}
            />
          </label>
          <label>
            Systolic BP
            <input
              type="number"
              value={form.systolicBP}
              onChange={(e) => handleChange("systolicBP", e.target.value)}
              min={70}
              max={250}
            />
          </label>
          <label>
            Diastolic BP
            <input
              type="number"
              value={form.diastolicBP}
              onChange={(e) => handleChange("diastolicBP", e.target.value)}
              min={40}
              max={150}
            />
          </label>
          <label>
            Resting Heart Rate
            <input
              type="number"
              value={form.restingHeartRate}
              onChange={(e) => handleChange("restingHeartRate", e.target.value)}
              min={30}
              max={200}
            />
          </label>
          <label>
            Fasting Sugar
            <input
              type="number"
              value={form.fastingSugar}
              onChange={(e) => handleChange("fastingSugar", e.target.value)}
              min={50}
              max={500}
            />
          </label>
          <label>
            Post Prandial Sugar
            <input
              type="number"
              value={form.postPrandialSugar}
              onChange={(e) => handleChange("postPrandialSugar", e.target.value)}
              min={50}
              max={500}
            />
          </label>
          <label>
            HbA1c
            <input
              type="number"
              value={form.hba1c}
              onChange={(e) => handleChange("hba1c", e.target.value)}
              min={3}
              max={15}
              step="0.1"
            />
          </label>
          <label>
            Creatinine
            <input
              type="number"
              value={form.creatinine}
              onChange={(e) => handleChange("creatinine", e.target.value)}
              min={0.2}
              max={20}
              step="0.01"
            />
          </label>
          <label>
            Urea
            <input
              type="number"
              value={form.urea}
              onChange={(e) => handleChange("urea", e.target.value)}
              min={5}
              max={200}
            />
          </label>
          <label>
            Uric Acid
            <input
              type="number"
              value={form.uricAcid}
              onChange={(e) => handleChange("uricAcid", e.target.value)}
              min={1}
              max={20}
              step="0.1"
            />
          </label>
          <label>
            Total Cholesterol
            <input
              type="number"
              value={form.totalCholesterol}
              onChange={(e) => handleChange("totalCholesterol", e.target.value)}
              min={50}
              max={600}
            />
          </label>
          <label>
            LDL
            <input
              type="number"
              value={form.ldl}
              onChange={(e) => handleChange("ldl", e.target.value)}
              min={10}
              max={400}
            />
          </label>
          <label>
            HDL
            <input
              type="number"
              value={form.hdl}
              onChange={(e) => handleChange("hdl", e.target.value)}
              min={10}
              max={200}
            />
          </label>
          <label>
            Triglycerides
            <input
              type="number"
              value={form.triglycerides}
              onChange={(e) => handleChange("triglycerides", e.target.value)}
              min={20}
              max={1000}
            />
          </label>
          <label>
            Protein Intake (g)
            <input
              type="number"
              value={form.proteinIntake}
              onChange={(e) => handleChange("proteinIntake", e.target.value)}
              min={0}
              max={400}
            />
          </label>
          <label>
            Creatine Intake (g)
            <input
              type="number"
              value={form.creatineIntake}
              onChange={(e) => handleChange("creatineIntake", e.target.value)}
              min={0}
              max={20}
            />
          </label>
          <label>
            Workout Frequency (per week)
            <input
              type="number"
              value={form.workoutFrequency}
              onChange={(e) => handleChange("workoutFrequency", e.target.value)}
              min={0}
              max={14}
            />
          </label>
          <label>
            Workout Duration (minutes)
            <input
              type="number"
              value={form.workoutDuration}
              onChange={(e) => handleChange("workoutDuration", e.target.value)}
              min={0}
              max={300}
            />
          </label>
          <label>
            Cardio Minutes
            <input
              type="number"
              value={form.cardioMinutes}
              onChange={(e) => handleChange("cardioMinutes", e.target.value)}
              min={0}
              max={1000}
            />
          </label>
          <label>
            Sleep Hours
            <input
              type="number"
              value={form.sleepHours}
              onChange={(e) => handleChange("sleepHours", e.target.value)}
              min={0}
              max={24}
              step="0.1"
            />
          </label>
          <label>
            Stress Level (1-5)
            <input
              type="number"
              value={form.stressLevel}
              onChange={(e) => handleChange("stressLevel", e.target.value)}
              min={1}
              max={5}
            />
          </label>
        </div>
        <label className="progress-update__notes">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            maxLength={1000}
          />
        </label>

        <button
          className="progress-update__btn progress-update__btn--primary"
          type="submit"
          disabled={isSubmitting || !canUpdateToday}
        >
          {isSubmitting ? "Saving..." : "Update Progress"}
        </button>
      </form>
    </section>
  );
}
