import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProgress } from "../../services/progress.service";
import type { ProgressRecord } from "../../types/progress.types";
import "./RecentProgress.css";

type RecentProgressProps = {
  title?: string;
};

export default function RecentProgress({
  title = "Recent Progress",
}: RecentProgressProps) {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProgress();
        setHistory(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load recent progress.");
      }
    };
    load();
  }, []);

  const latest = useMemo(() => {
    if (history.length === 0) return null;
    return [...history].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [history]);

  return (
    <section className="recent-progress">
      <div className="recent-progress__header">
        <h3>{title}</h3>
        <button
          type="button"
          className="recent-progress__update-btn"
          onClick={() => navigate("/user/progress")}
        >
          Update Progress
        </button>
      </div>
      {error && <p className="recent-progress__error">{error}</p>}
      {!error && !latest && (
        <p className="recent-progress__note">No progress updates yet.</p>
      )}
      {latest && (
        <div className="recent-progress__stats">
          <div>
            <span>Date</span>
            <strong>{new Date(latest.createdAt).toLocaleString()}</strong>
          </div>
          <div>
            <span>Weight</span>
            <strong>{latest.weight} kg</strong>
          </div>
          <div>
            <span>Body Fat</span>
            <strong>{latest.bodyFat} %</strong>
          </div>
          <div>
            <span>Muscle Mass</span>
            <strong>{latest.muscleMass ?? "N/A"}</strong>
          </div>
          <div>
            <span>Waist</span>
            <strong>{latest.waistCircumference ?? "N/A"} cm</strong>
          </div>
          <div>
            <span>Blood Pressure</span>
            <strong>
              {latest.systolicBP}/{latest.diastolicBP}
            </strong>
          </div>
          <div>
            <span>Resting HR</span>
            <strong>{latest.restingHeartRate} bpm</strong>
          </div>
          <div>
            <span>Fasting Sugar</span>
            <strong>{latest.fastingSugar ?? "N/A"}</strong>
          </div>
          <div>
            <span>Post Prandial</span>
            <strong>{latest.postPrandialSugar ?? "N/A"}</strong>
          </div>
          <div>
            <span>HbA1c</span>
            <strong>{latest.hba1c ?? "N/A"}</strong>
          </div>
          <div>
            <span>Creatinine</span>
            <strong>{latest.creatinine}</strong>
          </div>
          <div>
            <span>Urea</span>
            <strong>{latest.urea ?? "N/A"}</strong>
          </div>
          <div>
            <span>Uric Acid</span>
            <strong>{latest.uricAcid ?? "N/A"}</strong>
          </div>
          <div>
            <span>Total Cholesterol</span>
            <strong>{latest.totalCholesterol ?? "N/A"}</strong>
          </div>
          <div>
            <span>LDL</span>
            <strong>{latest.ldl ?? "N/A"}</strong>
          </div>
          <div>
            <span>HDL</span>
            <strong>{latest.hdl ?? "N/A"}</strong>
          </div>
          <div>
            <span>Triglycerides</span>
            <strong>{latest.triglycerides ?? "N/A"}</strong>
          </div>
          <div>
            <span>Protein Intake</span>
            <strong>{latest.proteinIntake ?? "N/A"}</strong>
          </div>
          <div>
            <span>Creatine Intake</span>
            <strong>{latest.creatineIntake ?? "N/A"}</strong>
          </div>
          <div>
            <span>Workout Frequency</span>
            <strong>{latest.workoutFrequency}</strong>
          </div>
          <div>
            <span>Workout Duration</span>
            <strong>{latest.workoutDuration} min</strong>
          </div>
          <div>
            <span>Cardio Minutes</span>
            <strong>{latest.cardioMinutes}</strong>
          </div>
          <div>
            <span>Sleep Hours</span>
            <strong>{latest.sleepHours}</strong>
          </div>
          <div>
            <span>Stress Level</span>
            <strong>{latest.stressLevel}</strong>
          </div>
          <div className="recent-progress__notes">
            <span>Notes</span>
            <strong>{latest.notes ?? "None"}</strong>
          </div>
        </div>
      )}
    </section>
  );
}
