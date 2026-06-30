import { z } from "zod";

import {
  ProductSharingSettingsConverter,
  ProductSharingSettingsSchema,
} from "./settings/productSharing";
import { createSettingsConverter } from "./settings/shared";
import { resolveSettings } from "./settings/resolve";
import { sanitizeSettingsGroups } from "./settings/sanitize";

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

const BaseSettingsConverter = createSettingsConverter(SettingsGroupsSchema);

export const SettingsConverter = {
  parse(input: unknown) {
    return BaseSettingsConverter.parse(input);
  },
  convertFromEntity(input: Settings | null | undefined) {
    if (input === null || input === undefined) {
      return null;
    }

    return BaseSettingsConverter.convertFromEntity(sanitizeSettingsGroups(input));
  },
  convertToEntity(input: Settings | null | undefined) {
    return BaseSettingsConverter.convertToEntity(input);
  },
};

export {
  ProductSharingSettingsConverter,
  ProductSharingSettingsSchema,
  resolveSettings,
};
