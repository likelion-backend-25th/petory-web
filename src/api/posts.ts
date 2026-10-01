import { apiClient } from "@/lib/apiClient";
import type {
  PostComment,
  PostCreateRequest,
  PostCreateResponse,
  PostDetail,
  PostListSlice,
  PostUpdateRequest,
  LikeToggleResult,
} from "@/types/post";

export interface GetPostsParams {
  lastPostId?: number;
  size?: number;
}

export function getPosts(
  params: GetPostsParams = {},
  signal?: AbortSignal,
): Promise<PostListSlice> {
  return apiClient<PostListSlice>("/posts", {
    signal,
    query: {
      lastPostId: params.lastPostId,
      size: params.size ?? 10,
    },
  });
}

export function searchPosts(
  params: GetPostsParams & { hashtag: string },
  signal?: AbortSignal,
): Promise<PostListSlice> {
  return apiClient<PostListSlice>("/posts/search", {
    signal,
    query: {
      hashtag: params.hashtag,
      lastPostId: params.lastPostId,
      size: params.size ?? 10,
    },
  });
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

export async function getPost(postId: number, signal?: AbortSignal): Promise<PostDetail> {
  const raw = await apiClient<PostDetail & { comments?: unknown }>(`/posts/${postId}`, { signal });
  return { ...raw, comments: readComments(raw.comments) };
}

export function createPost(payload: PostCreateRequest): Promise<PostCreateResponse> {
  return apiClient<PostCreateResponse>("/posts", {
    method: "POST",
    body: payload,
  });
}

export function updatePost(postId: number, payload: PostUpdateRequest): Promise<void> {
  return apiClient<void>(`/posts/${postId}`, {
    method: "PUT",
    body: payload,
  });
}

export function createComment(postId: number, content: string): Promise<PostComment> {
  return apiClient<PostComment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
  });
}

export function updateComment(postId: number, commentId: number, content: string): Promise<PostComment> {
  return apiClient<PostComment>(`/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    body: { content },
  });
}

export function deleteComment(postId: number, commentId: number): Promise<void> {
  return apiClient<void>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export async function toggleLike(postId: number): Promise<LikeToggleResult> {
  const body: unknown = await apiClient<unknown>(`/posts/${postId}/likes`, { method: "POST" });
  if (typeof body !== "object" || body === null) {
    throw new Error("좋아요 응답을 해석할 수 없습니다.");
  }
  const record = body as Record<string, unknown>;
  if (typeof record.liked !== "boolean" || typeof record.likeCount !== "number") {
    throw new Error("좋아요 응답을 해석할 수 없습니다.");
  }
  return { liked: record.liked, likeCount: record.likeCount };
}

export function deletePost(postId: number): Promise<void> {
  return apiClient<void>(`/posts/${postId}`, {
    method: "DELETE",
  });
}
