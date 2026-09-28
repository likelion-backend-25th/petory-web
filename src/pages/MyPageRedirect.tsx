import { Navigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

export function MyPageRedirect() {
  const user = useAuthStore((state) => state.user);
  if (user === null || user.id <= 0) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/profile/${user.id}`} replace />;
}
