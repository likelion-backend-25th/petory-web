import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
