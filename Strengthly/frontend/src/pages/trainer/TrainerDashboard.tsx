import { useNavigate } from "react-router-dom";
import "./TrainerDashboard.css";

const TrainerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="trainer-dashboard-container">
      {/* Header */}
      <div className="trainer-dashboard-header">
        <h1>Welcome back 👋</h1>
        <p>Manage your clients and training activity.</p>
      </div>

      {/* Cards */}
      <div className="trainer-dashboard-grid">
        <div
          className="trainer-dashboard-card"
          onClick={() => navigate("/trainer/clients")}
        >
          <h3>My Clients</h3>
          <p>View and manage assigned clients</p>
        </div>

        <div
          className="trainer-dashboard-card"
          onClick={() => navigate("/trainer/history")}
        >
          <h3>My History</h3>
          <p>View past training sessions</p>
        </div>

        <div
          className="trainer-dashboard-card"
          onClick={() => navigate("/trainer/explore-clients")}
        >
          <h3>Explore Clients</h3>
          <p>Find and accept new clients</p>
        </div>

        <div
          className="trainer-dashboard-card"
          onClick={() => navigate("/trainer/profile")}
        >
          <h3>Profile</h3>
          <p>View and edit your profile</p>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
