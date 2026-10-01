import { apiClient } from "@/lib/apiClient";
import type {
  PostComment,
  PostCreateRequest,
  PostCreateResponse,
  PostDetail,
  PostListItem,
  PostListSlice,
  PostUpdateRequest,
} from "@/types/post";

export interface GetQnaParams {
  lastPostId?: number;
  size?: number;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeListItem(item: PostListItem): PostListItem {
  return {
    ...item,
    hashtags: item.hashtags ?? "",
    imageUrls: asStringArray(item.imageUrls),
    viewCount: typeof item.viewCount === "number" ? item.viewCount : null,
  };
}

function normalizeSlice(body: PostListSlice): PostListSlice {
  return {
    content: (body.content ?? []).map(normalizeListItem),
    hasNext: body.hasNext === true,
    lastPostId: body.lastPostId ?? null,
  };
}

function readComments(value: unknown): PostComment[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is PostComment => {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const row = item as Record<string, unknown>;
    return typeof row.id === "number" && typeof row.content === "string";
  });
}

export async function getQnaPosts(params: GetQnaParams = {}, signal?: AbortSignal): Promise<PostListSlice> {
  const body = await apiClient<PostListSlice>("/qna", {
    signal,
    query: {
      lastPostId: params.lastPostId,
      size: params.size ?? 10,
    },
  });
  return normalizeSlice(body);
}

export async function searchQnaPosts(
  params: GetQnaParams & { hashtag: string },
  signal?: AbortSignal,
): Promise<PostListSlice> {
  const body = await apiClient<PostListSlice>("/qna/search", {
    signal,
    query: {
      hashtag: params.hashtag,
      lastPostId: params.lastPostId,
      size: params.size ?? 10,
    },
  });
  return normalizeSlice(body);
}

export async function getQna(postId: number, signal?: AbortSignal): Promise<PostDetail> {
  const raw = await apiClient<PostDetail & { comments?: unknown }>(`/qna/${postId}`, { signal });
  return {
    ...raw,
    comments: readComments(raw.comments),
    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
  };
}

export function createQna(payload: PostCreateRequest): Promise<PostCreateResponse> {
  return apiClient<PostCreateResponse>("/qna", {
    method: "POST",
    body: payload,
  });
}

export function updateQna(postId: number, payload: PostUpdateRequest): Promise<void> {
  return apiClient<void>(`/qna/${postId}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteQna(postId: number): Promise<void> {
  return apiClient<void>(`/qna/${postId}`, {
    method: "DELETE",
  });
}
