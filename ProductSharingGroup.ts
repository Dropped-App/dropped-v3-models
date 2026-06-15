import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { ProductSharingPriceModifierSchema } from "./settings/productSharing";

export const ProductSharingGroupCollection = "productSharingGroups";

export const ProductSharingGroupRuleSetSchema = z.object({
  productIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  collectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
});

export const ProductSharingGroupEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  name: z.string().min(1).max(120),
  key: z.string().min(1),
  shareActiveProductsOnly: z.boolean().optional().nullable(),
  includeRules: ProductSharingGroupRuleSetSchema.optional().nullable(),
  excludeRules: ProductSharingGroupRuleSetSchema.optional().nullable(),
  priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductSharingGroupEntity = z.infer<typeof ProductSharingGroupEntitySchema>;
