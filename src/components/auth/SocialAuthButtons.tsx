interface SocialAuthButtonsProps {
  onGoogle: () => void;
  onKakao: () => void;
}

export function SocialAuthButtons({ onGoogle, onKakao }: SocialAuthButtonsProps) {
  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      <button
        type="button"
        aria-label="구글로 계속하기"
        onClick={onGoogle}
        className="flex size-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-white text-lg font-bold hover:bg-neutral-50"
      >
        G
      </button>
      <button
        type="button"
        aria-label="카카오로 계속하기"
        onClick={onKakao}
        className="flex size-12 items-center justify-center rounded-full border-2 border-neutral-900 bg-[#FEE500] text-lg font-bold hover:bg-[#f5dc00]"
      >
        K
      </button>
    </div>
  );
}
