import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingBlockCollection = "productSharingBlocks";

export const ProductSharingBlockEntitySchema = z.object({
  _id: ObjectIdSchema,
  senderOrg: ObjectIdSchema,
  receiverOrg: ObjectIdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductSharingBlockEntity = z.infer<typeof ProductSharingBlockEntitySchema>;
