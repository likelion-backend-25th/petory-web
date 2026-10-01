import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { followMember, unfollowMember } from "@/api/follow";
import { SnackSupportModal } from "@/components/SnackSupportModal";
import { cn } from "@/lib/cn";

interface OtherProfileActionsProps {
  memberId: number;
  nickname: string;
  initialFollowing: boolean;
  onFollowChange: (following: boolean) => void;
}

const actionClass =
  "inline-flex h-9 items-center justify-center gap-1 rounded-md border-2 border-neutral-900 px-4 text-sm font-medium hover:bg-neutral-50";

export function OtherProfileActions({
  memberId,
  nickname,
  initialFollowing,
  onFollowChange,
}: OtherProfileActionsProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followBusy, setFollowBusy] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing, memberId]);

  const toggleFollow = async (): Promise<void> => {
    setFollowBusy(true);
    setFollowError(null);
    const next = !following;
    try {
      if (next) {
        await followMember(memberId);
      } else {
        await unfollowMember(memberId);
      }
      setFollowing(next);
      onFollowChange(next);
    } catch (error: unknown) {
      setFollowError(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setFollowBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={actionClass} onClick={() => setSnackOpen(true)}>
          간식 쏘기
        </button>
        <Link to={`/profile/${memberId}/subscribe`} className={actionClass}>
          팬클럽 구독
        </Link>
        <button
          type="button"
          className={cn(actionClass, following && "bg-neutral-900 text-white hover:bg-neutral-800")}
          onClick={() => void toggleFollow()}
          disabled={followBusy}
        >
          {following ? "팔로잉" : "팔로우 하기"}
          {following ? null : <Plus className="size-4" aria-hidden />}
        </button>
      </div>
      {followError ? <p className="text-right text-xs text-red-600">{followError}</p> : null}
      <SnackSupportModal
        open={snackOpen}
        targetMemberId={memberId}
        targetNickname={nickname}
        onClose={() => setSnackOpen(false)}
      />
    </div>
  );
}
