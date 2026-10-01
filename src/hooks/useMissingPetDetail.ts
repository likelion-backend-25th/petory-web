import { useCallback, useEffect, useState } from "react";
import { getMissingPet } from "@/api/missingPet";
import type { MissingPetDetailResponse } from "@/types/missingPet";

interface MissingPetDetailState {
  missingPet: MissingPetDetailResponse | null;
  status: "loading" | "error" | "success";
  errorMessage: string | null;
}

const initialState: MissingPetDetailState = {
  missingPet: null,
  status: "loading",
  errorMessage: null,
};

function parseMissingPetId(value: string | undefined): number | null {
  if (value === undefined || !/^\d+$/.test(value)) {
    return null;
  }
  return Number(value);
}

export function useMissingPetDetail(idParam: string | undefined) {
  const id = parseMissingPetId(idParam);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<MissingPetDetailState>(initialState);

  useEffect(() => {
    if (id === null) {
      return;
    }

    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const missingPet = await getMissingPet(id, controller.signal);
        if (!controller.signal.aborted) {
          setState({
            missingPet,
            status: "success",
            errorMessage: null,
          });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            missingPet: null,
            status: "error",
            errorMessage: error instanceof Error ? error.message : "알 수 없는 오류",
          });
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [id, revision]);

  const reload = useCallback(() => {
    setState(initialState);
    setRevision((current) => current + 1);
  }, []);

  if (id === null) {
    return {
      missingPet: null,
      status: "error" as const,
      errorMessage: "올바르지 않은 실종 신고입니다.",
      id,
      reload,
    };
  }

  return { ...state, id, reload };
}
