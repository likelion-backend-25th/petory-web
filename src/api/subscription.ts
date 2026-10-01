import { apiClient } from "@/lib/apiClient";
import type { MySubscription, SubscriptionCreatePayload, SubscriptionPlan } from "@/types/subscription";

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizePlan(body: unknown): SubscriptionPlan | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const id = asNumber(record.id);
  const price = asNumber(record.price);
  if (id === 0 || price <= 0) {
    return null;
  }
  const status = asString(record.status);
  if (status !== "" && status !== "ACTIVE") {
    return null;
  }
  return {
    id,
    memberId: asNumber(record.memberId),
    planName: asString(record.planName) || "팬클럽",
    price,
    description: asString(record.description),
    status: status || "ACTIVE",
  };
}

export async function getMemberPlans(memberId: number, signal?: AbortSignal): Promise<SubscriptionPlan[]> {
  const body: unknown = await apiClient<unknown>(`/subscriptionPlan/${memberId}`, { signal });
  if (!Array.isArray(body)) {
    return [];
  }
  return body.map(normalizePlan).filter((plan): plan is SubscriptionPlan => plan !== null);
}

export function createPlan(
  memberId: number,
  payload: { memberId: number; planName: string; price: number; description: string },
): Promise<void> {
  return apiClient<void>(`/subscriptionPlan/${memberId}`, {
    method: "POST",
    body: payload,
  });
}

export function updatePlan(
  memberId: number,
  payload: { id: number; planName: string; description: string; status: "ACTIVE" },
): Promise<void> {
  return apiClient<void>(`/subscriptionPlan/${memberId}`, {
    method: "PUT",
    body: payload,
  });
}

export function createSubscription(ownerId: number, payload: SubscriptionCreatePayload): Promise<void> {
  return apiClient<void>(`/subscription/${ownerId}`, {
    method: "POST",
    body: payload,
  });
}

function normalizeSubscription(body: unknown): MySubscription | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const id = asNumber(record.id);
  if (id === 0) {
    return null;
  }
  const nextBillingAt = record.nextBillingAt;
  return {
    id,
    memberId: asNumber(record.memberId),
    targetMemberId: asNumber(record.targetMemberId),
    targetMember: asString(record.targetMember) || "회원",
    planName: asString(record.planName) || "팬클럽",
    startedAt: asString(record.startedAt),
    nextBillingAt: typeof nextBillingAt === "string" && nextBillingAt !== "" ? nextBillingAt : null,
    agreement: record.agreement === true,
  };
}

export async function getMySubscriptions(memberId: number, signal?: AbortSignal): Promise<MySubscription[]> {
  const body: unknown = await apiClient<unknown>(`/subscription/${memberId}`, { signal });
  if (!Array.isArray(body)) {
    return [];
  }
  return body.map(normalizeSubscription).filter((item): item is MySubscription => item !== null);
}

export async function getMySubscription(
  memberId: number,
  subscriptionId: number,
  signal?: AbortSignal,
): Promise<MySubscription> {
  const body: unknown = await apiClient<unknown>(`/subscription/${memberId}/${subscriptionId}`, { signal });
  const subscription = normalizeSubscription(body);
  if (subscription === null) {
    throw new Error("구독 정보를 읽지 못했습니다.");
  }
  return subscription;
}

export function updateSubscriptionAgreement(
  memberId: number,
  subscriptionId: number,
  agreement: boolean,
): Promise<void> {
  return apiClient<void>(`/subscription/${memberId}/${subscriptionId}`, {
    method: "PATCH",
    body: { id: subscriptionId, agreement },
  });
}

export function cancelMySubscription(memberId: number, subscriptionId: number): Promise<void> {
  return apiClient<void>(`/subscription/${memberId}/${subscriptionId}`, {
    method: "DELETE",
  });
}
