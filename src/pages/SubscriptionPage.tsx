import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  cancelMySubscription,
  getMySubscription,
  getMySubscriptions,
  updateSubscriptionAgreement,
} from "@/api/subscription";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/useAuthStore";
import { applyServerSubscriptions, useSubscriptionStore } from "@/stores/useSubscriptionStore";
import type { MySubscription } from "@/types/subscription";

function formatDay(value: string | null): string {
  if (value === null || value === "") {
    return "없음";
  }
  const matched = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!matched) {
    return value;
  }
  return `${matched[1]}.${matched[2]}.${matched[3]}`;
}

function replaceItem(items: MySubscription[], next: MySubscription): MySubscription[] {
  return items.map((item) => (item.id === next.id ? next : item));
}

export function SubscriptionPage() {
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const revoke = useSubscriptionStore((state) => state.revoke);
  const [items, setItems] = useState<MySubscription[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MySubscription | null>(null);
  const [detailStatus, setDetailStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [detailError, setDetailError] = useState<string | null>(null);
  const [agreementBusy, setAgreementBusy] = useState(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (myId === null || myId <= 0) {
      return;
    }
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const next = await getMySubscriptions(myId, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setItems(next);
        applyServerSubscriptions(myId, next);
        setSelectedId((current) => {
          if (current !== null && next.some((item) => item.id === current)) {
            return current;
          }
          return next[0]?.id ?? null;
        });
        setStatus("success");
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "구독 목록을 불러오지 못했습니다.");
      }
    };
    void load();
    return () => controller.abort();
  }, [myId]);

  useEffect(() => {
    if (myId === null || myId <= 0 || selectedId === null) {
      setDetail(null);
      setDetailStatus("idle");
      return;
    }
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      setDetailStatus("loading");
      setDetailError(null);
      try {
        const next = await getMySubscription(myId, selectedId, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setDetail(next);
        setItems((current) => replaceItem(current, next));
        setDetailStatus("success");
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setDetail(null);
        setDetailStatus("error");
        setDetailError(error instanceof Error ? error.message : "구독을 불러오지 못했습니다.");
      }
    };
    void load();
    return () => controller.abort();
  }, [myId, selectedId]);

  const onAgreement = async (subscription: MySubscription): Promise<void> => {
    if (myId === null) {
      return;
    }
    setAgreementBusy(true);
    setActionError(null);
    try {
      const nextAgreement = !subscription.agreement;
      await updateSubscriptionAgreement(myId, subscription.id, nextAgreement);
      const next = await getMySubscription(myId, subscription.id);
      setDetail(next);
      setItems((current) => replaceItem(current, next));
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "동의 여부를 바꾸지 못했습니다.");
    } finally {
      setAgreementBusy(false);
    }
  };

  const onCancel = async (): Promise<void> => {
    if (myId === null || cancelId === null) {
      return;
    }
    const target = items.find((item) => item.id === cancelId) ?? null;
    setCancelBusy(true);
    setActionError(null);
    try {
      await cancelMySubscription(myId, cancelId);
      if (target !== null && target.targetMemberId > 0) {
        const stillSubscribed = items.some(
          (item) => item.id !== target.id && item.targetMemberId === target.targetMemberId,
        );
        if (!stillSubscribed) {
          revoke(myId, target.targetMemberId);
        }
      }
      const nextItems = items.filter((item) => item.id !== cancelId);
      setItems(nextItems);
      applyServerSubscriptions(myId, nextItems);
      setSelectedId((current) => (current === cancelId ? (nextItems[0]?.id ?? null) : current));
      setCancelId(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "구독을 해지하지 못했습니다.");
    } finally {
      setCancelBusy(false);
    }
  };

  if (myId === null || myId <= 0) {
    return <p className="text-sm text-neutral-500">로그인 정보를 찾지 못했습니다.</p>;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-xl border-2 border-neutral-900 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">구독 관리</h1>
        <p className="mt-1 text-sm text-neutral-500">구독 중인 팬클럽과 다음 결제, 유지 동의를 확인할 수 있습니다.</p>
      </header>

      {status === "loading" ? <p className="text-sm text-neutral-500">구독 목록을 불러오는 중...</p> : null}
      {status === "error" ? (
        <div className="rounded-xl border-2 border-neutral-900 bg-white p-6">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      ) : null}
      {status === "success" && items.length === 0 ? (
        <div className="rounded-xl border-2 border-neutral-900 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">구독 중인 팬클럽이 없습니다.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium underline">
            피드로 돌아가기
          </Link>
        </div>
      ) : null}

      {status === "success" && items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <ul className="space-y-2">
            {items.map((item) => {
              const selected = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-xl border-2 border-neutral-900 px-4 py-3 text-left",
                      selected ? "bg-neutral-900 text-white" : "bg-white hover:bg-neutral-50",
                    )}
                    aria-pressed={selected}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="block text-sm font-semibold">{item.targetMember}</span>
                    <span className={cn("mt-1 block text-xs", selected ? "text-neutral-200" : "text-neutral-500")}>
                      {item.planName}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border-2 border-neutral-900 bg-white p-6">
            {detailStatus === "loading" ? <p className="text-sm text-neutral-500">구독을 불러오는 중...</p> : null}
            {detailStatus === "error" ? <p className="text-sm text-red-600">{detailError}</p> : null}
            {detailStatus === "success" && detail !== null ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">{detail.targetMember}</h2>
                  <p className="mt-1 text-sm text-neutral-600">{detail.planName}</p>
                </div>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-neutral-500">시작일</dt>
                    <dd className="mt-0.5 font-medium">{formatDay(detail.startedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">다음 결제일</dt>
                    <dd className="mt-0.5 font-medium">{formatDay(detail.nextBillingAt)}</dd>
                  </div>
                </dl>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-neutral-900"
                    checked={detail.agreement}
                    disabled={agreementBusy || cancelBusy}
                    onChange={() => void onAgreement(detail)}
                  />
                  다음 달에도 구독을 유지합니다.
                </label>
                {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
                <button
                  type="button"
                  className="h-11 rounded-md border-2 border-neutral-900 px-5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
                  disabled={agreementBusy || cancelBusy}
                  onClick={() => setCancelId(detail.id)}
                >
                  구독 해지
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {cancelId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-subscription-title"
            className="w-full max-w-sm rounded-xl border-2 border-neutral-900 bg-white p-5"
          >
            <h2 id="cancel-subscription-title" className="text-center text-lg font-semibold">
              구독을 해지할까요?
            </h2>
            <p className="mt-2 text-center text-xs text-neutral-500">해지하면 다음 결제일에 청구되지 않습니다.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                className="h-9 rounded-md border-2 border-neutral-900 px-5 text-sm hover:bg-neutral-50"
                onClick={() => setCancelId(null)}
                disabled={cancelBusy}
              >
                취소
              </button>
              <button
                type="button"
                className="h-9 rounded-md border-2 border-neutral-900 bg-neutral-900 px-5 text-sm text-white disabled:opacity-50"
                onClick={() => void onCancel()}
                disabled={cancelBusy}
              >
                {cancelBusy ? "해지 중..." : "해지"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
