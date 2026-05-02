// Shared plan limits — mirrors backend PLAN_LIMITS in Company.ts
// Keep these in sync if plan values change.

export const PLAN_LIMITS = {
  starter: {
    credits: 2,
    resetsMonthly: false,
    teamSeats: 1,
  },
  growth: {
    credits: 15,
    resetsMonthly: true,
    teamSeats: 5,
  },
  enterprise: {
    credits: -1,   // -1 = unlimited
    resetsMonthly: true,
    teamSeats: -1, // -1 = unlimited
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
