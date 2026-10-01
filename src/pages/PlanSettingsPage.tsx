import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { createPlan, getMemberPlans, updatePlan } from "@/api/subscription";
import { useProfile } from "@/hooks/useProfile";
import { FANCLUB_AMOUNTS, FANCLUB_PLAN_PERK, type FanclubAmount } from "@/lib/fanclub";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SubscriptionPlan } from "@/types/subscription";

function won(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

function emptyNames(): Record<FanclubAmount, string> {
  return { 1000: "", 5000: "", 10000: "" };
}

function planForAmount(plans: SubscriptionPlan[], amount: number): SubscriptionPlan | null {
  return plans.find((plan) => plan.price === amount) ?? null;
}

export function PlanSettingsPage() {
  const { memberId } = useParams();
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const { profile, status, errorMessage } = useProfile(memberId);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [names, setNames] = useState(emptyNames);
  const [plansStatus, setPlansStatus] = useState<"loading" | "error" | "success">("loading");
  const [plansError, setPlansError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (profile === null || myId === null || myId !== profile.id) {
      return;
    }
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const next = await getMemberPlans(profile.id, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setPlans(next);
        setNames((current) => {
          const filled = emptyNames();
          for (const amount of FANCLUB_AMOUNTS) {
            filled[amount] = planForAmount(next, amount)?.planName ?? current[amount];
          }
          return filled;
        });
        setPlansStatus("success");
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setPlansStatus("error");
        setPlansError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };
    void load();
    return () => controller.abort();
  }, [myId, profile]);

  if (status === "loading") {
    return <p className="text-neutral-500">불러오는 중...</p>;
  }
  if (status === "error" || profile === null) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">프로필을 찾을 수 없습니다</h1>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Link to="/" className="text-sm underline">
          피드로 돌아가기
        </Link>
      </section>
    );
  }
  if (myId === null || myId !== profile.id) {
    return <Navigate to={`/profile/${profile.id}`} replace />;
  }

  const onSave = async (): Promise<void> => {
    setBusy(true);
    setNotice(null);
    setIsError(false);
    try {
      let nextPlans = plans;
      for (const amount of FANCLUB_AMOUNTS) {
        const planName = names[amount].trim();
        const existing = planForAmount(nextPlans, amount);
        if (planName === "") {
          if (existing !== null) {
            throw new Error(`${won(amount)}원 플랜 이름을 입력해 주세요.`);
          }
          continue;
        }
        if (existing === null) {
          await createPlan(profile.id, {
            memberId: profile.id,
            planName,
            price: amount,
            description: FANCLUB_PLAN_PERK,
          });
          nextPlans = await getMemberPlans(profile.id);
          setPlans(nextPlans);
          continue;
        }
        if (existing.planName === planName) {
          continue;
        }
        await updatePlan(profile.id, {
          id: existing.id,
          planName,
          description: existing.description || FANCLUB_PLAN_PERK,
          status: "ACTIVE",
        });
        nextPlans = nextPlans.map((plan) => (plan.id === existing.id ? { ...plan, planName } : plan));
        setPlans(nextPlans);
      }
      setNotice("구독 플랜을 저장했습니다.");
    } catch (error: unknown) {
      setIsError(true);
      setNotice(error instanceof Error ? error.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
      <h1 className="text-2xl font-semibold">구독플랜 설정</h1>
      <p className="mt-2 text-sm text-neutral-600">1,000원, 5,000원, 10,000원 플랜의 이름을 정해 주세요.</p>
      {plansStatus === "loading" ? <p className="mt-4 text-sm text-neutral-500">플랜을 불러오는 중...</p> : null}
      {plansStatus === "error" ? <p className="mt-4 text-sm text-red-600">{plansError}</p> : null}
      <ul className="mt-5 space-y-4">
        {FANCLUB_AMOUNTS.map((amount) => (
          <li key={amount} className="rounded-md border-2 border-neutral-900 px-4 py-4">
            <label className="block text-sm font-medium" htmlFor={`plan-${amount}`}>
              월 {won(amount)}원
            </label>
            <input
              id={`plan-${amount}`}
              value={names[amount]}
              disabled={busy || plansStatus !== "success"}
              placeholder="플랜 이름"
              className="mt-2 h-11 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none disabled:opacity-50"
              onChange={(event) => setNames((current) => ({ ...current, [amount]: event.target.value }))}
            />
          </li>
        ))}
      </ul>
      {notice ? <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{notice}</p> : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className="h-11 rounded-md border-2 border-neutral-900 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          disabled={busy || plansStatus !== "success"}
          onClick={() => void onSave()}
        >
          {busy ? "저장 중..." : "저장"}
        </button>
        <Link
          to={`/profile/${profile.id}`}
          className="flex h-11 items-center justify-center rounded-md border-2 border-neutral-900 text-sm font-medium hover:bg-neutral-50"
        >
          마이페이지로
        </Link>
      </div>
    </section>
  );
}
