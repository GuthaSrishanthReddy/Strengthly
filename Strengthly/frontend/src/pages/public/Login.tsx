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
      const res: AuthResponse = await loginApi(email, password);

      // store JWT token
      login(res.token);

      // redirect based on role
      // redirect based on role

      if (res.user.role === "USER") {
        navigate("/user/plan", { replace: true });
      } else {
        navigate("/trainer/dashboard", { replace: true });
      }

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login">
      <h2 className="login__title">Login</h2>

      {error && <p className="login__error">{error}</p>}

      <form onSubmit={handleSubmit} className="login__form">
        <input
          type="email"
          placeholder="Email"
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

        <button type="submit">Login</button>

        <div className="login__footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
