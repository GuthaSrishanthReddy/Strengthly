import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

import type { AuthResponse } from "../../types/auth.types";

import "./Login.css";




const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      let res: AuthResponse;
      try {
        res = await loginApi(email, password);
      } catch (firstErr: any) {
        const firstMessage = firstErr?.message || "Login failed";
        const lowerEmail = email.trim().toLowerCase();
        const shouldRetryLowercase =
          firstMessage === "Invalid credentials" && lowerEmail !== email.trim();

        if (!shouldRetryLowercase) {
          throw firstErr;
        }

        res = await loginApi(lowerEmail, password);
      }

      // store JWT token
      login(res.token);

      // redirect based on role
      // redirect based on role

      if (res.user.role === "USER") {
        navigate("/user/home", { replace: true });
      } else {
        navigate("/trainer/home", { replace: true });
      }

    } catch (err: any) {
      const message = err?.message || "Login failed";
      setError(
        message === "Invalid credentials"
          ? "Invalid email or password"
          : message
      );
    }
  };

  return (
    <div className="login">
      <header className="login__hero">
        <p className="login__eyebrow">Welcome Back</p>
        <p className="login__subtitle">
          Access your plan, update progress, and stay aligned with your trainer from one workspace.
        </p>
      </header>

      <section className="login__content" aria-label="Login form">
        {error && <p className="login__error">{error}</p>}

        <form onSubmit={handleSubmit} className="login__form">
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
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit">Login</button>

          <div className="login__footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Login;
