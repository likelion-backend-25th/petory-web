import { useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";
import { getMyPayments } from "@/api/payments";
import type {
  PaymentHistoryResponse,
  PaymentStatus,
} from "@/types/payment";

const statusLabels: Record<PaymentStatus, string> = {
  READY: "결제대기",
  PAID: "결제완료",
  FAILED: "결제실패",
  CANCELLED: "결제취소",
};

const statusClasses: Record<PaymentStatus, string> = {
  READY: "bg-neutral-100 text-neutral-700",
  PAID: "bg-neutral-900 text-white",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-neutral-200 text-neutral-700",
};

function formatAmount(payment: PaymentHistoryResponse): string {
  const amount =
    payment.status === "PAID" && payment.paidAmount !== null
      ? payment.paidAmount
      : payment.totalAmount;
  const formatted = new Intl.NumberFormat("ko-KR").format(amount);
  return payment.currency === "KRW"
    ? `${formatted}원`
    : `${formatted} ${payment.currency}`;
}

function formatPaymentDate(value: string): string {
  const matched =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!matched) {
    return value;
  }
  const [, year, month, day, hour, minute] = matched;
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function paymentDate(payment: PaymentHistoryResponse): {
  label: string;
  value: string;
} {
  if (payment.status === "PAID" && payment.paidAt) {
    return { label: "결제 일시", value: payment.paidAt };
  }
  if (payment.status === "CANCELLED" && payment.cancelledAt) {
    return { label: "취소 일시", value: payment.cancelledAt };
  }
  return { label: "요청 일시", value: payment.createdAt };
}

export function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentHistoryResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async (): Promise<void> => {
      try {
        const response = await getMyPayments(controller.signal);
        if (!controller.signal.aborted) {
          setPayments(response);
          setStatus("success");
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "결제내역을 불러오지 못했습니다.",
          );
          setStatus("error");
        }
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-5">
      <header className="rounded-xl border-2 border-neutral-900 bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">결제내역</h1>
        <p className="mt-1 text-sm text-neutral-500">
          내가 요청한 결제의 상태와 금액을 확인할 수 있습니다.
        </p>
      </header>

      {status === "loading" ? (
        <p className="text-sm text-neutral-500">결제내역을 불러오는 중...</p>
      ) : null}

      {status === "error" ? (
        <div className="rounded-xl border-2 border-neutral-900 bg-white p-6">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      ) : null}

      {status === "success" && payments.length === 0 ? (
        <div className="rounded-xl border-2 border-neutral-900 bg-white p-10 text-center">
          <ReceiptText
            className="mx-auto size-9 text-neutral-400"
            aria-hidden
          />
          <p className="mt-3 text-sm text-neutral-500">
            결제내역이 없습니다.
          </p>
        </div>
      ) : null}

      {status === "success" && payments.length > 0 ? (
        <ul className="space-y-3">
          {payments.map((payment) => {
            const date = paymentDate(payment);
            return (
              <li
                key={payment.paymentId}
                className="rounded-xl border-2 border-neutral-900 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="break-words text-base font-semibold">
                      {payment.orderName}
                    </h2>
                    <p className="mt-2 text-xl font-bold">
                      {formatAmount(payment)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[payment.status]}`}
                  >
                    {statusLabels[payment.status]}
                  </span>
                </div>

                <dl className="mt-4 grid gap-2 border-t border-neutral-200 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-neutral-500">{date.label}</dt>
                    <dd className="mt-0.5">
                      {formatPaymentDate(date.value)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-neutral-500">결제 ID</dt>
                    <dd className="mt-0.5 break-all font-mono text-xs">
                      {payment.paymentId}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
