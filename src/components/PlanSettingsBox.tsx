import { useEffect, useState } from "react";
import { createPlan, getMemberPlans, updatePlan } from "@/api/subscription";
import { FANCLUB_AMOUNTS, FANCLUB_PLAN_PERK, type FanclubAmount } from "@/lib/fanclub";
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

export function PlanSettingsBox({ memberId }: { memberId: number }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [names, setNames] = useState(emptyNames);
  const [plansStatus, setPlansStatus] = useState<"loading" | "error" | "success">("loading");
  const [plansError, setPlansError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [selected, setSelected] = useState<FanclubAmount | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const next = await getMemberPlans(memberId, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setPlans(next);
        setNames(() => {
          const filled = emptyNames();
          for (const amount of FANCLUB_AMOUNTS) {
            filled[amount] = planForAmount(next, amount)?.planName ?? "";
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
  }, [memberId]);

  const onSave = async (): Promise<void> => {
    if (selected === null) {
      return;
    }
    const planName = names[selected].trim();
    if (planName === "") {
      setIsError(true);
      setNotice("플랜 이름을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setNotice(null);
    setIsError(false);
    try {
      const existing = planForAmount(plans, selected);
      if (existing === null) {
        await createPlan(memberId, {
          memberId,
          planName,
          price: selected,
          description: FANCLUB_PLAN_PERK,
        });
        setPlans(await getMemberPlans(memberId));
      } else if (existing.planName !== planName) {
        await updatePlan(memberId, {
          id: existing.id,
          planName,
          description: existing.description || FANCLUB_PLAN_PERK,
          status: "ACTIVE",
        });
        setPlans((current) => current.map((plan) => (plan.id === existing.id ? { ...plan, planName } : plan)));
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
    <section className="rounded-xl border-2 border-neutral-900 bg-white p-5">
      <h2 className="text-lg font-semibold">구독플랜 설정</h2>
      <p className="mt-1 text-sm text-neutral-600">금액을 고르면 그 플랜 이름을 정할 수 있습니다.</p>
      {plansStatus === "loading" ? <p className="mt-4 text-sm text-neutral-500">플랜을 불러오는 중...</p> : null}
      {plansStatus === "error" ? <p className="mt-4 text-sm text-red-600">{plansError}</p> : null}
      <ul className="mt-4 space-y-2">
        {FANCLUB_AMOUNTS.map((amount) => {
          const open = selected === amount;
          const savedName = planForAmount(plans, amount)?.planName;
          return (
            <li key={amount} className="rounded-md border-2 border-neutral-900 px-3 py-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="radio"
                  name="fanclub-plan"
                  className="size-4 accent-neutral-900"
                  checked={open}
                  disabled={busy || plansStatus !== "success"}
                  onChange={() => setSelected(amount)}
                />
                월 {won(amount)}원
                {savedName ? <span className="font-normal text-neutral-500">{savedName}</span> : null}
              </label>
              {open ? (
                <div className="mt-3 space-y-3">
                  <input
                    id={`plan-${amount}`}
                    value={names[amount]}
                    disabled={busy}
                    placeholder="플랜 이름"
                    aria-label={`${won(amount)}원 플랜 이름`}
                    className="h-11 w-full rounded-md border-2 border-neutral-900 px-3 text-sm outline-none disabled:opacity-50"
                    onChange={(event) => setNames((current) => ({ ...current, [amount]: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="h-11 w-full rounded-md border-2 border-neutral-900 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void onSave()}
                  >
                    {busy ? "저장 중..." : "저장"}
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {notice ? <p className={`mt-4 text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{notice}</p> : null}
    </section>
  );
}
