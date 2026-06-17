import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingHistoryEventCollection = "productSharingHistoryEvents";

export const ProductSharingHistoryStatusSchema = z.enum(["SUCCEEDED", "FAILED", "SKIPPED"]);

export const ProductSharingHistoryVariantDetailSchema = z.object({
  senderVariantId: z.string().min(1),
  receiverVariantId: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
});

export const ProductSharingHistoryEventEntitySchema = z.object({
  _id: ObjectIdSchema,
  senderOrg: ObjectIdSchema,
  receiverOrg: ObjectIdSchema,
  group: ObjectIdSchema,
  senderProductId: z.string().min(1),
  receiverProductId: z.string().optional().nullable(),
  senderChecksum: z.string().optional().nullable(),
  importedFields: z.array(z.string().min(1)).max(200),
  variantDetails: z.array(ProductSharingHistoryVariantDetailSchema).max(500),
  status: ProductSharingHistoryStatusSchema,
  error: z.string().optional().nullable(),
  happenedAt: z.date(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export type ProductSharingHistoryEventEntity = z.infer<
  typeof ProductSharingHistoryEventEntitySchema
>;
