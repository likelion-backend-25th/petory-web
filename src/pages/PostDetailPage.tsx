import { useState } from "react";
import { Link, useParams } from "react-router";
import { Bookmark, Eye, Heart, Share2 } from "lucide-react";
import { PostCommentPanel } from "@/components/PostCommentPanel";
import { PostGallery } from "@/components/PostGallery";
import { usePostDetail } from "@/hooks/usePostDetail";
import { formatPostDate, isSubscriberOnly, parseHashtags, toHandle } from "@/lib/postFormat";

export function PostDetailPage() {
  const { postId } = useParams();
  const { post, status, errorMessage } = usePostDetail(postId);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  if (status === "loading") {
    return <p className="text-neutral-500">게시글을 불러오는 중...</p>;
  }

  if (status === "error" || post === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">게시글을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="inline-block text-sm font-medium underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }

  const tags = parseHashtags(post.hashtags);

  const share = async (): Promise<void> => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.content, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage("링크를 복사했습니다.");
    } catch {
      setShareMessage("공유를 취소했습니다.");
    }
  };

  return (
    <article className="mx-auto w-full max-w-lg space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/profile/${post.memberId}`} className="truncate font-medium hover:underline">
            {toHandle(post.authorName)}
          </Link>
          <p className="text-xs text-neutral-500">{formatPostDate(post.createdAt)}</p>
        </div>
        {isSubscriberOnly(post.isSubscriberOnly) ? (
          <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
            구독자 전용
          </span>
        ) : null}
      </header>

      <PostGallery imageUrls={[]} alt={post.content} credit={post.authorName} />

      <div className="flex items-center justify-between text-neutral-600">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="공유" onClick={() => void share()}>
            <Share2 className="size-5" />
          </button>
          <button
            type="button"
            aria-label="북마크"
            className={saved ? "text-neutral-900" : undefined}
            onClick={() => setSaved((value) => !value)}
          >
            <Bookmark className={`size-5 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            aria-label="좋아요"
            className={`inline-flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
            onClick={() => setLiked((value) => !value)}
          >
            <Heart className={`size-5 ${liked ? "fill-current" : ""}`} />
          </button>
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <Eye className="size-5" aria-hidden />
          </span>
        </div>
      </div>
      {shareMessage ? <p className="text-xs text-neutral-500">{shareMessage}</p> : null}

      <div className="space-y-2">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
        <p className="text-xs text-neutral-400">{formatPostDate(post.createdAt)}</p>
      </div>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <PostCommentPanel />
    </article>
  );
}
