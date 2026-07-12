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
    limit: 0,
  },
  {
    id: "FREE",
    name: "Lifetime Free",
    limit: 0,
  },
  {
    id: "STARTER",
    name: "Starter",
    limit: 1,
  },
  {
    id: "GROWTH",
    name: "Growth",
    limit: 1,
  },
  {
    id: "PRO",
    name: "Pro",
    limit: 1,
  },
  {
    id: "VIP",
    name: "VIP",
    limit: 1,
  },
];
