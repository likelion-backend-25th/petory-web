export const FANCLUB_PLAN_PERK = "구독자 전용 피드 열람";
export const FANCLUB_AMOUNTS = [1000, 5000, 10000] as const;

export type FanclubAmount = (typeof FANCLUB_AMOUNTS)[number];

const PENDING_SUBSCRIPTION_KEY = "patory-pending-subscription";

export interface PendingFanclubSubscription {
  targetMemberId: number;
  planId: number;
  price: number;
  planName: string;
  nickname: string;
}

export function stagePendingSubscription(pending: PendingFanclubSubscription): void {
  sessionStorage.setItem(PENDING_SUBSCRIPTION_KEY, JSON.stringify(pending));
}

export function clearPendingSubscription(): void {
  sessionStorage.removeItem(PENDING_SUBSCRIPTION_KEY);
}

export function readPendingSubscription(): PendingFanclubSubscription | null {
  const raw = sessionStorage.getItem(PENDING_SUBSCRIPTION_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const body: unknown = JSON.parse(raw);
    if (typeof body !== "object" || body === null) {
      return null;
    }
    const record = body as Record<string, unknown>;
    if (
      typeof record.targetMemberId !== "number" ||
      typeof record.planId !== "number" ||
      typeof record.price !== "number" ||
      typeof record.planName !== "string" ||
      typeof record.nickname !== "string"
    ) {
      return null;
    }
    return {
      targetMemberId: record.targetMemberId,
      planId: record.planId,
      price: record.price,
      planName: record.planName,
      nickname: record.nickname,
    };
  } catch {
    return null;
  }
}
