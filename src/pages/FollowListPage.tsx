import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getFollowers, getFollowings, removeFollower } from "@/api/profile";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { FollowMemberGrid } from "@/components/FollowMemberGrid";
import { useProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/stores/useAuthStore";
import type { FollowMember } from "@/types/profile";

interface FollowListPageProps {
  kind: "followers" | "followings";
}

export function FollowListPage({ kind }: FollowListPageProps) {
  const { memberId } = useParams();
  const { profile, status, errorMessage } = useProfile(memberId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const isOwn = profile !== null && myId !== null && myId > 0 && myId === profile.id;
  const [members, setMembers] = useState<FollowMember[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "error" | "success">("loading");
  const [listError, setListError] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  useEffect(() => {
    if (profile === null) {
      return;
    }
    const controller = new AbortController();
    setListStatus("loading");
    const load = async (): Promise<void> => {
      try {
        const rows =
          kind === "followers"
            ? await getFollowers(profile.id, controller.signal)
            : await getFollowings(profile.id, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setMembers(rows);
        setListStatus("success");
        setListError(null);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setListStatus("error");
        setListError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };
    void load();
    return () => controller.abort();
  }, [kind, profile]);

  if (status === "loading") {
    return <p className="text-neutral-500">불러오는 중...</p>;
  }
  if (status === "error" || profile === null) {
    return <p className="text-sm text-red-600">{errorMessage}</p>;
  }

  const title = kind === "followers" ? "팔로워 목록" : "팔로잉 목록";
  const count = members.length > 0 ? members.length : kind === "followers" ? profile.followers : profile.followings;

  const confirmRemove = async (): Promise<void> => {
    if (removeId === null) {
      return;
    }
    setRemoveBusy(true);
    try {
      await removeFollower(profile.id, removeId);
      setMembers((prev) => prev.filter((item) => item.id !== removeId));
      setRemoveId(null);
    } catch (error: unknown) {
      setListError(error instanceof Error ? error.message : "알 수 없는 오류");
      setRemoveId(null);
    } finally {
      setRemoveBusy(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <Link to={`/profile/${profile.id}`} className="inline-flex items-center text-sm hover:underline">
        {"< 뒤로가기"}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">
        {title}({count}명)
      </h1>
      <div className="mt-8">
        {listStatus === "loading" ? <p className="text-sm text-neutral-500">목록을 불러오는 중...</p> : null}
        {listStatus === "error" ? <p className="text-sm text-red-600">{listError}</p> : null}
        {listStatus === "success" ? (
          <FollowMemberGrid
            members={members}
            canRemove={isOwn && kind === "followers"}
            onRemove={setRemoveId}
          />
        ) : null}
      </div>
      <DeleteConfirmModal
        open={removeId !== null}
        busy={removeBusy}
        onCancel={() => setRemoveId(null)}
        onConfirm={() => void confirmRemove()}
      />
    </section>
  );
}
