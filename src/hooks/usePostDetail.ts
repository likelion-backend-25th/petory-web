import { useEffect, useState } from "react";
import { getPost, getPosts } from "@/api/posts";
import type { PostComment, PostDetail, PostListItem } from "@/types/post";

export interface PostDetailView extends PostDetail {
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  neighbors: { prevId: number | null; nextId: number | null };
}

interface PostDetailState {
  post: PostDetailView | null;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
}

const initialState: PostDetailState = {
  post: null,
  status: "loading",
  errorMessage: null,
};

function parsePostId(value: string | undefined): number | null {
  if (value === undefined || !/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

function neighborsOf(postId: number, list: PostListItem[]): { prevId: number | null; nextId: number | null } {
  const ids = list.map((item) => item.id);
  const index = ids.indexOf(postId);
  if (index < 0) {
    return { prevId: null, nextId: null };
  }
  return {
    prevId: ids[index + 1] ?? null,
    nextId: ids[index - 1] ?? null,
  };
}

export function usePostDetail(postIdParam: string | undefined) {
  const postId = parsePostId(postIdParam);
  const [state, setState] = useState<PostDetailState>(initialState);

  useEffect(() => {
    if (postId === null) {
      setState({ post: null, status: "error", errorMessage: "올바르지 않은 게시글입니다." });
      return;
    }

    const controller = new AbortController();
    setState(initialState);

    const load = async (): Promise<void> => {
      try {
        const [detail, slice] = await Promise.all([
          getPost(postId, controller.signal),
          getPosts({ size: 30 }, controller.signal),
        ]);
        if (controller.signal.aborted) {
          return;
        }
        const listed = slice.content.find((item) => item.id === postId);
        const comments: PostComment[] = detail.comments;
        setState({
          post: {
            ...detail,
            imageUrls: listed?.imageUrls ?? [],
            likeCount: listed?.likeCount ?? 0,
            commentCount: listed?.commentCount ?? comments.length,
            neighbors: neighborsOf(postId, slice.content),
          },
          status: "success",
          errorMessage: null,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        setState({ post: null, status: "error", errorMessage: message });
      }
    };

    void load();
    return () => controller.abort();
  }, [postId]);

  return state;
}
