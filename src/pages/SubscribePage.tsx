import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { getMemberPlans } from "@/api/subscription";
import { useProfile } from "@/hooks/useProfile";
import { FANCLUB_AMOUNTS, FANCLUB_PLAN_PERK, type FanclubAmount } from "@/lib/fanclub";
import { PaymentCanceledError, startFanclubSubscription } from "@/lib/portonePayment";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SubscriptionPlan } from "@/types/subscription";

function won(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function planForAmount(plans: SubscriptionPlan[], amount: number): SubscriptionPlan | null {
  return plans.find((plan) => plan.price === amount) ?? null;
}

export function SubscribePage() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { profile, status, errorMessage } = useProfile(memberId);
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansStatus, setPlansStatus] = useState<"loading" | "error" | "success">("loading");
  const [plansError, setPlansError] = useState<string | null>(null);
  const [amount, setAmount] = useState<FanclubAmount>(1000);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (profile === null) {
      return;
    }
    const controller = new AbortController();
    setPlansStatus("loading");
    setPlansError(null);
    const load = async (): Promise<void> => {
      try {
        const next = await getMemberPlans(profile.id, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setPlans(next);
        setPlansStatus("success");
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setPlans([]);
        setPlansStatus("error");
        setPlansError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };
    void load();
    return () => controller.abort();
  }, [profile]);

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

  const selectedPlan = planForAmount(plans, amount);

  const onSubscribe = async (): Promise<void> => {
    if (paid) {
      return;
    }
    if (!agreed) {
      setIsError(true);
      setNotice("월 정기 결제 안내를 확인해 주세요.");
      return;
    }
    if (selectedPlan === null) {
      setIsError(true);
      setNotice("이 금액의 구독 플랜이 없습니다.");
      return;
    }
    setBusy(true);
    setNotice(null);
    setIsError(false);
    try {
      const result = await startFanclubSubscription({
        targetMemberId: profile.id,
        planId: selectedPlan.id,
        price: selectedPlan.price,
        planName: selectedPlan.planName,
        nickname: profile.nickname,
      });
      if (result === null) {
        setNotice("결제창으로 이동합니다.");
        return;
      }
      setPaid(true);
      setNotice(`${won(result.price)}원 팬클럽 구독이 완료되었습니다.`);
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
      <h1 className="text-2xl font-semibold">팬클럽 구독</h1>
      <p className="mt-2 text-sm text-neutral-600">{profile.nickname}님의 월 구독 금액을 골라 주세요.</p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {FANCLUB_AMOUNTS.map((option) => {
          const available = planForAmount(plans, option) !== null;
          const selected = option === amount;
          return (
            <button
              key={option}
              type="button"
              className={cn(
                "h-16 rounded-md border-2 border-neutral-900 text-sm font-semibold disabled:opacity-50",
                selected ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-50",
              )}
              aria-pressed={selected}
              disabled={busy || paid}
              onClick={() => setAmount(option)}
            >
              {won(option)}원
              {plansStatus === "success" && !available ? (
                <span className="mt-1 block text-xs font-normal">없음</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {plansStatus === "loading" ? <p className="mt-3 text-sm text-neutral-500">플랜을 불러오는 중...</p> : null}
      {plansStatus === "error" ? <p className="mt-3 text-sm text-red-600">{plansError}</p> : null}
      {selectedPlan?.description ? (
        <p className="mt-4 text-sm text-neutral-600">· {selectedPlan.description}</p>
      ) : (
        <p className="mt-4 text-sm text-neutral-600">· {FANCLUB_PLAN_PERK}</p>
      )}
      <label className="mt-5 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-neutral-900"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          disabled={paid}
        />
        월 정기 결제 안내를 확인했습니다.
      </label>
      <div className="mt-5 overflow-hidden rounded-md border-2 border-neutral-900">
        <p className="border-b-2 border-neutral-900 px-4 py-3 text-center font-medium">결제 정보</p>
        <dl className="grid grid-cols-2 gap-y-3 px-8 py-5 text-sm">
          <dt className="text-neutral-500">대상</dt>
          <dd className="text-right font-medium">{profile.nickname}</dd>
          <dt className="text-neutral-500">플랜</dt>
          <dd className="text-right font-medium">{selectedPlan?.planName ?? "팬클럽"}</dd>
          <dt className="text-neutral-500">월 구독료</dt>
          <dd className="text-right font-medium">{won(amount)}원</dd>
          <dt className="text-neutral-500">결제 수단</dt>
          <dd className="text-right font-medium">카카오페이</dd>
          <dt className="text-neutral-500">상태</dt>
          <dd className="text-right font-medium">{paid ? "결제 완료" : "결제 전"}</dd>
        </dl>
      </div>
      {notice ? <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{notice}</p> : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="h-11 rounded-md border-2 border-neutral-900 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          onClick={() => void onSubscribe()}
          disabled={busy || paid || plansStatus !== "success"}
        >
          {paid ? "구독 완료" : busy ? "결제 중..." : "구독하기"}
        </button>
        <button
          type="button"
          className="h-11 rounded-md border-2 border-neutral-900 text-sm font-medium hover:bg-neutral-50"
          onClick={() => void navigate(`/profile/${profile.id}`)}
          disabled={busy}
        >
          {paid ? "프로필로" : "취소하기"}
        </button>
      </div>
    </section>
  );
}
