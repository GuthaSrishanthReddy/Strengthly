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

      navigate(role === "USER" ? "/user/progress" : "/trainer/clients");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <h2 className="signup__title">Create Account</h2>

      <form onSubmit={handleSubmit} className="signup__form">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "USER" | "TRAINER")}
        >
          <option value="USER">User</option>
          <option value="TRAINER">Trainer</option>
        </select>

        {error && <p className="signup__error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <div className="signup__footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
