import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../services/auth.service";

import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "TRAINER">("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerApi({
        name,
        email,
        password,
        role,
      });

      // If backend returns token, store it
      if ((res as any)?.token) {
        localStorage.setItem("token", (res as any).token);
      }

      navigate(role === "USER" ? "/user/home" : "/trainer/home");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <header className="signup__hero">
        <p className="signup__eyebrow">Create Account</p>
        <p className="signup__subtitle">
          Create your profile and start your training workflow in one place.
        </p>
      </header>

      <section className="signup__content" aria-label="Create account form">
        <form onSubmit={handleSubmit} className="signup__form">
          <label>
            Full name
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "USER" | "TRAINER")}
            >
              <option value="USER">User</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </label>

          {error && <p className="signup__error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="signup__footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Signup;
