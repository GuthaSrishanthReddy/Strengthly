import "./MyPlan.css";
import { useEffect, useState } from "react";
import {
  fetchLatestAiDiet,
  fetchLatestAiPlan,
  fetchLatestAiSupplements,
  generateAiPlan,
  generateAiDiet,
  generateAiSupplements,
} from "../../services/routine.services";
import type {
  DietItem,
  PlanItem,
  SupplementItem,
} from "../../services/routine.services";
import WorkoutPlanSection from "../../components/plan/WorkoutPlanSection";
import DietPlanSection from "../../components/plan/DietPlanSection";

const MyPlan = () => {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [diet, setDiet] = useState<DietItem[]>([]);
  const [supplements, setSupplements] = useState<SupplementItem[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [dietLoading, setDietLoading] = useState(true);
  const [dietGenerating, setDietGenerating] = useState(false);
  const [supplementLoading, setSupplementLoading] = useState(true);
  const [supplementGenerating, setSupplementGenerating] = useState(false);
  const [planError, setPlanError] = useState("");
  const [planBanner, setPlanBanner] = useState("");
  const [dietError, setDietError] = useState("");
  const [supplementError, setSupplementError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setPlanLoading(true);
      setDietLoading(true);
      setSupplementLoading(true);
      try {
        const planData = await fetchLatestAiPlan();
        if (isMounted) {
          setPlan(planData);
          setPlan(planData);
          setPlanBanner("");
        }
      } catch {
        if (isMounted) setPlanError("Failed to load plan");
      } finally {
        if (isMounted) setPlanLoading(false);
      }

      try {
        const dietData = await fetchLatestAiDiet();
        if (isMounted) setDiet(dietData);
      } catch {
        if (isMounted) setDietError("Failed to load meals");
      } finally {
        if (isMounted) setDietLoading(false);
      }

      try {
        const supplementData = await fetchLatestAiSupplements();
        if (isMounted) setSupplements(supplementData);
      } catch {
        if (isMounted) setSupplementError("Failed to load supplements");
      } finally {
        if (isMounted) setSupplementLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGeneratePlan = async () => {
    setPlanError("");
    setPlanBanner("");
    setPlanGenerating(true);
    try {
      const result = await generateAiPlan();
      setPlan(result.plan);
      setPlanBanner(result.banner ?? "");
      if (result.plan.length === 0) {
        setPlanError("Generated plan was empty. Try again.");
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to generate plan";
      setPlanError(message);
    } finally {
      setPlanGenerating(false);
    }
  };

  const handleGenerateDiet = async () => {
    setDietError("");
    setDietGenerating(true);
    try {
      const result = await generateAiDiet();
      setDiet(result);
      if (result.length === 0) {
        setDietError("Generated meals were empty. Try again.");
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to generate meals";
      setDietError(message);
    } finally {
      setDietGenerating(false);
    }
  };

  const handleGenerateSupplements = async () => {
    setSupplementError("");
    setSupplementGenerating(true);
    try {
      const result = await generateAiSupplements();
      setSupplements(result);
      if (result.length === 0) {
        setSupplementError("Generated supplements were empty. Try again.");
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to generate supplements";
      setSupplementError(message);
    } finally {
      setSupplementGenerating(false);
    }
  };

  return (
    <div className="my-plan">
      <h2>My Plan</h2>

      <WorkoutPlanSection
        loading={planLoading}
        error={planError}
        banner={planBanner}
        plan={plan}
        generating={planGenerating}
        onGeneratePlan={handleGeneratePlan}
      />

      <DietPlanSection
        loading={dietLoading}
        error={dietError}
        diet={diet}
        generating={dietGenerating}
        onGenerateDiet={handleGenerateDiet}
      />
      <section className="my-plan__section">
        <div className="section-header">
          <h3>Supplements</h3>
          <button
            className="generate-btn"
            onClick={handleGenerateSupplements}
            disabled={supplementGenerating || supplementLoading}
          >
            {supplementGenerating ? "Generating..." : "Generate Supplements"}
          </button>
        </div>
        <div className="workout-plan">
          {supplementLoading && <p>Loading supplements...</p>}
          {supplementError && <p className="error">{supplementError}</p>}
          {!supplementLoading && !supplementError && supplements.length === 0 && (
            <p>No supplements suggested.</p>
          )}
          {!supplementLoading && !supplementError && supplements.length > 0 && (
            <div className="workout-table-wrap">
              <table className="workout-table">
                <thead>
                  <tr>
                    <th>Supplement</th>
                    <th>Dosage</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {supplements.map((item, idx) => (
                    <tr key={`${item.supplement}-${idx}`}>
                      <td>{item.supplement}</td>
                      <td>{item.dosage}</td>
                      <td>{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyPlan;
