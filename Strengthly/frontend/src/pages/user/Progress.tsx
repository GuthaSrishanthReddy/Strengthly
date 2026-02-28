import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { fetchProgress } from "../../services/progress.service";
import type { ProgressRecord } from "../../types/progress.types";
import { askRag } from "../../services/rag.service";
import "./Progress.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type XYPoint = { x: number; y: number };

const toRegressionLine = (points: XYPoint[]): XYPoint[] => {
  if (points.length < 2) return [];

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
};

const Progress = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [error, setError] = useState("");
  const [ragLine, setRagLine] = useState("");
  const [ragLoading, setRagLoading] = useState(false);
  const [ragCooldownUntil, setRagCooldownUntil] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const records = await fetchProgress();
        setHistory(records);
      } catch (err: any) {
        setError(err?.message || "Failed to load progress chart data.");
      }
    };
    load();
  }, []);

  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [history]
  );

  const labels = useMemo(
    () =>
      sorted.map((row) =>
        new Date(row.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      ),
    [sorted]
  );

  const latest = useMemo(() => {
    if (sorted.length === 0) return null;
    return sorted[sorted.length - 1];
  }, [sorted]);

  const generateRagLine = async () => {
    if (!latest || ragLoading) return;

    const now = Date.now();
    if (now < ragCooldownUntil) return;

    setRagLoading(true);
    try {
      const message = [
        "Give exactly one concise actionable line based on my metrics.",
        `Weight: ${latest.weight ?? "N/A"} kg`,
        `Body Fat: ${latest.bodyFat ?? "N/A"} %`,
        `Muscle Mass: ${latest.muscleMass ?? "N/A"} kg`,
        `Creatine Intake: ${latest.creatineIntake ?? "N/A"} g`,
        `Workout Frequency: ${latest.workoutFrequency ?? "N/A"} days/week`,
      ].join("\n");
      const response = await askRag(message);
      setRagLine((response.answer || "").trim());
    } catch (err: any) {
      const text = String(err?.message ?? "");
      const match = text.match(/retry in\s+(\d+)s/i);
      const retrySeconds = match ? Number(match[1]) : 20;
      setRagCooldownUntil(Date.now() + retrySeconds * 1000);
      setRagLine(`Rate-limited. Try again in ${retrySeconds}s.`);
    } finally {
      setRagLoading(false);
    }
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#dbe7ff",
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date", color: "#dbe7ff" },
        ticks: { color: "#9fb3d9" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        title: { display: true, text: "Weight (kg)", color: "#dbe7ff" },
        ticks: { color: "#9fb3d9" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  } as const;

  const proteinVsMusclePoints: XYPoint[] = sorted
    .filter(
      (row) =>
        row.proteinIntake !== undefined &&
        row.proteinIntake !== null &&
        row.muscleMass !== undefined &&
        row.muscleMass !== null
    )
    .map((row) => ({
      x: row.proteinIntake as number,
      y: row.muscleMass as number,
    }));

  const proteinBarPairs = [...proteinVsMusclePoints].sort((a, b) => a.x - b.x);

  const creatinePoints: XYPoint[] = sorted
    .filter(
      (row) =>
        row.creatineIntake !== undefined &&
        row.creatineIntake !== null &&
        row.muscleMass !== undefined &&
        row.muscleMass !== null
    )
    .map((row) => ({
      x: row.creatineIntake as number,
      y: row.muscleMass as number,
    }));

  const proteinVsMuscleBar = {
    labels: proteinBarPairs.map((p) => p.x.toFixed(0)),
    datasets: [
      {
        label: "Muscle Mass (kg)",
        data: proteinBarPairs.map((p) => p.y),
        backgroundColor: "rgba(0, 229, 255, 0.6)",
        borderColor: "#00e5ff",
        borderWidth: 1.2,
      },
    ],
  };

  const creatineVsMuscle = {
    datasets: [
      {
        label: "Data Points",
        data: creatinePoints,
        borderColor: "transparent",
        backgroundColor: "rgba(245, 158, 11, 0.75)",
        pointRadius: 4.5,
        showLine: false,
      },
      {
        label: "Trendline",
        data: toRegressionLine(creatinePoints),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        pointRadius: 0,
        borderWidth: 2,
        tension: 0,
        showLine: true,
      },
    ],
  };

  const weightVsTime = {
    labels,
    datasets: [
      {
        label: "Weight (kg)",
        data: sorted.map((row) => row.weight ?? null),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.25)",
        tension: 0.3,
        spanGaps: true,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#dbe7ff",
        },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        title: { display: true, text: "X Axis", color: "#dbe7ff" },
        ticks: { color: "#9fb3d9" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        type: "linear" as const,
        title: { display: true, text: "Y Axis", color: "#dbe7ff" },
        ticks: { color: "#9fb3d9" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const proteinBarOptions = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales.x,
        title: { display: true, text: "Protein Intake (g)", color: "#dbe7ff" },
      },
      y: {
        ...baseOptions.scales.y,
        title: { display: true, text: "Muscle Mass (kg)", color: "#dbe7ff" },
      },
    },
  };

  const creatineScatterOptions = {
    ...scatterOptions,
    scales: {
      ...scatterOptions.scales,
      x: {
        ...scatterOptions.scales.x,
        title: { display: true, text: "Creatine Intake (g)", color: "#dbe7ff" },
      },
      y: {
        ...scatterOptions.scales.y,
        title: { display: true, text: "Muscle Mass (kg)", color: "#dbe7ff" },
      },
    },
  };

  return (
    <section className="progress-entry">
      <div className="progress-entry__header">
        <h2>Progress</h2>
        <button
          type="button"
          className="progress-entry__btn"
          onClick={() => navigate("/user/progress/update")}
        >
          Update Progress
        </button>
      </div>
      {error && <p className="progress-entry__error">{error}</p>}
      {!error && latest && (
        <div className="progress-entry__rag">
          <span>RAG Insight:</span>{" "}
          {ragLoading ? "Generating..." : ragLine || "Click Generate Insight to fetch."}
          <button
            type="button"
            className="progress-entry__rag-btn"
            onClick={generateRagLine}
            disabled={
              ragLoading || Date.now() < ragCooldownUntil
            }
          >
            {ragLoading
              ? "Generating..."
              : Date.now() < ragCooldownUntil
              ? "Please wait..."
              : "Generate Insight"}
          </button>
        </div>
      )}
      {!error && sorted.length < 2 && (
        <p className="progress-entry__note">
          Add at least 2 progress updates to view charts.
        </p>
      )}
      {!error && sorted.length >= 2 && (
        <div className="progress-entry__charts">
          <article className="progress-chart-card">
            <h3>Protein Intake vs Muscle Mass</h3>
            <div className="progress-chart-card__plot">
              <Bar options={proteinBarOptions} data={proteinVsMuscleBar} />
            </div>
          </article>
          <article className="progress-chart-card">
            <h3>Creatine Levels vs Muscle Mass</h3>
            <div className="progress-chart-card__plot">
              <Line options={creatineScatterOptions} data={creatineVsMuscle} />
            </div>
          </article>
          <article className="progress-chart-card">
            <h3>Weight vs Time</h3>
            <div className="progress-chart-card__plot">
              <Line options={baseOptions} data={weightVsTime} />
            </div>
          </article>
        </div>
      )}
    </section>
  );
};

export default Progress;
