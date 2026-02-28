import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      {!user && (
        <Link to="/" className="navbar__logo">
          FitnessTracker
        </Link>
      )}
      {user && (
        <Link to="/user/plan" className="navbar__logo">
          FitnessTracker
        </Link>
      )}

      <div className="navbar__links">
        {!user && (
          <>
            Login or Signup to access features
          </>
        )}

        {user?.role === "USER" && (
          <>
            <Link to="/user/plan">Your Plan</Link>
            <Link to="/user/progress">Progress</Link>
            <Link to="/user/my-trainer">Assigned Trainer</Link>
            <Link to="/user/explore-trainers">Find Trainers</Link>
            <Link to="/user/profile">Profile</Link>
          </>
        )}

        {user?.role === "TRAINER" && (
          <>
            <Link to="/trainer/dashboard">Dashboard</Link>
            <Link to="/trainer/clients">My Clients</Link>
            <Link to="/trainer/explore-clients">Explore Clients</Link>
            <Link to="/trainer/history">My History</Link>
            <Link to="/trainer/profile">Profile</Link>
          </>
        )}

      </div>

      <div className="navbar__actions">
        <ThemeToggle />
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
