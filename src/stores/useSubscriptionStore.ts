import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MySubscription } from "@/types/subscription";
import { useAuthStore } from "@/stores/useAuthStore";

const EMPTY_IDS: number[] = [];

let syncVersion = 0;

export function beginSubscriptionSync(): number {
  syncVersion += 1;
  return syncVersion;
}

export function isSubscriptionSyncCurrent(version: number): boolean {
  return version === syncVersion;
}

interface SubscriptionState {
  byUserId: Record<string, number[]>;
  grant: (userId: number, targetMemberId: number) => void;
  revoke: (userId: number, targetMemberId: number) => void;
  replace: (userId: number, targetMemberIds: number[]) => void;
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids.filter((id) => id > 0))];
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      byUserId: {},
      grant: (userId, targetMemberId) => {
        syncVersion += 1;
        set((state) => {
          const key = String(userId);
          const current = state.byUserId[key] ?? EMPTY_IDS;
          if (current.includes(targetMemberId)) {
            return state;
          }
          return { byUserId: { ...state.byUserId, [key]: [...current, targetMemberId] } };
        });
      },
      revoke: (userId, targetMemberId) => {
        syncVersion += 1;
        set((state) => {
          const key = String(userId);
          const current = state.byUserId[key] ?? EMPTY_IDS;
          return { byUserId: { ...state.byUserId, [key]: current.filter((id) => id !== targetMemberId) } };
        });
      },
      replace: (userId, targetMemberIds) =>
        set((state) => ({
          byUserId: { ...state.byUserId, [String(userId)]: uniqueIds(targetMemberIds) },
        })),
    }),
    { name: "patory-subscriptions" },
  ),
);

export function useSubscribedMemberIds(): number[] {
  const myId = useAuthStore((state) => state.user?.id ?? null);
  return useSubscriptionStore((state) =>
    myId === null ? EMPTY_IDS : (state.byUserId[String(myId)] ?? EMPTY_IDS),
  );
}

export function useIsSubscribedTo(targetMemberId: number | null): boolean {
  const ids = useSubscribedMemberIds();
  return targetMemberId !== null && ids.includes(targetMemberId);
}

export function applyServerSubscriptions(userId: number, subscriptions: MySubscription[]): void {
  if (!subscriptions.every((item) => item.targetMemberId > 0)) {
    return;
  }
  useSubscriptionStore.getState().replace(
    userId,
    subscriptions.map((item) => item.targetMemberId),
  );
}
