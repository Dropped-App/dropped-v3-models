import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingConnectionCollection = "productSharingConnections";

export const ProductSharingConnectionStatusSchema = z.enum([
  "ACTIVE",
  "REMOVED_BY_SENDER",
  "REMOVED_BY_RECEIVER",
  "BLOCKED",
  "ACCESS_REMOVED",
]);

export const ProductSharingConnectionSourceSchema = z.enum([
  "GROUP_KEY",
  "STORE_KEY",
  "EXISTING_RECEIVER",
]);

export const ProductSharingConnectionEntitySchema = z.object({
  _id: ObjectIdSchema,
  senderOrg: ObjectIdSchema,
  receiverOrg: ObjectIdSchema,
  group: ObjectIdSchema,
  status: ProductSharingConnectionStatusSchema,
  source: ProductSharingConnectionSourceSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  removedAt: z.date().optional().nullable(),
});

export type ProductSharingConnectionEntity = z.infer<typeof ProductSharingConnectionEntitySchema>;
