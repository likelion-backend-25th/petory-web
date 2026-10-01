import { apiClient } from "@/lib/apiClient";
import type {
  MissingPetCreateRequest,
  MissingPetDetailResponse,
  MissingPetListPageResponse,
  MissingPetStatusUpdateRequest,
  MissingPetUpdateRequest,
  PresignUploadResponse,
} from "@/types/missingPet";

const MISSING_PETS_PATH = "/missing-pets";

export interface GetMissingPetsParams {
  cursor?: number;
  size?: number;
}

export function getMissingPets(
  params: GetMissingPetsParams = {},
  signal?: AbortSignal,
): Promise<MissingPetListPageResponse> {
  return apiClient<MissingPetListPageResponse>(MISSING_PETS_PATH, {
    signal,
    query: {
      cursor: params.cursor,
      size: params.size ?? 10,
    },
  });
}

export function getMissingPet(
  id: number,
  signal?: AbortSignal,
): Promise<MissingPetDetailResponse> {
  return apiClient<MissingPetDetailResponse>(`${MISSING_PETS_PATH}/${id}`, { signal });
}

export function createMissingPet(payload: MissingPetCreateRequest): Promise<number> {
  return apiClient<number>(MISSING_PETS_PATH, {
    method: "POST",
    body: payload,
  });
}

export function updateMissingPet(
  id: number,
  payload: MissingPetUpdateRequest,
): Promise<void> {
  return apiClient<void>(`${MISSING_PETS_PATH}/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateMissingPetStatus(
  id: number,
  payload: MissingPetStatusUpdateRequest,
): Promise<void> {
  return apiClient<void>(`${MISSING_PETS_PATH}/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export async function uploadMissingPetImage(file: File): Promise<string> {
  const presigned = await apiClient<PresignUploadResponse>("/files/presign", {
    method: "POST",
    body: {
      filename: file.name,
      contentType: file.type,
    },
  });

  if (!presigned.uploadUrl || !presigned.fileUrl) {
    throw new Error("이미지 업로드 주소를 발급받지 못했습니다.");
  }

  const response = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  return presigned.fileUrl;
}
