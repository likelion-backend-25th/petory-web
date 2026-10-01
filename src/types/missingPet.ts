export type MissingPetStatus = "MISSING" | "FOUND" | "CANCELLED";

export interface MissingPetCreateRequest {
  missingDate: string;
  missingAddress: string;
  detail: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface MissingPetUpdateRequest {
  missingDate?: string;
  missingAddress?: string;
  detail?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface MissingPetStatusUpdateRequest {
  status: MissingPetStatus;
}

export interface MissingPetListResponse {
  id?: number;
  imageUrl?: string;
}

export interface MissingPetListPageResponse {
  totalCount?: number;
  items?: MissingPetListResponse[];
  nextCursor?: number | null;
  hasNext?: boolean;
}

export interface MemberSummaryResponse {
  id?: number;
  nickname?: string;
  profileImage?: string;
}

export interface MissingPetReportResponse {
  id?: number;
  reporter?: MemberSummaryResponse;
  address?: string;
  detail?: string;
  imageUrl?: string;
  sightAt?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface MissingPetDetailResponse {
  id?: number;
  author?: MemberSummaryResponse;
  missingDate?: string;
  missingAddress?: string;
  detail?: string;
  imageUrl?: string;
  status?: MissingPetStatus;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  reports?: MissingPetReportResponse[];
}

export interface PresignUploadRequest {
  filename: string;
  contentType: string;
}

export interface PresignUploadResponse {
  uploadUrl?: string;
  fileUrl?: string;
  key?: string;
}
