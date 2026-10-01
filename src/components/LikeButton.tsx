import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { toggleLike } from "@/api/posts";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/useAuthStore";

interface LikeButtonProps {
  postId: number;
  likeCount: number;
  from: string;
  iconClassName?: string;
}

export function LikeButton({ postId, likeCount, from, iconClassName = "size-4" }: LikeButtonProps) {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const [override, setOverride] = useState<{ postId: number; liked: boolean; count: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = override !== null && override.postId === postId ? override : null;
  const liked = current?.liked ?? false;
  const count = current?.count ?? likeCount;

  const onClick = async (): Promise<void> => {
    if (!isLoggedIn) {
      void navigate("/login", { state: { from } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await toggleLike(postId);
      setOverride({ postId, liked: result.liked, count: result.likeCount });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        aria-pressed={liked}
        aria-label="좋아요"
        disabled={busy}
        className={cn("inline-flex items-center gap-1 disabled:opacity-50", liked && "text-red-500")}
        onClick={() => void onClick()}
      >
        <Heart className={cn(iconClassName, liked && "fill-current")} />
        {count}
      </button>
      {error ? <span className="mt-1 max-w-40 text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
