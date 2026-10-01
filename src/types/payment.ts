export type PaymentMerchandise = "singlePayment" | "automaticPayment";

export interface PaymentPrepareRequest {
  targetMemberId: number;
  orderName: string;
  totalAmount: number;
  merchandise: PaymentMerchandise;
}

export interface PaymentPrepareResponse {
  id: number;
  memberId: number;
  targetMemberId: number;
  paymentId: string;
  orderName: string;
  currency: string;
  totalAmount: number;
  payMethod: string;
}

export interface PaymentCompleteRequest {
  paymentId: string;
}

export type PaymentStatus = "READY" | "PAID" | "FAILED" | "CANCELLED";

export interface PaymentCompleteResult {
  paymentId: string;
  status: PaymentStatus;
  paidAmount: number | null;
  message: string;
}

export interface PaymentHistoryResponse {
  paymentId: string;
  targetMemberId: number;
  orderName: string;
  currency: string;
  totalAmount: number;
  paidAmount: number | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
}

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    value === "READY" ||
    value === "PAID" ||
    value === "FAILED" ||
    value === "CANCELLED"
  );
}

export function isPaymentCompleteResult(body: unknown): body is PaymentCompleteResult {
  return (
    typeof body === "object" &&
    body !== null &&
    "paymentId" in body &&
    typeof body.paymentId === "string" &&
    "status" in body &&
    isPaymentStatus(body.status)
  );
}
