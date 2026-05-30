import { z } from "zod";

import {
  ProductSharingSettingsConverter,
  ProductSharingSettingsSchema,
} from "./settings/productSharing";
import { createSettingsConverter } from "./settings/shared";
import { resolveSettings } from "./settings/resolve";

export const SettingsGroupsSchema = z
  .object({
    productSharing: ProductSharingSettingsSchema.optional().nullable().describe(
      "Product sharing sender and receiver configuration defaults, matching behavior, pricing behavior, and metafield prompt suppressions.",
    ),
  })
  .describe("Organisation-scoped settings groups still used by this backend.");

export const SettingsResult = SettingsGroupsSchema.optional().nullable().describe(
  "Organisation-scoped settings. Null implies the organisation has not saved settings yet.",
);

export type Settings = z.infer<typeof SettingsResult>;

export const SettingsConverter = createSettingsConverter(SettingsGroupsSchema);

export {
  ProductSharingSettingsConverter,
  ProductSharingSettingsSchema,
  resolveSettings,
};
