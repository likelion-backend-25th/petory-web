import { SnackSupportForm } from "@/components/SnackSupportForm";

interface SnackSupportModalProps {
  open: boolean;
  targetMemberId: number;
  targetNickname: string;
  onClose: () => void;
}

export function SnackSupportModal({ open, targetMemberId, targetNickname, onClose }: SnackSupportModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div role="dialog" aria-modal="true" aria-labelledby="snack-title" className="w-full max-w-md">
        <SnackSupportForm targetMemberId={targetMemberId} targetNickname={targetNickname} />
        <button
          type="button"
          className="mt-3 h-9 w-full rounded-md border-2 border-neutral-900 bg-white text-sm hover:bg-neutral-50"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
