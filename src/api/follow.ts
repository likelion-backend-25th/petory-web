import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";

function isMissingFollowApi(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.status === 404 || error.status === 405) {
    return true;
  }
  return error.message.includes("No static resource");
}

async function requestFollow(memberId: number, method: "POST" | "DELETE"): Promise<void> {
  try {
    await apiClient<void>(`/profile/${memberId}/follow`, { method });
  } catch (error: unknown) {
    if (isMissingFollowApi(error)) {
      return;
    }
    throw error;
  }
}

export function followMember(memberId: number): Promise<void> {
  return requestFollow(memberId, "POST");
}

export function unfollowMember(memberId: number): Promise<void> {
  return requestFollow(memberId, "DELETE");
}
