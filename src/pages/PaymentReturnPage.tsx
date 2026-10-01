import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { completePayment } from "@/api/payments";
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

export function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("paymentId") ?? searchParams.get("payment_id");
  const [message, setMessage] = useState("결제 결과를 확인하고 있습니다...");
  const [isError, setIsError] = useState(false);
  const isPaymentIdMissing = paymentId === null || paymentId.trim() === "";

  useEffect(() => {
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
  }, [isPaymentIdMissing, paymentId]);

  const shownMessage = isPaymentIdMissing ? "결제 번호가 없습니다." : message;
  const shownAsError = isPaymentIdMissing || isError;

  return (
    <section className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">결제 결과</h1>
      <p className={`text-sm ${shownAsError ? "text-red-600" : "text-neutral-700"}`}>
        {shownMessage}
      </p>
      <Link to="/" className="inline-block text-sm font-medium underline">
        피드로 돌아가기
      </Link>
    </section>
  );
}
