import { z } from "zod";

export const GoogleSheetSyncJobPayloadSchema = z.object({
  type: z.literal("GOOGLE_SHEET_SYNC"),
  syncId: z.string().min(1),
  leaseToken: z.string().min(1),
  queuedAt: z.string().min(1),
});

export type GoogleSheetSyncJobPayload = z.infer<typeof GoogleSheetSyncJobPayloadSchema>;
