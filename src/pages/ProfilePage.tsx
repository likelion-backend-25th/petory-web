import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { deleteQna } from "@/api/qna";
import { deletePost } from "@/api/posts";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { OtherProfileActions } from "@/components/OtherProfileActions";
import { ProfileHero } from "@/components/ProfileHero";
import { ProfilePostGrid } from "@/components/ProfilePostGrid";
import { useProfile } from "@/hooks/useProfile";
import { useProfilePosts, type ProfileTab } from "@/hooks/useProfilePosts";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import { useIsSubscribedTo } from "@/stores/useSubscriptionStore";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "my", label: "MY" },
  { id: "qna", label: "Q&A" },
  { id: "scrap", label: "스크랩" },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { profile, status, errorMessage } = useProfile(memberId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const viewerSubscribed = useIsSubscribedTo(profile?.id ?? null);
  const isOwn = profile !== null && myId !== null && myId > 0 && myId === profile.id;
  const [tab, setTab] = useState<ProfileTab>("my");
  const [followers, setFollowers] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const list = useProfilePosts(profile?.id ?? null, isOwn ? tab : "my", isOwn);

  useEffect(() => {
    if (profile !== null) {
      setFollowers(profile.followers);
    }
  }, [profile]);

  useEffect(() => {
    setTab("my");
  }, [memberId]);

  if (status === "loading") {
    return <p className="text-neutral-500">프로필을 불러오는 중...</p>;
  }

  if (status === "error" || profile === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">프로필을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="text-sm underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }

  const shown = { ...profile, followers };

  const confirmDelete = async (): Promise<void> => {
    if (deleteId === null) {
      return;
    }
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      if (tab === "qna") {
        await deleteQna(deleteId);
      } else {
        await deletePost(deleteId);
      }
      list.removePost(deleteId);
      setDeleteId(null);
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <ProfileHero
        profile={shown}
        isOwn={isOwn}
        actions={
          isOwn ? undefined : (
            <OtherProfileActions
              memberId={profile.id}
              nickname={profile.nickname}
              initialFollowing={profile.isFollowing}
              onFollowChange={(following) => {
                setFollowers((count) => Math.max(0, count + (following ? 1 : -1)));
              }}
            />
          )
        }
      />

      {isOwn ? (
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border-2 border-neutral-900">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "h-12 text-sm font-semibold",
                tab === item.id ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-50",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {list.status === "loading" ? <p className="text-sm text-neutral-500">게시글을 불러오는 중...</p> : null}
      {list.status === "error" ? <p className="text-sm text-red-600">{list.errorMessage}</p> : null}
      {list.status === "success" ? (
        <ProfilePostGrid
          posts={list.posts}
          handle={profile.nickname}
          canManage={isOwn && tab !== "scrap"}
          isOwn={isOwn}
          viewerSubscribed={viewerSubscribed}
          detailPath={(postId) => (tab === "qna" ? `/qna/${postId}` : `/posts/${postId}`)}
          onEdit={(postId) => void navigate(tab === "qna" ? `/qna/${postId}/edit` : `/posts/${postId}/edit`)}
          onDelete={setDeleteId}
        />
      ) : null}
      {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}

      <DeleteConfirmModal
        open={deleteId !== null}
        busy={deleteBusy}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  );
}
