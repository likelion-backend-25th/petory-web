import { useCallback, useEffect, useRef, useState } from "react";
import { getMissingPet, getMissingPets } from "@/api/missingPet";
import type {
  MissingPetListResponse,
  MissingPetStatus,
} from "@/types/missingPet";

export const MISSING_PET_PAGE_SIZE = 12;

export interface MissingPetListItem extends MissingPetListResponse {
  status?: MissingPetStatus;
}

interface MissingPetListState {
  items: MissingPetListItem[];
  totalCount: number;
  nextCursor: number | null;
  hasNext: boolean;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
  isLoadingMore: boolean;
}

const initialState: MissingPetListState = {
  items: [],
  totalCount: 0,
  nextCursor: null,
  hasNext: false,
  status: "loading",
  errorMessage: null,
  isLoadingMore: false,
};

function mergeItems(
  current: MissingPetListItem[],
  incoming: MissingPetListItem[],
): MissingPetListItem[] {
  const seen = new Set(
    current
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number"),
  );
  return [
    ...current,
    ...incoming.filter((item) => item.id === undefined || !seen.has(item.id)),
  ];
}

async function withStatuses(
  items: MissingPetListResponse[],
  signal?: AbortSignal,
): Promise<MissingPetListItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.id === undefined) {
        return item;
      }
      try {
        const detail = await getMissingPet(item.id, signal);
        return { ...item, status: detail.status };
      } catch (error: unknown) {
        if (signal?.aborted) {
          throw error;
        }
        return item;
      }
    }),
  );
}

export function useMissingPetList() {
  const [state, setState] = useState<MissingPetListState>(initialState);
  const stateRef = useRef(state);
  const loadingMoreRef = useRef(false);
  stateRef.current = state;

  useEffect(() => {
    const controller = new AbortController();

    const loadFirstPage = async (): Promise<void> => {
      try {
        const page = await getMissingPets(
          { size: MISSING_PET_PAGE_SIZE },
          controller.signal,
        );
        if (controller.signal.aborted) {
          return;
        }
        const items = await withStatuses(page.items ?? [], controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        setState({
          items,
          totalCount: page.totalCount ?? 0,
          nextCursor: page.nextCursor ?? null,
          hasNext: page.hasNext ?? false,
          status: "success",
          errorMessage: null,
          isLoadingMore: false,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setState({
          ...initialState,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "알 수 없는 오류",
        });
      }
    };

    void loadFirstPage();
    return () => controller.abort();
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    const current = stateRef.current;
    if (
      !current.hasNext ||
      current.nextCursor === null ||
      current.isLoadingMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setState((previous) => ({
      ...previous,
      isLoadingMore: true,
      errorMessage: null,
    }));

    try {
      const page = await getMissingPets(
        {
          cursor: current.nextCursor,
          size: MISSING_PET_PAGE_SIZE,
        },
      );
      const items = await withStatuses(page.items ?? []);
      setState((previous) => ({
        ...previous,
        items: mergeItems(previous.items, items),
        totalCount: page.totalCount ?? previous.totalCount,
        nextCursor: page.nextCursor ?? null,
        hasNext: page.hasNext ?? false,
        isLoadingMore: false,
      }));
    } catch (error: unknown) {
      setState((previous) => ({
        ...previous,
        isLoadingMore: false,
        errorMessage: error instanceof Error ? error.message : "알 수 없는 오류",
      }));
    } finally {
      loadingMoreRef.current = false;
    }
  }, []);

  return { ...state, loadMore };
}
