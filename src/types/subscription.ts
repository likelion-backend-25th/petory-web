export interface SubscriptionPlan {
  id: number;
  memberId: number;
  planName: string;
  price: number;
  description: string;
  status: string;
}

export interface SubscriptionCreatePayload {
  targetMemberId: number;
  planId: number;
  billingKey: string;
}
