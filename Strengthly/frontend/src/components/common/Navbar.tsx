import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const homePath = user?.role === "TRAINER" ? "/trainer/home" : "/user/home";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      {!user && (
        <Link to="/" className="navbar__logo">
          Strengthly
        </Link>
      )}
      {user && (
        <Link to={homePath} className="navbar__logo">
          Strengthly
        </Link>
      )}

      <div className="navbar__links">
        {!user && (
          <p className="navbar__hint">
            Login or Signup to access features
          </p>
        )}

        {user?.role === "USER" && (
          <>
            <Link to="/user/home">Home</Link>
            <Link to="/user/plan">Your Plan</Link>
            <Link to="/user/progress">Progress</Link>
            <Link to="/user/my-trainer">Assigned Trainer</Link>
            <Link to="/user/explore-trainers">Find Trainers</Link>
            <Link to="/user/profile">Profile</Link>
          </>
        )}

        {user?.role === "TRAINER" && (
          <>
            <Link to="/trainer/home">Home</Link>
            <Link to="/trainer/dashboard">Dashboard</Link>
            <Link to="/trainer/clients">My Clients</Link>
            <Link to="/trainer/explore-clients">Explore Clients</Link>
            <Link to="/trainer/history">My History</Link>
            <Link to="/trainer/profile">Profile</Link>
          </>
        )}

      </div>

      <div className="navbar__actions">
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
