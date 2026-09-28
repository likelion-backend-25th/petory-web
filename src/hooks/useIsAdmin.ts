import { isAdminRole } from "@/lib/admin";
import { readRolesFromAccessToken } from "@/lib/jwt";
import { useAuthStore } from "@/stores/useAuthStore";

export function useIsAdmin(): boolean {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  if (isAdminRole(user?.role)) {
    return true;
  }
  if (accessToken === null) {
    return false;
  }
  return readRolesFromAccessToken(accessToken).some((role) => isAdminRole(role));
}
