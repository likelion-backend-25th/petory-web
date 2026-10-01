import * as PortOne from "@portone/browser-sdk/v2";
import { completePayment, preparePayment } from "@/api/payments";
import { FANCLUB_ORDER_NAME } from "@/lib/fanclub";
import { clearFanclubTarget, stageFanclubTarget } from "@/lib/subscriberAccess";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import type { PaymentCompleteResult } from "@/types/payment";

const PAY_METHOD = "EASY_PAY";
const SNACK_ORDER_NAME = "간식쏘기";

export class PaymentCanceledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentCanceledError";
  }
}

export async function startPortOnePayment(input: {
  targetMemberId: number;
  totalAmount: number;
  orderName: string;
}): Promise<PaymentCompleteResult | null> {
  const storeId = import.meta.env.VITE_PORTONE_STORE_ID?.trim();
  const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY?.trim();

  if (!storeId || !channelKey) {
    throw new Error("PortOne 상점 설정이 없습니다. 환경 변수를 확인해 주세요.");
  }

  const prepare = await preparePayment({
    targetMemberId: input.targetMemberId,
    orderName: input.orderName,
    totalAmount: input.totalAmount,
    payMethod: PAY_METHOD,
  });

  const fanclub = input.orderName === FANCLUB_ORDER_NAME;
  if (fanclub) {
    stageFanclubTarget(input.targetMemberId);
  } else {
    clearFanclubTarget();
  }

  const redirectUrl = `${window.location.origin}/payments/return`;

  let checkout: Awaited<ReturnType<typeof PortOne.requestPayment>>;
  try {
    checkout = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId: prepare.paymentId,
    orderName: prepare.orderName,
    totalAmount: prepare.totalAmount,
    currency: "KRW",
    payMethod: PAY_METHOD,
    easyPay: {
      easyPayProvider: "KAKAOPAY",
    },
    redirectUrl,
  });
  } catch (error: unknown) {
    clearFanclubTarget();
    throw error;
  }

  // 모바일 리디렉션이면 결제창이 페이지를 떠나므로 여기서는 끝낸다.
  if (checkout === undefined) {
    return null;
  }

  if (checkout.code !== undefined) {
    clearFanclubTarget();
    throw new PaymentCanceledError(checkout.message ?? "결제가 취소되었습니다.");
  }

  try {
    const result = await completePayment({ paymentId: prepare.paymentId });
    if (fanclub && result.status === "PAID") {
      const viewerId = useAuthStore.getState().user?.id ?? null;
      if (viewerId !== null) {
        useSubscriptionStore.getState().grant(viewerId, input.targetMemberId);
      }
    }
    clearFanclubTarget();
    return result;
  } catch (error: unknown) {
    clearFanclubTarget();
    throw error;
  }
}

export function startSnackPayment(input: {
  targetMemberId: number;
  totalAmount: number;
}): Promise<PaymentCompleteResult | null> {
  return startPortOnePayment({ ...input, orderName: SNACK_ORDER_NAME });
}
