import { useState } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle } from "lucide-react";
import { formatPostDate, isSubscriberOnly, parseHashtags } from "@/lib/postFormat";
import type { PostListItem } from "@/types/post";

interface PostCardProps {
  post: PostListItem;
}

function MediaFallback() {
  return (
    <div className="flex aspect-video items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
      이미지를 불러올 수 없습니다
    </div>
  );
}

function PostImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <MediaFallback />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="aspect-video w-full rounded-lg object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function PostCard({ post }: PostCardProps) {
  const tags = parseHashtags(post.hashtags);

  return (
    <article className="space-y-3 rounded-xl border-2 border-neutral-900 bg-white p-4">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/profile/${post.memberId}`} className="truncate font-medium hover:underline">
            {post.nickname}
          </Link>
          <p className="text-xs text-neutral-500">{formatPostDate(post.createdAt)}</p>
        </div>
        {isSubscriberOnly(post.isSubscriberOnly) ? (
          <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
            구독자 전용
          </span>
        ) : null}
      </header>
      <Link to={`/posts/${post.id}`} className="block space-y-3">
        <p className="whitespace-pre-wrap text-neutral-800">{post.content}</p>
        {post.imageUrls.length > 0 ? (
          <div className="grid gap-2">
            {post.imageUrls.map((url) => (
              <PostImage key={url} src={url} alt={post.content} />
            ))}
          </div>
        ) : null}
        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="text-sm text-neutral-500">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <footer className="flex items-center gap-4 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Heart className="size-4" aria-hidden />
            {post.likeCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="size-4" aria-hidden />
            {post.commentCount}
          </span>
        </footer>
      </Link>
    </article>
  );
}
