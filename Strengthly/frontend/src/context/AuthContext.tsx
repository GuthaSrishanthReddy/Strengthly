import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type Role = "USER" | "TRAINER";

interface User {
  id: string;
  role: Role;
}

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode<{ id: string; role: Role }>(token);
        setUser({ id: decoded.id, role: decoded.role });
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<{ id: string; role: Role }>(token);
    setUser({ id: decoded.id, role: decoded.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
