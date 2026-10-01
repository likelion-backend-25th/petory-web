import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import {
  isPaymentCompleteResult,
  type PaymentCompleteRequest,
  type PaymentCompleteResult,
  type PaymentHistoryResponse,
  type PaymentPrepareRequest,
  type PaymentPrepareResponse,
} from "@/types/payment";

export function getMyPayments(signal?: AbortSignal): Promise<PaymentHistoryResponse[]> {
  return apiClient<PaymentHistoryResponse[]>("/payments/me", { signal });
}

export function preparePayment(payload: PaymentPrepareRequest): Promise<PaymentPrepareResponse> {
  return apiClient<PaymentPrepareResponse>("/payments/prepare", {
    method: "POST",
    body: payload,
  });
}

export async function completePayment(
  payload: PaymentCompleteRequest,
): Promise<PaymentCompleteResult> {
  try {
    return await apiClient<PaymentCompleteResult>("/payments/complete", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    // 400이면서 paymentId가 있으면 검증 결과 DTO다.
    if (error instanceof ApiError && isPaymentCompleteResult(error.body)) {
      return error.body;
    }
    if (error instanceof ApiError && error.status === 502) {
      throw new Error("잠시 후 다시 시도해 주세요.", { cause: error });
    }
    throw error;
  }
}
