import { useEffect, useState } from "react";
import { getProfileBookmarks, getProfilePosts, getProfileQna } from "@/api/profile";
import type { MyPagePost } from "@/types/profile";

export type ProfileTab = "my" | "qna" | "scrap";

interface TabState {
  posts: MyPagePost[];
  status: "loading" | "error" | "success";
  errorMessage: string | null;
}

export function useProfilePosts(memberId: number | null, tab: ProfileTab, canReadScrap: boolean) {
  const [state, setState] = useState<TabState>({
    posts: [],
    status: "loading",
    errorMessage: null,
  });

  useEffect(() => {
    if (memberId === null) {
      setState({ posts: [], status: "error", errorMessage: "올바르지 않은 회원입니다." });
      return;
    }
    if (tab === "scrap" && !canReadScrap) {
      setState({ posts: [], status: "error", errorMessage: "북마크는 본인만 볼 수 있습니다." });
      return;
    }

    const controller = new AbortController();
    setState({ posts: [], status: "loading", errorMessage: null });

    const load = async (): Promise<void> => {
      try {
        const fetcher = tab === "qna" ? getProfileQna : tab === "scrap" ? getProfileBookmarks : getProfilePosts;
        const posts = await fetcher(memberId, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({ posts, status: "success", errorMessage: null });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        setState({ posts: [], status: "error", errorMessage: message });
      }
    };

    void load();
    return () => controller.abort();
  }, [canReadScrap, memberId, tab]);

  const removePost = (postId: number): void => {
    setState((prev) => ({ ...prev, posts: prev.posts.filter((post) => post.id !== postId) }));
  };

  return { ...state, removePost };
}
