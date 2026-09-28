import { apiClient } from "@/lib/apiClient";
import type { MemberProfile } from "@/types/profile";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function normalizeProfile(body: unknown): MemberProfile | null {
  if (typeof body !== "object" || body === null || !("id" in body)) {
    return null;
  }

  const record = body as Record<string, unknown>;
  const id = asNumber(record.id);
  if (id === 0) {
    return null;
  }

  return {
    id,
    nickname: asString(record.nickname),
    intro: asNullableString(record.intro),
    profileImage: asNullableString(record.profileImage),
    status: asString(record.status),
    role: asString(record.role),
    createdAt: asString(record.createdAt),
    postsCount: asNumber(record.postsCount),
    followers: asNumber(record.followers),
    followings: asNumber(record.followings),
    email: typeof record.email === "string" ? record.email : undefined,
  };
}

export async function getProfile(memberId: number, signal?: AbortSignal): Promise<MemberProfile> {
  const body: unknown = await apiClient<unknown>(`/profile/${memberId}`, { signal });
  const profile = normalizeProfile(body);
  if (profile === null) {
    throw new Error("프로필 응답을 해석할 수 없습니다.");
  }
  return profile;
}
