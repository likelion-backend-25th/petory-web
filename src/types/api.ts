export interface ApiErrorBody {
  message: string;
}

export function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  );
}

export function readApiErrorMessage(body: unknown, status: number): string {
  if (isApiErrorBody(body) && body.message.trim() !== "") {
    return body.message;
  }
  return `요청에 실패했습니다. (${status})`;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}
