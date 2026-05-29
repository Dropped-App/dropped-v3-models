import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const DealerFormEmailUnsubscribeEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  email: z.string().email(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormEmailUnsubscribeEntity = z.infer<
  typeof DealerFormEmailUnsubscribeEntitySchema
>;
