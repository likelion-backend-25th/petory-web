import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import type { AdminMember } from "@/types/admin";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeAdminMember(body: unknown): AdminMember | null {
  if (typeof body !== "object" || body === null || !("id" in body)) {
    return null;
  }
  const record = body as Record<string, unknown>;
  const id = asNumber(record.id);
  if (id === 0) {
    return null;
  }
  return {
    id,
    email: asString(record.email),
    nickname: asString(record.nickname),
    address: asString(record.address),
    status: asString(record.status),
    role: asString(record.role),
    createdAt: asString(record.createdAt),
  };
}

export async function getAdminMembers(signal?: AbortSignal): Promise<AdminMember[]> {
  const body: unknown = await apiClient<unknown>("/admin/members", { signal });
  if (!Array.isArray(body)) {
    return [];
  }
  return body.map(normalizeAdminMember).filter((item): item is AdminMember => item !== null);
}

export function blockMember(memberId: number): Promise<void> {
  return apiClient<void>(`/admin/members/${memberId}/block`, {
    method: "PATCH",
  });
}

export async function unblockMember(memberId: number): Promise<void> {
  try {
    await apiClient<void>(`/admin/members/${memberId}/block`, {
      method: "DELETE",
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      await apiClient<void>(`/admin/members/${memberId}/unblock`, {
        method: "PATCH",
      });
      return;
    }
    throw error;
  }
}
