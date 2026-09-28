import { useEffect, useState } from "react";
import { getProfile } from "@/api/profile";
import type { MemberProfile } from "@/types/profile";

interface ProfileState {
  profile: MemberProfile | null;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
}

function parseMemberId(value: string | undefined): number | null {
  if (value === undefined || !/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

export function useProfile(memberIdParam: string | undefined) {
  const memberId = parseMemberId(memberIdParam);
  const [state, setState] = useState<ProfileState>({
    profile: null,
    status: "loading",
    errorMessage: null,
  });

  useEffect(() => {
    if (memberId === null) {
      setState({ profile: null, status: "error", errorMessage: "올바르지 않은 회원입니다." });
      return;
    }

    const controller = new AbortController();
    setState({ profile: null, status: "loading", errorMessage: null });

    const load = async (): Promise<void> => {
      try {
        const profile = await getProfile(memberId, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({ profile, status: "success", errorMessage: null });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "알 수 없는 오류";
        setState({ profile: null, status: "error", errorMessage: message });
      }
    };

    void load();
    return () => controller.abort();
  }, [memberId]);

  return { ...state, memberId };
}
