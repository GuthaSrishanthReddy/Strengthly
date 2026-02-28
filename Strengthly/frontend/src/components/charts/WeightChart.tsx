import "./WeightChart.css";

type Props = {
  data?: number[];
};

const WeightChart = ({ data = [] }: Props) => {
  const hasData = data.length > 0;

  return (
    <div className="weight-chart">
      <h3>Weight</h3>
      <div className="weight-chart__placeholder">
        {hasData ? `Chart goes here (${data.length} points)` : "No data yet"}
      </div>
    </div>
  );
};

export default WeightChart;
