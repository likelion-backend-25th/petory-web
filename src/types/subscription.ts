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

export interface MySubscription {
  id: number;
  memberId: number;
  targetMemberId: number;
  targetMember: string;
  planName: string;
  startedAt: string;
  nextBillingAt: string | null;
  agreement: boolean;
}
