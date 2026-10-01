import { useCallback, useEffect, useRef, useState } from "react";
import { getRanking } from "@/api/ranking";
import { ApiError } from "@/types/api";
import type { PetRanking } from "@/types/ranking";

interface RankingState {
  pets: PetRanking[];
  hasNext: boolean;
  lastMemberId: number | null;
  lastFollowerCount: number | null;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
  errorStatus: number | null;
  isLoadingMore: boolean;
}

const initialState: RankingState = {
  pets: [],
  hasNext: false,
  lastMemberId: null,
  lastFollowerCount: null,
  status: "loading",
  errorMessage: null,
  errorStatus: null,
  isLoadingMore: false,
};

function readError(error: unknown): { message: string; status: number | null } {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status };
  }
  return { message: error instanceof Error ? error.message : "알 수 없는 오류", status: null };
}

export function useRanking(size: number) {
  const [state, setState] = useState<RankingState>(initialState);
  const stateRef = useRef(state);
  const loadingMoreRef = useRef(false);
  stateRef.current = state;

  useEffect(() => {
    const controller = new AbortController();
    loadingMoreRef.current = false;
    setState(initialState);

    const loadFirstPage = async (): Promise<void> => {
      try {
        const page = await getRanking({ size }, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({
          pets: page.content,
          hasNext: page.hasNext,
          lastMemberId: page.lastMemberId,
          lastFollowerCount: page.lastFollowerCount,
          status: "success",
          errorMessage: null,
          errorStatus: null,
          isLoadingMore: false,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        const parsed = readError(error);
        setState({
          ...initialState,
          status: "error",
          errorMessage: parsed.message,
          errorStatus: parsed.status,
        });
      }
    };

    void loadFirstPage();
    return () => controller.abort();
  }, [size]);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = stateRef.current;
    if (
      !current.hasNext ||
      current.lastMemberId === null ||
      current.lastFollowerCount === null ||
      current.isLoadingMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setState((prev) => ({ ...prev, isLoadingMore: true, errorMessage: null }));
    try {
      const page = await getRanking({
        size,
        lastMemberId: current.lastMemberId,
        lastFollowerCount: current.lastFollowerCount,
      });
      setState((prev) => {
        const seen = new Set(prev.pets.map((pet) => pet.memberId));
        return {
          ...prev,
          pets: [...prev.pets, ...page.content.filter((pet) => !seen.has(pet.memberId))],
          hasNext: page.hasNext,
          lastMemberId: page.lastMemberId,
          lastFollowerCount: page.lastFollowerCount,
          isLoadingMore: false,
        };
      });
    } catch (error: unknown) {
      const parsed = readError(error);
      setState((prev) => ({
        ...prev,
        isLoadingMore: false,
        errorMessage: parsed.message,
        errorStatus: parsed.status,
      }));
    } finally {
      loadingMoreRef.current = false;
    }
  }, [size]);

  return { ...state, loadMore };
}
