interface DeleteConfirmModalProps {
  open: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ open, busy, onCancel, onConfirm }: DeleteConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-sm rounded-xl border-2 border-neutral-900 bg-white p-5">
        <h2 id="delete-title" className="text-center text-lg font-semibold">
          정말 삭제하시겠어요?
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">삭제하면 돌이킬 수 없어요</p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            className="h-9 rounded-md border-2 border-neutral-900 px-5 text-sm hover:bg-neutral-50"
            onClick={onCancel}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="button"
            className="h-9 rounded-md border-2 border-neutral-900 bg-neutral-900 px-5 text-sm text-white disabled:opacity-50"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
