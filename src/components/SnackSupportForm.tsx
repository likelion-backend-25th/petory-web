import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaymentCanceledError, startSnackPayment } from "@/lib/portonePayment";
import type { PaymentCompleteResult } from "@/types/payment";

const supportSchema = z.object({
  totalAmount: z
    .string()
    .min(1, "금액을 입력해 주세요.")
    .regex(/^\d+$/, "금액은 정수여야 합니다.")
    .refine((value) => Number(value) >= 1, "1원 이상 입력해 주세요."),
});

type SupportFormValues = z.infer<typeof supportSchema>;

interface SnackSupportFormProps {
  targetMemberId: number;
  targetNickname: string;
}

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

export function SnackSupportForm({ targetMemberId, targetNickname }: SnackSupportFormProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { totalAmount: "5000" },
  });

  const onSubmit = async (values: SupportFormValues): Promise<void> => {
    setNotice(null);
    setIsError(false);

    try {
      const result = await startSnackPayment({
        targetMemberId,
        totalAmount: Number(values.totalAmount),
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
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      setNotice(message);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border-2 border-neutral-900 bg-white p-4">
      <h2 id="snack-title" className="font-medium">
        간식 쏘기
      </h2>
      <p className="text-sm text-neutral-500">{targetNickname}에게 후원할 금액을 입력해 주세요.</p>
      <form className="flex items-end gap-2" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex-1">
          <Input
            label="금액 (원)"
            type="number"
            min={1}
            step={1}
            error={errors.totalAmount?.message}
            {...register("totalAmount")}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "결제 중..." : "후원하기"}
        </Button>
      </form>
      {notice ? (
        <p className={`text-sm ${isError ? "text-red-600" : "text-neutral-700"}`}>{notice}</p>
      ) : null}
    </section>
  );
}
