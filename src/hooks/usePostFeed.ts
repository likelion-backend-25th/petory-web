import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts, searchPosts } from "@/api/posts";
import type { PostListItem, PostListSlice } from "@/types/post";

export const FEED_PAGE_SIZE = 3;

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

function resolveHasNext(page: PostListSlice): boolean {
  if (page.hasNext) {
    return true;
  }
  // 서버 hasNext가 false여도 페이지가 가득 차면 다음 커서를 한 번 더 확인한다.
  return page.content.length >= FEED_PAGE_SIZE;
}

function mergePosts(current: PostListItem[], incoming: PostListItem[]): PostListItem[] {
  const seen = new Set(current.map((post) => post.id));
  return [...current, ...incoming.filter((post) => !seen.has(post.id))];
}

function loadPostPage(hashtag: string, lastPostId: number | undefined, signal?: AbortSignal) {
  if (hashtag !== "") {
    return searchPosts({ hashtag, lastPostId, size: FEED_PAGE_SIZE }, signal);
  }
  return getPosts({ lastPostId, size: FEED_PAGE_SIZE }, signal);
}

export function usePostFeed(hashtag = "") {
  const [state, setState] = useState<FeedState>(initialState);
  const stateRef = useRef(state);
  const loadingMoreRef = useRef(false);
  const hashtagRef = useRef(hashtag);
  stateRef.current = state;
  hashtagRef.current = hashtag;

  useEffect(() => {
    const controller = new AbortController();
    const tag = hashtag;
    loadingMoreRef.current = false;
    setState(initialState);

    const loadFirstPage = async (): Promise<void> => {
      try {
        const page = await loadPostPage(tag, undefined, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({
          posts: page.content,
          hasNext: resolveHasNext(page),
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
  }, [hashtag]);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = stateRef.current;
    const tag = hashtagRef.current;
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
      const page = await loadPostPage(tag, current.lastPostId);
      if (hashtagRef.current !== tag) {
        return;
      }
      setState((prev) => ({
        ...prev,
        posts: mergePosts(prev.posts, page.content),
        hasNext: resolveHasNext(page),
        lastPostId: page.lastPostId,
        isLoadingMore: false,
      }));
    } catch (error: unknown) {
      if (hashtagRef.current !== tag) {
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
