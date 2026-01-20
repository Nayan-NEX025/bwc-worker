// Mocking subscription plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: "basic",
    name: "Basic Plan",
    price: 999,
    durationInDays: 30,
  },
  PRO: {
    id: "pro",
    name: "Pro Plan",
    price: 2499,
    durationInDays: 90,
  },
  PREMIUM: {
    id: "premium",
    name: "Premium Plan",
    price: 8999,
    durationInDays: 365,
  },
};

export const SUBSCRIPTION_PLAN_IDS = Object.values(SUBSCRIPTION_PLANS).map(
  (p) => p.id
);

export const SUBSCRIPTION_STATUS = {
  TRIALING: "trialing",
  PAUSED: "paused",
  ACTIVE: "active",
  EXPIRED: "expired",
  REJECTED: "rejected",
  CANCELED: "canceled",
  INACTIVE: "inactive",
  PENDING: "pending",
  COMPLETED: "completed",
  INCOMPLETE: "incomplete",
  INCOMPLETE_EXPIRED: "incomplete_expired",
  PAST_DUE: "past_due",
  UNPAID: "unpaid",
};

export const SUBSCRIPTION_STATUS_VALUES = Object.values(SUBSCRIPTION_STATUS);
