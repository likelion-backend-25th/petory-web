import { useEffect } from "react";
import { getMySubscriptions } from "@/api/subscription";
import {
  applyServerSubscriptions,
  beginSubscriptionSync,
  isSubscriptionSyncCurrent,
} from "@/stores/useSubscriptionStore";
import { useAuthStore } from "@/stores/useAuthStore";

export function useSyncSubscriptions(): void {
  const myId = useAuthStore((state) => state.user?.id ?? null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (myId === null || myId <= 0 || accessToken === null) {
      return;
    }
    const version = beginSubscriptionSync();
    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const subscriptions = await getMySubscriptions(myId, controller.signal);
        if (controller.signal.aborted || !isSubscriptionSyncCurrent(version)) {
          return;
        }
        applyServerSubscriptions(myId, subscriptions);
      } catch {
        // 구독 목록을 못 가져오면 이 브라우저에 남아 있는 구독 대상을 유지한다.
      }
    };
    void load();
    return () => controller.abort();
  }, [accessToken, myId]);
}
