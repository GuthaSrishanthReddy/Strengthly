import { useNavigate } from "react-router-dom";
import "./MyProgress.css";

const MyProgress = () => {
  const navigate = useNavigate();

  return (
    <div className="my-progress">
      <h2>My Progress</h2>

      {/* Charts go here */}
      <div className="my-progress__charts">
        {/* WeightChart, FatChart, etc */}
      </div>

      <button onClick={() => navigate("/user/progress/update")}>
        Update Progress
      </button>
    </div>
  );
};

export default MyProgress;
