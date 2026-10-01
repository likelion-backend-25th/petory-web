import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { toggleLike } from "@/api/posts";
import { PostCommentPanel } from "@/components/PostCommentPanel";
import { PostGallery } from "@/components/PostGallery";
import type { PostBoard } from "@/hooks/usePostFeed";
import { usePostDetail } from "@/hooks/usePostDetail";
import { formatPostDate, isSubscriberOnly, parseHashtags, toHandle } from "@/lib/postFormat";
import { canViewSubscriberPost } from "@/lib/subscriberAccess";
import { displayViewCount } from "@/lib/viewCounts";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscribedMemberIds } from "@/stores/useSubscriptionStore";

export function PostDetailPage({ board = "feed" }: { board?: PostBoard }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { post, status, errorMessage } = usePostDetail(postId, board);
  const postBase = board === "qna" ? "/qna" : "/posts";
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const subscribedAuthorIds = useSubscribedMemberIds();
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const [likeState, setLikeState] = useState<{ postId: number; liked: boolean; count: number } | null>(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [countOverride, setCountOverride] = useState<{ postId: number; count: number } | null>(null);

  const onLike = async (): Promise<void> => {
    if (post === null) {
      return;
    }
    if (!isLoggedIn) {
      void navigate("/login", { state: { from: `${postBase}/${post.id}` } });
      return;
    }
    setLikeBusy(true);
    setLikeError(null);
    try {
      const result = await toggleLike(post.id);
      setLikeState({ postId: post.id, liked: result.liked, count: result.likeCount });
    } catch (error: unknown) {
      setLikeError(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setLikeBusy(false);
    }
  };

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
  const locked = !canViewSubscriberPost(
    isSubscriberOnly(post.isSubscriberOnly),
    post.memberId,
    myId,
    subscribedAuthorIds,
  );
  const subscribePath = `/profile/${post.memberId}/subscribe`;
  const liked = likeState !== null && likeState.postId === post.id ? likeState.liked : false;
  const likeCount = likeState !== null && likeState.postId === post.id ? likeState.count : post.likeCount;
  const commentCount =
    countOverride !== null && countOverride.postId === post.id ? countOverride.count : post.comments.length;

  return (
    <div className="space-y-6">
    <article className="space-y-4 rounded-xl border-2 border-neutral-900 bg-white p-5">
      <header className="flex items-start justify-between gap-3">
        <Link to={`/profile/${post.memberId}`} className="font-medium hover:underline">
          {toHandle(post.authorName)}
        </Link>
        <p className="text-xs text-neutral-500">{formatPostDate(post.createdAt)} 작성</p>
      </header>

      {locked ? (
        <div className="space-y-3 rounded-xl border-2 border-neutral-900 bg-neutral-50 px-6 py-10 text-center">
          <p className="font-medium">구독자 전용 게시글입니다.</p>
          <p className="text-sm text-neutral-600">구독하면 내용을 볼 수 있어요.</p>
          <Link
            to={isLoggedIn ? subscribePath : "/login"}
            state={isLoggedIn ? undefined : { from: subscribePath }}
            className="inline-flex h-9 items-center justify-center rounded-md border-2 border-neutral-900 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
          >
            팬클럽 구독
          </Link>
        </div>
      ) : (
        <PostGallery imageUrls={post.imageUrls} alt={post.content} credit={post.authorName} />
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-2">
          {post.neighbors.prevId !== null ? (
            <Link to={`${postBase}/${post.neighbors.prevId}`} className="rounded-md border-2 border-neutral-900 px-2 py-1">
              이전게시글
            </Link>
          ) : null}
          {post.neighbors.nextId !== null ? (
            <Link to={`${postBase}/${post.neighbors.nextId}`} className="rounded-md border-2 border-neutral-900 px-2 py-1">
              다음게시글
            </Link>
          ) : null}
        </div>
        <div className="flex items-center gap-3 text-neutral-600">
          <button
            type="button"
            aria-pressed={liked}
            aria-label="좋아요"
            disabled={likeBusy}
            className={`inline-flex items-center gap-1 disabled:opacity-50 ${liked ? "text-red-500" : ""}`}
            onClick={() => void onLike()}
          >
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </button>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-4" />
            {commentCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="size-4" aria-hidden />
            조회 {displayViewCount(post.id, post.viewCount)}
          </span>
        </div>
      </div>
      {likeError ? <p className="text-xs text-red-600">{likeError}</p> : null}

      {locked ? null : (
        <>
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
            <Link to={`${postBase}/${post.id}/edit`} className="inline-block text-sm underline">
              수정하기
            </Link>
          ) : null}
        </>
      )}
    </article>

    {locked ? null : (
    <PostCommentPanel
      key={post.id}
      postId={post.id}
      comments={post.comments}
      onCountChange={(count) => setCountOverride({ postId: post.id, count })}
    />
    )}
    </div>
  );
}
