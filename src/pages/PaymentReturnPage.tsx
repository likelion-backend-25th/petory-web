import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { completePayment } from "@/api/payments";
import type { PaymentCompleteResult } from "@/types/payment";

function resultText(result: PaymentCompleteResult): string {
  if (result.status === "PAID") {
    const amount = new Intl.NumberFormat("ko-KR").format(result.paidAmount);
    return `${amount}원 후원 완료!`;
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

  useEffect(() => {
    if (paymentId === null || paymentId.trim() === "") {
      setIsError(true);
      setMessage("결제 번호가 없습니다.");
      return;
    }

    const verify = async (): Promise<void> => {
      try {
        const result = await completePayment({ paymentId });
        setIsError(result.status !== "PAID");
        setMessage(resultText(result));
      } catch (error: unknown) {
        setIsError(true);
        const text = error instanceof Error ? error.message : "알 수 없는 오류";
        setMessage(text);
      }
    };

    void verify();
  }, [paymentId]);

  return (
    <section className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">결제 결과</h1>
      <p className={`text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{message}</p>
      <Link to="/" className="inline-block text-sm font-medium underline">
        피드로 돌아가기
      </Link>
    </section>
  );
}
