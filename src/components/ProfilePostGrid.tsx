import { Link } from "react-router";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { toHandle } from "@/lib/postFormat";
import type { MyPagePost } from "@/types/profile";

interface ProfilePostGridProps {
  posts: MyPagePost[];
  handle: string;
  canManage: boolean;
  isOwn: boolean;
  viewerSubscribed: boolean;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
  detailPath?: (postId: number) => string;
}

function lockLabel(post: MyPagePost, isOwn: boolean, viewerSubscribed: boolean): string | null {
  if (isOwn) {
    return null;
  }
  if (post.isSponsorOnly) {
    return "후원자들을 위한 사진";
  }
  if (post.isSubscriberOnly && !viewerSubscribed) {
    return "구독하면 볼 수 있어요.";
  }
  return null;
}

function PostFace({ post, label }: { post: MyPagePost; label: string | null }) {
  if (label !== null) {
    return (
      <div className="flex aspect-square items-center justify-center bg-neutral-100 px-4 text-center text-sm font-medium">
        {label}
      </div>
    );
  }
  if (post.imageUrl) {
    return <img src={post.imageUrl} alt="" className="aspect-square w-full object-cover" />;
  }
  return (
    <div className="flex aspect-square items-center justify-center bg-neutral-100 px-3 text-center text-xs text-neutral-400">
      {post.content || "이미지 없음"}
    </div>
  );
}

export function ProfilePostGrid({
  posts,
  handle,
  canManage,
  isOwn,
  viewerSubscribed,
  onEdit,
  onDelete,
  detailPath = (postId) => `/posts/${postId}`,
}: ProfilePostGridProps) {
  if (posts.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-500">게시글이 없습니다.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const label = lockLabel(post, isOwn, viewerSubscribed);
        return (
          <li key={post.id} className="group relative">
            <Link
              to={detailPath(post.id)}
              className="block overflow-hidden rounded-xl border-2 border-neutral-900 bg-white"
            >
              <PostFace post={post} label={label} />
              {label !== null ? null : (
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <span className="truncate">{toHandle(handle)}</span>
                  <span className="inline-flex items-center gap-2 text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3" aria-hidden />
                      {post.likeCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="size-3" aria-hidden />
                      {post.commentCount}
                    </span>
                    <Bookmark className="size-3" aria-hidden />
                  </span>
                </div>
              )}
            </Link>
            {canManage ? (
              <div className="absolute top-2 left-2 hidden gap-1 group-hover:flex">
                <button
                  type="button"
                  className="rounded-md border-2 border-neutral-900 bg-white px-2 py-1 text-xs"
                  onClick={() => onDelete(post.id)}
                >
                  삭제
                </button>
                <button
                  type="button"
                  className="rounded-md border-2 border-neutral-900 bg-white px-2 py-1 text-xs"
                  onClick={() => onEdit(post.id)}
                >
                  수정
                </button>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
