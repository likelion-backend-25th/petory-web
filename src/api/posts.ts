import { apiClient } from "@/lib/apiClient";
import type {
  PostComment,
  PostCreateRequest,
  PostCreateResponse,
  PostDetail,
  PostListSlice,
  PostUpdateRequest,
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
