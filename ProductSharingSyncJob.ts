import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingSyncJobCollection = "productSharingSyncJobs";

export const ProductSharingSyncOperationSchema = z.enum(["IMPORT", "UPDATE"]);
export const ProductSharingSyncJobStatusSchema = z.enum([
  "PENDING",
  "FAILED",
  "COMPLETED",
  "RETRIED",
  "CANCELLED",
]);
export const ProductSharingSyncItemStatusSchema = z.enum([
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "SKIPPED",
]);

export const ProductSharingSyncJobItemSchema = z.object({
  senderProductId: z.string().min(1),
  groupId: z.string().min(1),
  status: ProductSharingSyncItemStatusSchema,
  receiverProductId: z.string().optional().nullable(),
  error: z.string().optional().nullable(),
});

export const ProductSharingSyncJobPayloadSchema = z.object({
  type: z.literal("PRODUCT_SHARING_SYNC"),
  jobId: z.string().min(1),
  queuedAt: z.string().min(1),
});

export type ProductSharingSyncJobPayload = z.infer<typeof ProductSharingSyncJobPayloadSchema>;

export const ProductSharingSyncJobEntitySchema = z.object({
  _id: ObjectIdSchema,
  senderOrg: ObjectIdSchema,
  receiverOrg: ObjectIdSchema,
  operation: ProductSharingSyncOperationSchema,
  createMissingMetafieldDefinitions: z.boolean().optional().nullable(),
  status: ProductSharingSyncJobStatusSchema,
  items: z.array(ProductSharingSyncJobItemSchema).min(1).max(25),
  leaseToken: z.string().optional().nullable(),
  leaseExpiresAt: z.date().optional().nullable(),
  requestedAt: z.date(),
  completedAt: z.date().optional().nullable(),
  failedAt: z.date().optional().nullable(),
  cancelledAt: z.date().optional().nullable(),
  retriedAt: z.date().optional().nullable(),
});

export type ProductSharingSyncJobEntity = z.infer<typeof ProductSharingSyncJobEntitySchema>;
