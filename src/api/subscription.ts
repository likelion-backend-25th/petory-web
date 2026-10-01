import { apiClient } from "@/lib/apiClient";
import type { SubscriptionCreatePayload, SubscriptionPlan } from "@/types/subscription";

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
