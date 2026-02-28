import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <section className="home__section home__section--hero">
        <p className="home__eyebrow">Performance Studio</p>
        <h1 className="home__title">Train smarter. Recover better. Stay consistent.</h1>
        <p className="home__subtitle">
          Strengthly gives you focused weekly plans, progress intelligence, and trainer collaboration in one clean workflow.
        </p>
        <div className="home__actions">
          <Link to="/signup" className="home__btn home__btn--primary">
            Start now
          </Link>
          <Link to="/login" className="home__btn home__btn--secondary">
            I have an account
          </Link>
        </div>
      </section>

      <section className="home__section home__section--info">
        <h2>Adaptive routines based on your updates</h2>
        <p>Log your progress and get weekly plans that match your current pace and recovery.</p>
      </section>

      <section className="home__section home__section--info">
        <h2>Dedicated trainer and structured feedback loops</h2>
        <p>Share updates with your trainer in one place and keep accountability built into your workflow.</p>
      </section>

      <section className="home__section home__section--info">
        <h2>Simple dashboards that prioritize action</h2>
        <p>See what to do next without extra clutter, then execute your plan day by day.</p>
      </section>
    </div>
  );
};

export default Home;
