import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Bookmark } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBookmarkStore } from "@/stores/useBookmarkStore";

interface BookmarkButtonProps {
  postId: number;
  from: string;
}

export function BookmarkButton({ postId, from }: BookmarkButtonProps) {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const bookmarked = useBookmarkStore((state) => state.ids.includes(postId));
  const load = useBookmarkStore((state) => state.load);
  const clear = useBookmarkStore((state) => state.clear);
  const toggle = useBookmarkStore((state) => state.toggle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId === null || userId <= 0) {
      clear();
      return;
    }
    void load(userId);
  }, [clear, load, userId]);

  const onClick = async (): Promise<void> => {
    if (!isLoggedIn) {
      void navigate("/login", { state: { from } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await toggle(postId);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        aria-pressed={bookmarked}
        aria-label={bookmarked ? "북마크 해제" : "북마크"}
        disabled={busy}
        className={`inline-flex items-center disabled:opacity-50 ${bookmarked ? "text-neutral-900" : ""}`}
        onClick={() => void onClick()}
      >
        <Bookmark className={`size-4 ${bookmarked ? "fill-current" : ""}`} />
      </button>
      {error ? <span className="mt-1 max-w-40 text-right text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
