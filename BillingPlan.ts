import { z } from "zod";

export const BillingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  limit: z.number(),
});

export type BillingPlan = z.infer<typeof BillingPlanSchema>;

export const PLANS: BillingPlan[] = [
  {
    id: "LIFETIME-FREE",
    name: "Lifetime Free",
    limit: 1000,
  },
  {
    id: "FREE",
    name: "Lifetime Free",
    limit: 100,
  },
  {
    id: "STARTER",
    name: "Starter",
    limit: 500,
  },
  {
    id: "GROWTH",
    name: "Growth",
    limit: 1_000,
  },
  {
    id: "PRO",
    name: "Pro",
    limit: 2_500,
  },
  {
    id: "VIP",
    name: "VIP",
    limit: 2_500,
  },
];
