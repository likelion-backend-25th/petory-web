import type { FormEvent } from "react";
import { formatPostDate } from "@/lib/postFormat";
import type { PostComment } from "@/types/post";

interface PostCommentItemProps {
  comment: PostComment;
  isMine: boolean;
  editing: boolean;
  draft: string;
  busy: boolean;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export function PostCommentItem({
  comment,
  isMine,
  editing,
  draft,
  busy,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: PostCommentItemProps) {
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSave();
  };

  return (
    <li className="flex items-start justify-between gap-3 px-3 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <p>
          <span className="font-medium">{comment.commenterNickname}</span>
          {editing ? null : ` ${comment.content}`}
        </p>
        {editing ? (
          <form className="mt-2 flex gap-2" onSubmit={onSubmit}>
            <input
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              className="h-9 min-w-0 flex-1 rounded-md border-2 border-neutral-900 px-2 text-sm outline-none"
              aria-label="댓글 수정"
            />
            <button
              type="submit"
              disabled={busy}
              className="h-9 rounded-md border-2 border-neutral-900 px-2 text-xs disabled:opacity-50"
            >
              저장
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onCancelEdit}
              className="h-9 rounded-md border-2 border-neutral-900 px-2 text-xs disabled:opacity-50"
            >
              취소
            </button>
          </form>
        ) : null}
        {isMine && !editing ? (
          <div className="mt-1 flex gap-2 text-xs text-neutral-500">
            <button type="button" className="underline" disabled={busy} onClick={onStartEdit}>
              수정
            </button>
            <button type="button" className="underline" disabled={busy} onClick={onDelete}>
              삭제
            </button>
          </div>
        ) : null}
      </div>
      <time className="shrink-0 text-xs text-neutral-400">{formatPostDate(comment.createdAt)}</time>
    </li>
  );
}
