import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { completePayment } from "@/api/payments";
import { clearPendingSubscription } from "@/lib/fanclub";
import { finishFanclubSubscription } from "@/lib/portonePayment";
import { clearFanclubTarget, readFanclubTarget } from "@/lib/subscriberAccess";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import type { PaymentCompleteResult } from "@/types/payment";

function resultText(result: PaymentCompleteResult): string {
  if (result.status === "PAID" && result.paidAmount !== null) {
    const amount = new Intl.NumberFormat("ko-KR").format(result.paidAmount);
    return `${amount}원 결제가 완료되었습니다.`;
  }
  if (result.status === "READY") {
    return "결제 대기 중입니다.";
  }
  return result.message;
}

function won(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? searchParams.get("payment_id");
  const billingKey = searchParams.get("billingKey");
  const billingCode = searchParams.get("code");
  const [message, setMessage] = useState("결제 결과를 확인하고 있습니다...");
  const [detail, setDetail] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const isBilling = billingKey !== null && billingKey.trim() !== "";
  const isPaymentIdMissing = !isBilling && (paymentId === null || paymentId.trim() === "");

  useEffect(() => {
    if (isBilling && billingKey !== null) {
      const verifyBilling = async (): Promise<void> => {
        try {
          const pending = await finishFanclubSubscription(billingKey);
          setIsError(false);
          setMessage(`${won(pending.price)}원 팬클럽 구독이 완료되었습니다.`);
          setDetail(`${pending.nickname} · ${pending.planName}`);
        } catch (error: unknown) {
          clearPendingSubscription();
          setIsError(true);
          setMessage(error instanceof Error ? error.message : "알 수 없는 오류");
        }
      };
      void verifyBilling();
      return;
    }

    if (billingCode !== null && billingCode.trim() !== "" && isPaymentIdMissing) {
      clearPendingSubscription();
      setIsError(true);
      setMessage(searchParams.get("message") ?? "결제가 취소되었습니다.");
      return;
    }

    if (isPaymentIdMissing || paymentId === null) {
      return;
    }

    const verify = async (): Promise<void> => {
      try {
        const result = await completePayment({ paymentId });
        const targetMemberId = readFanclubTarget();
        if (result.status === "PAID" && targetMemberId !== null) {
          const viewerId = useAuthStore.getState().user?.id ?? null;
          if (viewerId !== null) {
            useSubscriptionStore.getState().grant(viewerId, targetMemberId);
          }
        }
        clearFanclubTarget();
        setIsError(result.status !== "PAID");
        setMessage(resultText(result));
      } catch (error: unknown) {
        setIsError(true);
        const text = error instanceof Error ? error.message : "알 수 없는 오류";
        setMessage(text);
      }
    };

    void verify();
  }, [billingCode, billingKey, isBilling, isPaymentIdMissing, paymentId, searchParams]);

  const missingPayment = isPaymentIdMissing && (billingCode === null || billingCode.trim() === "");
  const shownMessage = missingPayment ? "결제 번호가 없습니다." : message;
  const shownAsError = missingPayment || isError;

  return (
    <section className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">결제 결과</h1>
      <p className={`text-sm ${shownAsError ? "text-red-600" : "text-neutral-700"}`}>
        {shownMessage}
      </p>
      {detail ? <p className="text-sm text-neutral-600">{detail}</p> : null}
      <Link to="/" className="inline-block text-sm font-medium underline">
        피드로 돌아가기
      </Link>
    </section>
  );
}
