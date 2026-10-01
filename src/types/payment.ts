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

export interface PaymentCompleteResult {
  paymentId: string;
  status: string;
  paidAmount: number;
  message: string;
}

export function isPaymentCompleteResult(body: unknown): body is PaymentCompleteResult {
  return (
    typeof body === "object" &&
    body !== null &&
    "paymentId" in body &&
    typeof body.paymentId === "string" &&
    "status" in body &&
    typeof body.status === "string"
  );
}
