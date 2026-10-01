import { apiClient } from "@/lib/apiClient";
import type { PetRanking, RankingSlice } from "@/types/ranking";

export interface GetRankingParams {
  size?: number;
  lastFollowerCount?: number;
  lastMemberId?: number;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePet(value: unknown): PetRanking | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const memberId = asNumber(record.memberId);
  if (memberId === null || memberId <= 0) {
    return null;
  }
  return {
    memberId,
    nickname: typeof record.nickname === "string" ? record.nickname : "",
    profileImage: typeof record.profileImage === "string" ? record.profileImage : null,
    followerCount: asNumber(record.followerCount) ?? 0,
  };
}

export async function getRanking(params: GetRankingParams = {}, signal?: AbortSignal): Promise<RankingSlice> {
  const body: unknown = await apiClient<unknown>("/ranking", {
    signal,
    query: {
      size: params.size,
      lastFollowerCount: params.lastFollowerCount,
      lastMemberId: params.lastMemberId,
    },
  });
  if (typeof body !== "object" || body === null) {
    throw new Error("랭킹 응답을 해석할 수 없습니다.");
  }
  const record = body as Record<string, unknown>;
  const content = Array.isArray(record.content) ? record.content.map(normalizePet).filter((pet) => pet !== null) : [];
  return {
    content,
    hasNext: record.hasNext === true,
    lastMemberId: asNumber(record.lastMemberId),
    lastFollowerCount: asNumber(record.lastFollowerCount),
  };
}
