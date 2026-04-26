import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { getSession, isAdmin, isAdminRole, isTechnicianRole, normalizeRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: ReactElement;
  adminOnly?: boolean;
  allowedRoles?: string[];
}

const getFallbackRoute = (role: string | undefined) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "admin") return "/dashboard";
  if (isTechnicianRole(role)) return "/tech/dashboard";
  return "/tickets";
};

const roleMatches = (sessionRole: string | undefined, allowedRole: string): boolean => {
  const normalizedAllowedRole = normalizeRole(allowedRole);

  if (normalizedAllowedRole === "admin") {
    return isAdminRole(sessionRole);
  }

  if (normalizedAllowedRole === "technicien" || normalizedAllowedRole === "technician") {
    return isTechnicianRole(sessionRole);
  }

  return normalizeRole(sessionRole) === normalizedAllowedRole;
};

export default function ProtectedRoute({ children, adminOnly = false, allowedRoles }: ProtectedRouteProps) {
  const session = getSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to={getFallbackRoute(session.role)} replace />;
  }

  if (allowedRoles && !allowedRoles.some((allowedRole) => roleMatches(session.role, allowedRole))) {
    return <Navigate to={getFallbackRoute(session.role)} replace />;
  }

  return children;
}
