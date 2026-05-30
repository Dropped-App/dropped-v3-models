import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingLinkageCollection = "productSharingLinkages";

export const ProductSharingLinkageEntitySchema = z.object({
  _id: ObjectIdSchema,
  senderOrg: ObjectIdSchema,
  receiverOrg: ObjectIdSchema,
  senderProductId: z.string().min(1),
  receiverProductId: z.string().min(1),
  originalGroup: ObjectIdSchema,
  activeGroup: ObjectIdSchema.optional().nullable(),
  lastDownloadedChecksum: z.string().optional().nullable(),
  lastDownloadedAt: z.date().optional().nullable(),
  excludedVariantIds: z.array(z.string().min(1)).max(1000),
  excludedOptionValues: z.array(z.string().min(1)).max(1000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductSharingLinkageEntity = z.infer<typeof ProductSharingLinkageEntitySchema>;
