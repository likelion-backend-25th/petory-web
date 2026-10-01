import { create } from "zustand";
import { getProfileBookmarks } from "@/api/profile";
import { toggleBookmark } from "@/api/posts";

type BookmarkStatus = "idle" | "loading" | "ready" | "error";

interface BookmarkState {
  ownerId: number | null;
  ids: number[];
  status: BookmarkStatus;
  load: (memberId: number) => Promise<void>;
  toggle: (postId: number) => Promise<boolean>;
  clear: () => void;
}

let pendingLoad: { memberId: number; promise: Promise<void> } | null = null;
let bookmarkVersion = 0;

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  ownerId: null,
  ids: [],
  status: "idle",
  clear: () => {
    pendingLoad = null;
    set({ ownerId: null, ids: [], status: "idle" });
  },
  load: async (memberId) => {
    const current = get();
    if (current.ownerId === memberId && (current.status === "ready" || current.status === "loading" || current.status === "error")) {
      return;
    }
    if (pendingLoad?.memberId === memberId) {
      return pendingLoad.promise;
    }

    const promise = (async () => {
      const requestVersion = bookmarkVersion;
      set({ ownerId: memberId, status: "loading", ids: [] });
      try {
        const posts = await getProfileBookmarks(memberId);
        if (get().ownerId !== memberId || requestVersion !== bookmarkVersion) {
          return;
        }
        set({ ids: posts.map((post) => post.id), status: "ready" });
      } catch {
        if (get().ownerId !== memberId || requestVersion !== bookmarkVersion) {
          return;
        }
        set({ ids: [], status: "error" });
      } finally {
        if (pendingLoad?.memberId === memberId) {
          pendingLoad = null;
        }
      }
    })();

    pendingLoad = { memberId, promise };
    return promise;
  },
  toggle: async (postId) => {
    const result = await toggleBookmark(postId);
    bookmarkVersion += 1;
    set((state) => ({
      status: "ready",
      ids: result.bookmarked
        ? state.ids.includes(postId)
          ? state.ids
          : [...state.ids, postId]
        : state.ids.filter((id) => id !== postId),
    }));
    return result.bookmarked;
  },
}));
