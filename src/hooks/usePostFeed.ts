import { useCallback, useEffect, useRef, useState } from "react";
import { getQnaPosts, searchQnaPosts } from "@/api/qna";
import { getPosts, searchPosts } from "@/api/posts";
import type { PostListItem } from "@/types/post";

export type PostBoard = "feed" | "qna";

export const FEED_PAGE_SIZE = 10;

interface FeedState {
  posts: PostListItem[];
  hasNext: boolean;
  lastPostId: number | null;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
  isLoadingMore: boolean;
}

const initialState: FeedState = {
  posts: [],
  hasNext: false,
  lastPostId: null,
  status: "loading",
  errorMessage: null,
  isLoadingMore: false,
};

function mergePosts(current: PostListItem[], incoming: PostListItem[]): PostListItem[] {
  const seen = new Set(current.map((post) => post.id));
  return [...current, ...incoming.filter((post) => !seen.has(post.id))];
}

function loadPostPage(
  board: PostBoard,
  hashtag: string,
  lastPostId: number | undefined,
  signal?: AbortSignal,
) {
  const params = { lastPostId, size: FEED_PAGE_SIZE };
  if (board === "qna") {
    return hashtag !== "" ? searchQnaPosts({ ...params, hashtag }, signal) : getQnaPosts(params, signal);
  }
  return hashtag !== "" ? searchPosts({ ...params, hashtag }, signal) : getPosts(params, signal);
}

export function usePostFeed(hashtag = "", board: PostBoard = "feed") {
  const [state, setState] = useState<FeedState>(initialState);
  const stateRef = useRef(state);
  const loadingMoreRef = useRef(false);
  const hashtagRef = useRef(hashtag);
  const boardRef = useRef(board);
  stateRef.current = state;
  hashtagRef.current = hashtag;
  boardRef.current = board;

  useEffect(() => {
    const controller = new AbortController();
    const tag = hashtag;
    const currentBoard = board;
    loadingMoreRef.current = false;
    setState(initialState);

    const loadFirstPage = async (): Promise<void> => {
      try {
        const page = await loadPostPage(currentBoard, tag, undefined, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({
          posts: page.content,
          hasNext: page.hasNext,
          lastPostId: page.lastPostId,
          status: "success",
          errorMessage: null,
          isLoadingMore: false,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        setState({
          ...initialState,
          status: "error",
          errorMessage: message,
        });
      }
    };

    void loadFirstPage();
    return () => controller.abort();
  }, [board, hashtag]);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = stateRef.current;
    const tag = hashtagRef.current;
    const currentBoard = boardRef.current;
    if (
      !current.hasNext ||
      current.lastPostId === null ||
      current.isLoadingMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setState((prev) => ({ ...prev, isLoadingMore: true, errorMessage: null }));

    try {
      const page = await loadPostPage(currentBoard, tag, current.lastPostId);
      if (hashtagRef.current !== tag || boardRef.current !== currentBoard) {
        return;
      }
      setState((prev) => {
        const posts = mergePosts(prev.posts, page.content);
        return {
          ...prev,
          posts,
          hasNext: posts.length > prev.posts.length && page.hasNext,
          lastPostId: page.lastPostId,
          isLoadingMore: false,
        };
      });
    } catch (error: unknown) {
      if (hashtagRef.current !== tag || boardRef.current !== currentBoard) {
        return;
      }
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        errorMessage: message,
      }));
    } finally {
      loadingMoreRef.current = false;
    }
  }, []);

  return { ...state, loadMore };
}
