import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import type { FollowMember, MemberProfile, MyPagePost, ProfileEditRequest } from "@/types/profile";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
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
    isFollowing: record.isFollowing === true || record.following === true,
    email: asOptionalString(record.email),
    species: asOptionalString(record.species),
    sex: asOptionalString(record.sex),
    birthDate: asOptionalString(record.birthDate),
    address: asOptionalString(record.address),
  };
}

function normalizeMyPagePost(body: unknown): MyPagePost | null {
  if (typeof body !== "object" || body === null || !("id" in body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const id = asNumber(record.id);
  if (id === 0) {
    return null;
  }
  const imageUrls = record.imageUrls;
  const firstImage =
    Array.isArray(imageUrls) && typeof imageUrls[0] === "string" ? imageUrls[0] : null;

  return {
    id,
    content: asString(record.content),
    isSubscriberOnly: record.isSubscriberOnly === true || record.isSubscriberOnly === 1,
    isSponsorOnly: record.isSponsorOnly === true || record.isSponsorOnly === 1 || asNumber(record.type) === 2,
    hashtags: asString(record.hashtags),
    imageUrl: asNullableString(record.imageUrl) ?? firstImage,
    likeCount: asNumber(record.likeCount),
    commentCount: asNumber(record.commentCount),
  };
}

function normalizeMyPagePosts(body: unknown): MyPagePost[] {
  if (!Array.isArray(body)) {
    return [];
  }
  return body.map(normalizeMyPagePost).filter((item): item is MyPagePost => item !== null);
}

export async function getProfile(memberId: number, signal?: AbortSignal): Promise<MemberProfile> {
  const body: unknown = await apiClient<unknown>(`/profile/${memberId}`, { signal });
  const profile = normalizeProfile(body);
  if (profile === null) {
    throw new Error("프로필 응답을 해석할 수 없습니다.");
  }
  return profile;
}

export async function getProfilePosts(memberId: number, signal?: AbortSignal): Promise<MyPagePost[]> {
  const body: unknown = await apiClient<unknown>(`/profile/${memberId}/posts`, { signal });
  return normalizeMyPagePosts(body);
}

export async function getProfileQna(memberId: number, signal?: AbortSignal): Promise<MyPagePost[]> {
  const body: unknown = await apiClient<unknown>(`/profile/${memberId}/qna`, { signal });
  return normalizeMyPagePosts(body);
}

export async function getProfileBookmarks(memberId: number, signal?: AbortSignal): Promise<MyPagePost[]> {
  const body: unknown = await apiClient<unknown>(`/profile/${memberId}/bookmarks`, { signal });
  return normalizeMyPagePosts(body);
}

export function editProfile(memberId: number, payload: ProfileEditRequest): Promise<void> {
  return apiClient<void>(`/profile/${memberId}/edit`, {
    method: "POST",
    body: payload,
  });
}

function normalizeFollowMember(body: unknown): FollowMember | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const id = asNumber(record.id) || asNumber(record.memberId);
  if (id === 0) {
    return null;
  }
  return {
    id,
    nickname: asString(record.nickname) || asString(record.name),
    profileImage: asNullableString(record.profileImage),
  };
}

function normalizeFollowMembers(body: unknown): FollowMember[] {
  const list = Array.isArray(body)
    ? body
    : typeof body === "object" && body !== null && "content" in body && Array.isArray((body as { content: unknown }).content)
      ? (body as { content: unknown[] }).content
      : [];
  return list.map(normalizeFollowMember).filter((item): item is FollowMember => item !== null);
}

function isMissingFollowApi(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.status === 404 || error.status === 405) {
    return true;
  }
  return error.message.includes("No static resource");
}

async function getFollowList(path: string, signal?: AbortSignal): Promise<FollowMember[]> {
  try {
    const body: unknown = await apiClient<unknown>(path, { signal });
    return normalizeFollowMembers(body);
  } catch (error: unknown) {
    if (isMissingFollowApi(error)) {
      return [];
    }
    throw error;
  }
}

export function getFollowers(memberId: number, signal?: AbortSignal): Promise<FollowMember[]> {
  return getFollowList(`/profile/${memberId}/followers`, signal);
}

export function getFollowings(memberId: number, signal?: AbortSignal): Promise<FollowMember[]> {
  return getFollowList(`/profile/${memberId}/followings`, signal);
}

export function removeFollower(memberId: number, targetId: number): Promise<void> {
  return apiClient<void>(`/profile/${memberId}/followers/${targetId}`, {
    method: "DELETE",
  });
}
