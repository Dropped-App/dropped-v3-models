import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingMetafieldDefinitionSnapshotCollection =
  "productSharingMetafieldDefinitionSnapshots";

export const ProductSharingMetafieldDefinitionOwnerTypeSchema = z.enum(["PRODUCT", "VARIANT"]);

export const ProductSharingMetafieldDefinitionSchema = z.object({
  ownerType: ProductSharingMetafieldDefinitionOwnerTypeSchema,
  namespace: z.string().min(1),
  key: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  validations: z.array(z.record(z.string(), z.string())).max(50).optional().nullable(),
});

export const ProductSharingMetafieldDefinitionSnapshotEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  checksum: z.string().min(1),
  definitions: z.array(ProductSharingMetafieldDefinitionSchema).max(5000),
  updatedAt: z.date(),
});

export type ProductSharingMetafieldDefinitionSnapshotEntity = z.infer<
  typeof ProductSharingMetafieldDefinitionSnapshotEntitySchema
>;
