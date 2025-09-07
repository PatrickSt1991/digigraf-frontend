import { JSX, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireUser({ children }: { children: JSX.Element }) {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const { isAuthenticated, loading } = auth;
  const location = useLocation();

  if (loading) {
    // Wait until auth is loaded from localStorage
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login and preserve intended URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
