import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getSession, isAdmin } from "../utils/auth";

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const session = getSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/tickets" replace />;
  }

  return children;
}
