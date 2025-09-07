import { JSX, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function RequireAdmin({ children }: { children: JSX.Element }) {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext not found");

  const { isAuthenticated, isAdmin, loading } = auth;
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />; // redirect normal users to dashboard
  }

  return children;
}