import * as PortOne from "@portone/browser-sdk/v2";
import { completePayment, preparePayment } from "@/api/payments";
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

  const redirectUrl = `${window.location.origin}/payments/return`;

  const checkout = await PortOne.requestPayment({
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

  // 모바일 리디렉션이면 결제창이 페이지를 떠나므로 여기서는 끝낸다.
  if (checkout === undefined) {
    return null;
  }

  if (checkout.code !== undefined) {
    throw new PaymentCanceledError(checkout.message ?? "결제가 취소되었습니다.");
  }

  return completePayment({ paymentId: prepare.paymentId });
}

export function startSnackPayment(input: {
  targetMemberId: number;
  totalAmount: number;
}): Promise<PaymentCompleteResult | null> {
  return startPortOnePayment({ ...input, orderName: SNACK_ORDER_NAME });
}
