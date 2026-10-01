import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useProfile } from "@/hooks/useProfile";
import { FANCLUB_MONTHLY_AMOUNT, FANCLUB_ORDER_NAME, FANCLUB_PLAN_NAME, FANCLUB_PLAN_PERK } from "@/lib/fanclub";
import { PaymentCanceledError, startPortOnePayment } from "@/lib/portonePayment";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PaymentCompleteResult } from "@/types/payment";

function won(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function resultText(result: PaymentCompleteResult): string {
  if (result.status === "PAID" && result.paidAmount !== null) {
    return `${won(result.paidAmount)}원 팬클럽 구독이 완료되었습니다.`;
  }
  if (result.status === "READY") {
    return "결제 대기 중입니다.";
  }
  return result.message;
}

export function SubscribePage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { profile, status, errorMessage } = useProfile(memberId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (status === "loading") {
    return <p className="text-neutral-500">불러오는 중...</p>;
  }
  if (status === "error" || profile === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">구독할 프로필을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="text-sm underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }
  if (myId !== null && myId === profile.id) {
    return <Navigate to="/subscriptions" replace />;
  }

  const onSubscribe = async (): Promise<void> => {
    if (!agreed) {
      setIsError(true);
      setNotice("월 정기 결제 안내를 확인해 주세요.");
      return;
    }
    setBusy(true);
    setNotice(null);
    setIsError(false);
    try {
      const result = await startPortOnePayment({
        targetMemberId: profile.id,
        totalAmount: FANCLUB_MONTHLY_AMOUNT,
        orderName: FANCLUB_ORDER_NAME,
        merchandise: "automaticPayment",
      });
      if (result === null) {
        setNotice("결제창으로 이동합니다.");
        return;
      }
      setIsError(result.status !== "PAID");
      setNotice(resultText(result));
    } catch (error: unknown) {
      setIsError(true);
      if (error instanceof PaymentCanceledError) {
        setNotice(error.message);
        return;
      }
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-2xl font-semibold">구독하기</h1>
      <div className="mt-5 overflow-hidden rounded-md border-2 border-neutral-900">
        <p className="border-b-2 border-neutral-900 px-4 py-3 text-center font-medium">{FANCLUB_PLAN_NAME}</p>
        <div className="px-4 py-6 text-center">
          <p className="text-2xl font-semibold">월 {won(FANCLUB_MONTHLY_AMOUNT)}원</p>
          <p className="mt-3 text-sm text-neutral-600">· {FANCLUB_PLAN_PERK}</p>
        </div>
      </div>
      <label className="mt-5 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-neutral-900"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        월 정기 결제 안내를 확인했습니다.
      </label>
      <div className="mt-5 overflow-hidden rounded-md border-2 border-neutral-900">
        <p className="border-b-2 border-neutral-900 px-4 py-3 text-center font-medium">결제 정보</p>
        <dl className="grid grid-cols-2 gap-y-3 px-8 py-5 text-sm">
          <dt className="text-neutral-500">대상</dt>
          <dd className="text-right font-medium">{profile.nickname}</dd>
          <dt className="text-neutral-500">월 구독료</dt>
          <dd className="text-right font-medium">{won(FANCLUB_MONTHLY_AMOUNT)}원</dd>
        </dl>
      </div>
      {notice ? <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{notice}</p> : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="h-11 rounded-md border-2 border-neutral-900 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          onClick={() => void onSubscribe()}
          disabled={busy}
        >
          {busy ? "결제 중..." : "구독 하기"}
        </button>
        <button
          type="button"
          className="h-11 rounded-md border-2 border-neutral-900 text-sm font-medium hover:bg-neutral-50"
          onClick={() => void navigate(`/profile/${profile.id}`)}
          disabled={busy}
        >
          취소하기
        </button>
      </div>
    </section>
  );
}
