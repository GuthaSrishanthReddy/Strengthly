import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { user, isLoading } = useAuth();

    // ⏳ While checking auth, show NOTHING BUT BLOCK ROUTING
    if (isLoading) {
        return <div />;
    }

    // 🔐 If logged in, redirect to their profile page as requested
    if (user) {
        if (user.role === "USER") {
            return <Navigate to="/user/profile" replace />;
        } else {
            return <Navigate to="/trainer/profile" replace />;
        }
    }

    // ✅ Allowed (not logged in)
    return <>{children}</>;
};

export default PublicRoute;
