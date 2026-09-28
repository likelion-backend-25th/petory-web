import { useCallback, useEffect, useState } from "react";
import { blockMember, getAdminMembers, unblockMember } from "@/api/admin";
import { isBlockedStatus } from "@/lib/admin";
import type { AdminMember } from "@/types/admin";

interface AdminMembersState {
  members: AdminMember[];
  status: "loading" | "error" | "success";
  errorMessage: string | null;
}

export function useAdminMembers() {
  const [state, setState] = useState<AdminMembersState>({
    members: [],
    status: "loading",
    errorMessage: null,
  });

  const load = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setState((prev) => ({ ...prev, status: "loading", errorMessage: null }));
    try {
      const members = await getAdminMembers(signal);
      if (signal?.aborted) {
        return;
      }
      setState({ members, status: "success", errorMessage: null });
    } catch (error: unknown) {
      if (signal?.aborted) {
        return;
      }
      setState({
        members: [],
        status: "error",
        errorMessage: error instanceof Error ? error.message : "알 수 없는 오류",
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const setBlocked = async (memberId: number, blocked: boolean): Promise<void> => {
    if (blocked) {
      await blockMember(memberId);
    } else {
      await unblockMember(memberId);
    }
    setState((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === memberId ? { ...member, status: blocked ? "BLOCKED" : "ACTIVE" } : member,
      ),
    }));
  };

  const activeMembers = state.members.filter((member) => !isBlockedStatus(member.status));
  const blockedMembers = state.members.filter((member) => isBlockedStatus(member.status));

  return { ...state, activeMembers, blockedMembers, setBlocked };
}
