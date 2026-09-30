import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { createComment, deleteComment, updateComment } from "@/api/posts";
import { PostCommentItem } from "@/components/PostCommentItem";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PostComment } from "@/types/post";

const PAGE_SIZE = 5;

interface PostCommentPanelProps {
  postId: number;
  comments: PostComment[];
  onCountChange?: (count: number) => void;
}

export function PostCommentPanel({ postId, comments, onCountChange }: PostCommentPanelProps) {
  const isLoggedIn = useAuthStore((state) => state.accessToken) !== null;
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [items, setItems] = useState(comments);
  const [text, setText] = useState("");
  const [page, setPage] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const current = useMemo(
    () => items.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE),
    [items, safePage],
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
      const next = [...items, created];
      setItems(next);
      setText("");
      setPage(Math.floor((next.length - 1) / PAGE_SIZE));
      onCountChange?.(next.length);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (comment: PostComment): void => {
    setNotice(null);
    setEditingId(comment.id);
    setDraft(comment.content);
  };

  const saveEdit = async (comment: PostComment): Promise<void> => {
    const content = draft.trim();
    if (content === "") {
      setNotice("댓글 내용을 입력해 주세요.");
      return;
    }
    if (content === comment.content) {
      setEditingId(null);
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      const updated = await updateComment(postId, comment.id, content);
      setItems((prev) => prev.map((item) => (item.id === comment.id ? { ...item, ...updated, content } : item)));
      setEditingId(null);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (comment: PostComment): Promise<void> => {
    if (!window.confirm("이 댓글을 삭제할까요?")) {
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      await deleteComment(postId, comment.id);
      const next = items.filter((item) => item.id !== comment.id);
      setItems(next);
      if (editingId === comment.id) {
        setEditingId(null);
      }
      onCountChange?.(next.length);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
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
            <PostCommentItem
              key={comment.id}
              comment={comment}
              isMine={myId !== null && myId === comment.commenterId}
              editing={editingId === comment.id}
              draft={draft}
              busy={busy}
              onDraftChange={setDraft}
              onStartEdit={() => startEdit(comment)}
              onCancelEdit={() => setEditingId(null)}
              onSave={() => void saveEdit(comment)}
              onDelete={() => void remove(comment)}
            />
          ))}
        </ul>
      )}
      {pageCount > 1 ? (
        <div className="flex justify-center gap-2 text-sm">
          <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            {"<"}
          </button>
          <span>
            {safePage + 1} / {pageCount}
          </span>
          <button type="button" disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
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
          댓글을 쓰려면{" "}
          <Link to="/login" className="underline">
            로그인
          </Link>
          해 주세요.
        </p>
      )}
      {notice ? <p className="text-xs text-red-600">{notice}</p> : null}
    </section>
  );
}
