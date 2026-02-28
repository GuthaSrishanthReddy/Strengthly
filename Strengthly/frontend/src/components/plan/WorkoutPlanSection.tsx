import { Fragment, useEffect, useMemo, useState } from "react";
import type { PlanItem } from "../../services/routine.services";

type WorkoutPlanSectionProps = {
  loading: boolean;
  error: string;
  banner: string;
  plan: PlanItem[];
  generating: boolean;
  onGeneratePlan: () => Promise<void>;
};

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WorkoutPlanSection = ({
  loading,
  error,
  banner,
  plan,
  generating,
  onGeneratePlan,
}: WorkoutPlanSectionProps) => {
  const sortedPlan = useMemo(
    () =>
      [...plan].sort((a, b) => {
        const aIdx = dayOrder.indexOf(a.day);
        const bIdx = dayOrder.indexOf(b.day);
        const safeA = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx;
        const safeB = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx;
        return safeA - safeB;
      }),
    [plan]
  );
  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    if (sortedPlan.length === 0) {
      setSelectedDay("");
      return;
    }
    if (selectedDay && !sortedPlan.some((item) => item.day === selectedDay)) {
      setSelectedDay(sortedPlan[0].day);
    }
  }, [sortedPlan, selectedDay]);

  return (
    <section>
      <div className="section-header">
        <h3>Workout Plan</h3>
        <button
          type="button"
          className="plan-generate-btn"
          onClick={onGeneratePlan}
          disabled={loading || generating}
        >
          {generating ? "Generating..." : "Generate Plan"}
        </button>
      </div>
      <div className="workout-plan">
        {loading && <p>Loading plan...</p>}
        {!loading && banner && <div className="plan-banner">{banner}</div>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && plan.length === 0 && (
          <p>No plan yet. Update your progress to generate one.</p>
        )}
        {!loading && !error && plan.length > 0 && (
          <div>
            <div className="workout-table-wrap">
              <table className="workout-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Workout</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlan.map((dayPlan) => {
                    const workouts = dayPlan.workouts ?? [];
                    const isActive = selectedDay === dayPlan.day;

                    return (
                      <Fragment key={dayPlan.day}>
                        <tr
                          className={isActive ? "workout-row workout-row--active" : "workout-row"}
                        >
                          <td>
                            <button
                              type="button"
                              className="day-select-btn"
                              onClick={() =>
                                setSelectedDay((prev) => (prev === dayPlan.day ? "" : dayPlan.day))
                              }
                            >
                              {dayPlan.day}
                            </button>
                          </td>
                          <td>{dayPlan.focus || "General"}</td>
                        </tr>
                        {isActive && (
                          <tr className="workout-row-detail">
                            <td colSpan={2}>
                              <table className="day-detail-table">
                                <thead>
                                  <tr>
                                    <th>Workout</th>
                                    <th>Sets x Reps</th>
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {workouts.map((workout, idx) => (
                                    <tr key={`${dayPlan.day}-${workout.workoutName}-${idx}`}>
                                      <td>{workout.workoutName}</td>
                                      <td>{workout.setsReps || "N/A"}</td>
                                      <td>{workout.notes || "N/A"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WorkoutPlanSection;
