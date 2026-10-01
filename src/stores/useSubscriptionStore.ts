import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/stores/useAuthStore";

const EMPTY_IDS: number[] = [];

interface SubscriptionState {
  byUserId: Record<string, number[]>;
  grant: (userId: number, targetMemberId: number) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      byUserId: {},
      grant: (userId, targetMemberId) =>
        set((state) => {
          const key = String(userId);
          const current = state.byUserId[key] ?? EMPTY_IDS;
          if (current.includes(targetMemberId)) {
            return state;
          }
          return { byUserId: { ...state.byUserId, [key]: [...current, targetMemberId] } };
        }),
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
