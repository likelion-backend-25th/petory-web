import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { createComment } from "@/api/posts";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatPostDate } from "@/lib/postFormat";
import type { PostComment } from "@/types/post";

const PAGE_SIZE = 5;

interface PostCommentPanelProps {
  postId: number;
  comments: PostComment[];
}

export function PostCommentPanel({ postId, comments }: PostCommentPanelProps) {
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const [items, setItems] = useState(comments);
  const [text, setText] = useState("");
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = useMemo(
    () => items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [items, page],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const content = text.trim();
    if (content === "") {
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      const created = await createComment(postId, content);
      setItems((prev) => [...prev, created]);
      setText("");
      setPage(Math.floor(items.length / PAGE_SIZE));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setNotice(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border-2 border-neutral-900 bg-white p-4">
      <h2 className="text-sm font-semibold">댓글</h2>
      {current.length === 0 ? (
        <p className="text-sm text-neutral-400">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {current.map((comment) => (
            <li key={comment.id} className="flex items-start justify-between gap-3 text-sm">
              <p>
                <span className="font-medium">{comment.commenterNickname}</span> {comment.content}
              </p>
              <time className="shrink-0 text-xs text-neutral-400">{formatPostDate(comment.createdAt)}</time>
            </li>
          ))}
        </ul>
      )}
      {pageCount > 1 ? (
        <div className="flex justify-center gap-2 text-sm">
          <button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>
            {"<"}
          </button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>
            {">"}
          </button>
        </div>
      ) : null}
      {isLoggedIn ? (
        <form className="flex gap-2" onSubmit={(event) => void onSubmit(event)}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="댓글을 입력해주세요..."
            className="h-10 min-w-0 flex-1 rounded-md border-2 border-neutral-900 px-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-10 rounded-md border-2 border-neutral-900 px-3 text-sm disabled:opacity-50"
          >
            등록하기
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-500">
          댓글을 쓰려면 <Link to="/login" className="underline">로그인</Link>해 주세요.
        </p>
      )}
      {notice ? <p className="text-xs text-red-600">{notice}</p> : null}
    </section>
  );
}
