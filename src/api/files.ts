import { apiClient } from "@/lib/apiClient";

const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export interface PresignUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export function imageContentType(file: File): string {
  return file.type === "image/jpg" ? "image/jpeg" : file.type;
}

export function isUploadableImage(file: File): boolean {
  return ALLOWED_CONTENT_TYPES.has(imageContentType(file)) && file.size > 0;
}

function isPresignUploadResponse(value: unknown): value is PresignUploadResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.uploadUrl === "string" &&
    typeof record.fileUrl === "string" &&
    typeof record.key === "string"
  );
}

export async function uploadImage(file: File): Promise<string> {
  const contentType = imageContentType(file);
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error("JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.");
  }

  const body: unknown = await apiClient<unknown>("/files/presign", {
    method: "POST",
    body: { filename: file.name, contentType },
  });
  if (!isPresignUploadResponse(body)) {
    throw new Error("업로드 주소를 받지 못했습니다.");
  }

  const uploaded = await fetch(body.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!uploaded.ok) {
    throw new Error("S3 업로드에 실패했습니다.");
  }
  return body.fileUrl;
}
