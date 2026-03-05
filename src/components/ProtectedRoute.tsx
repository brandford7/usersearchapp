// src/components/ProtectedRoute.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, getLoginPath } = useAuth();

  // Don't redirect while loading (handled by AppRoutes)
  if (loading) {
    return null;
  }

  // Not authenticated - smart redirect based on last login type
  if (!isAuthenticated) {
    const redirectPath = getLoginPath();
    console.log("Not authenticated, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // Authenticated but not admin when admin is required
  if (requireAdmin && !isAdmin) {
    console.log(
      "Admin required but user is not admin, redirecting to /search",
    );
    return <Navigate to="/search" replace />;
  }

  return <>{children}</>;
}
