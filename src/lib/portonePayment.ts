import * as PortOne from "@portone/browser-sdk/v2";
import { completePayment, preparePayment } from "@/api/payments";
import { createSubscription } from "@/api/subscription";
import {
  clearPendingSubscription,
  readPendingSubscription,
  stagePendingSubscription,
  type PendingFanclubSubscription,
} from "@/lib/fanclub";
import { clearFanclubTarget, stageFanclubTarget } from "@/lib/subscriberAccess";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import type { PaymentCompleteResult, PaymentMerchandise } from "@/types/payment";

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
  merchandise: PaymentMerchandise;
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
    merchandise: input.merchandise,
  });

  const fanclub = input.merchandise === "automaticPayment";
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
  return startPortOnePayment({ ...input, orderName: SNACK_ORDER_NAME, merchandise: "singlePayment" });
}

function grantFanclub(targetMemberId: number): void {
  const viewerId = useAuthStore.getState().user?.id ?? null;
  if (viewerId !== null) {
    useSubscriptionStore.getState().grant(viewerId, targetMemberId);
  }
}

function readBillingPortOneConfig(): { storeId: string; channelKey: string } {
  const storeId = import.meta.env.VITE_PORTONE_STORE_ID?.trim();
  const channelKey = import.meta.env.VITE_PORTONE_BILLING_CHANNEL_KEY?.trim();
  if (!storeId || !channelKey) {
    throw new Error("PortOne 정기결제 채널 설정이 없습니다. 환경 변수를 확인해 주세요.");
  }
  return { storeId, channelKey };
}

export async function startFanclubSubscription(
  pending: PendingFanclubSubscription,
): Promise<PendingFanclubSubscription | null> {
  const { storeId, channelKey } = readBillingPortOneConfig();
  const user = useAuthStore.getState().user;
  stagePendingSubscription(pending);

  let issued: Awaited<ReturnType<typeof PortOne.requestIssueBillingKey>>;
  try {
    issued = await PortOne.requestIssueBillingKey({
      storeId,
      channelKey,
      billingKeyMethod: "EASY_PAY",
      issueId: `billing-${crypto.randomUUID()}`,
      issueName: `${pending.nickname} ${pending.planName}`,
      displayAmount: pending.price,
      currency: "KRW",
      customer: {
        customerId: user !== null ? String(user.id) : undefined,
        fullName: user?.nickname,
        email: user?.email.includes("@") ? user.email : undefined,
      },
      easyPay: { easyPayProvider: "KAKAOPAY" },
      redirectUrl: `${window.location.origin}/payments/return`,
    });
  } catch (error: unknown) {
    clearPendingSubscription();
    throw error;
  }

  if (issued === undefined) {
    return null;
  }
  const billingKey = issued.billingKey;
  if (issued.code !== undefined || billingKey.trim() === "") {
    clearPendingSubscription();
    throw new PaymentCanceledError(issued.message ?? "결제가 취소되었습니다.");
  }

  try {
    await createSubscription(pending.targetMemberId, {
      targetMemberId: pending.targetMemberId,
      planId: pending.planId,
      billingKey,
    });
    grantFanclub(pending.targetMemberId);
    clearPendingSubscription();
    return pending;
  } catch (error: unknown) {
    clearPendingSubscription();
    throw error;
  }
}

export async function finishFanclubSubscription(billingKey: string): Promise<PendingFanclubSubscription> {
  const pending = readPendingSubscription();
  if (pending === null) {
    throw new Error("구독 정보를 찾지 못했습니다. 구독 페이지에서 다시 시도해 주세요.");
  }
  await createSubscription(pending.targetMemberId, {
    targetMemberId: pending.targetMemberId,
    planId: pending.planId,
    billingKey,
  });
  grantFanclub(pending.targetMemberId);
  clearPendingSubscription();
  return pending;
}
