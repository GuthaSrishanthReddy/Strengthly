import type { DietItem } from "../../services/routine.services";

type DietPlanSectionProps = {
  loading: boolean;
  error: string;
  diet: DietItem[];
  generating?: boolean;
  onGenerateDiet?: () => Promise<void>;
};

const DietPlanSection = ({ loading, error, diet, generating, onGenerateDiet }: DietPlanSectionProps) => {
  return (
    <section>
      <div className="section-header">
        <h3>Meals</h3>
        <button
          className="generate-btn"
          onClick={onGenerateDiet}
          disabled={generating || loading}
        >
          {generating ? "Generating..." : "Generate Diet Plan"}
        </button>
      </div>
      <div className="workout-plan">
        {loading && <p>Loading meals...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && diet.length === 0 && (
          <p>No meals yet. Update your progress to generate one.</p>
        )}
        {!loading && !error && diet.length > 0 && (
          <div className="workout-table-wrap">
            <table className="workout-table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Items</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {diet.map((item, idx) => (
                  <tr key={`${item.meal}-${idx}`}>
                    <td>{item.meal}</td>
                    <td>{item.items}</td>
                    <td>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default DietPlanSection;
