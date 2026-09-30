import { useState } from "react";
import { Link, useParams } from "react-router";
import { Heart, MessageCircle } from "lucide-react";
import { PostCommentPanel } from "@/components/PostCommentPanel";
import { PostGallery } from "@/components/PostGallery";
import { usePostDetail } from "@/hooks/usePostDetail";
import { formatPostDate, isSubscriberOnly, parseHashtags, toHandle } from "@/lib/postFormat";
import { useAuthStore } from "@/stores/useAuthStore";

export function PostDetailPage() {
  const { postId } = useParams();
  const { post, status, errorMessage } = usePostDetail(postId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [liked, setLiked] = useState(false);
  const [countOverride, setCountOverride] = useState<{ postId: number; count: number } | null>(null);

  if (status === "loading") {
    return <p className="text-neutral-500">게시글을 불러오는 중...</p>;
  }

  if (status === "error" || post === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">게시글을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="text-sm underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }

  const tags = parseHashtags(post.hashtags);
  const isOwner = myId !== null && myId > 0 && myId === post.memberId;
  const likeCount = post.likeCount + (liked ? 1 : 0);
  const commentCount =
    countOverride !== null && countOverride.postId === post.id ? countOverride.count : post.comments.length;

  return (
    <article className="space-y-4 rounded-xl border-2 border-neutral-900 bg-white p-5">
      <header className="flex items-start justify-between gap-3">
        <Link to={`/profile/${post.memberId}`} className="font-medium hover:underline">
          {toHandle(post.authorName)}
        </Link>
        <p className="text-xs text-neutral-500">{formatPostDate(post.createdAt)} 작성</p>
      </header>

      <PostGallery imageUrls={post.imageUrls} alt={post.content} credit={post.authorName} />

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-2">
          {post.neighbors.prevId !== null ? (
            <Link to={`/posts/${post.neighbors.prevId}`} className="rounded-md border-2 border-neutral-900 px-2 py-1">
              이전게시글
            </Link>
          ) : null}
          {post.neighbors.nextId !== null ? (
            <Link to={`/posts/${post.neighbors.nextId}`} className="rounded-md border-2 border-neutral-900 px-2 py-1">
              다음게시글
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-neutral-600">
          <button
            type="button"
            className={`inline-flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
            onClick={() => setLiked((value) => !value)}
          >
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </button>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-4" />
            {commentCount}
          </span>
        </div>
      </div>

      {isSubscriberOnly(post.isSubscriberOnly) ? (
        <p className="text-xs text-neutral-500">구독자 전용 게시글</p>
      ) : null}

      <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
      <p className="text-xs text-neutral-400">{formatPostDate(post.createdAt)}</p>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag} className="rounded-md border-2 border-neutral-900 px-2 py-1 text-xs">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {isOwner ? (
        <Link to={`/posts/${post.id}/edit`} className="inline-block text-sm underline">
          수정하기
        </Link>
      ) : null}

      <PostCommentPanel
        key={post.id}
        postId={post.id}
        comments={post.comments}
        onCountChange={(count) => setCountOverride({ postId: post.id, count })}
      />
    </article>
  );
}
