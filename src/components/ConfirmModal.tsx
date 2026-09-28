interface ConfirmModalProps {
  open: boolean;
  busy: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  busy,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-sm rounded-xl border-2 border-neutral-900 bg-white p-5">
        <h2 id="confirm-title" className="text-center text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-500">{description}</p>
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
            {busy ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
