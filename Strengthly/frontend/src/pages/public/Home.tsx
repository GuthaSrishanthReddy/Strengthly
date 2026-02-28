import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <div className="home__card">
        <h1 className="home__title">Welcome to Fitness Tracker</h1>

        <p className="home__subtitle">
          Track your health. Train smarter. Grow stronger.
        </p>

        <div className="home__actions">
          <Link to="/login" className="home__btn home__btn--primary">
            Login
          </Link>

          <Link to="/signup" className="home__btn home__btn--secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
