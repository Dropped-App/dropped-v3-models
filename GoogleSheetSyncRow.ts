import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const GoogleSheetSyncRowEntitySchema = z.object({
  _id: ObjectIdSchema,
  sync: ObjectIdSchema,
  org: ObjectIdSchema,
  externalId: z.string().min(1),
  locationId: ObjectIdSchema,
  rowHash: z.string().min(1),
  rowNumber: z.number().int().positive(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type GoogleSheetSyncRowEntity = z.infer<typeof GoogleSheetSyncRowEntitySchema>;
