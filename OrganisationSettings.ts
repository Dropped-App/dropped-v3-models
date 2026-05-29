import { z } from "zod";

import {
  CategoriesAndFiltersSettingsConverter,
  CategoriesAndFiltersSettingsSchema,
} from "./settings/categoriesAndFilters";
import { CustomFieldsSettingsConverter, CustomFieldsSettingsSchema } from "./settings/customFields";
import { DealerFormsSettingsConverter, DealerFormsSettingsSchema } from "./settings/dealerForms";
import {
  LanguageSettingsConverter,
  LanguageSettingsSchema,
} from "./settings/language";
import {
  ProviderSettingsConverter,
  ProviderSettingsSchema,
} from "./settings/provider";
import {
  SearchBehaviourSettingsConverter,
  SearchBehaviourSettingsSchema,
} from "./settings/searchBehaviour";
import {
  createSettingsConverter,
} from "./settings/shared";
import { resolveSettings } from "./settings/resolve";

export const SettingsGroupsSchema = z.object({
  categoriesAndFilters: CategoriesAndFiltersSettingsSchema.optional().nullable().describe(
    "Search category and filter definitions plus the display and matching behavior used when visitors refine location results.",
  ),
  customFields: CustomFieldsSettingsSchema.optional().nullable().describe(
    "Custom field definitions used to extend the data stored on locations and optionally expose it in the storefront locator.",
  ),
  dealerForms: DealerFormsSettingsSchema.optional().nullable().describe(
    "Dealer application form field definitions plus email notification preferences for new submissions.",
  ),
  language: LanguageSettingsSchema.optional().nullable().describe(
    "Localized user-facing text bundles for the locator search UI, messages, and links.",
  ),
  provider: ProviderSettingsSchema.optional().nullable().describe(
    "Map provider selection, provider-specific map style settings, and reusable map pin styles including the required default pin.",
  ),
  searchBehaviour: SearchBehaviourSettingsSchema.optional().nullable().describe(
    "Search and map interaction behavior including starting position, clustering, geolocation, distances, and autocomplete constraints.",
  ),
}).describe(
  "Store locator settings groups derived from the plan documents. Each group maps to a dedicated settings panel and is stored against an organisation.",
);

export const SettingsResult = SettingsGroupsSchema.optional().nullable().describe("Organisation-scoped store locator settings. Null implies the organisation has not completed onboarding or saved settings yet.");

export type Settings = z.infer<typeof SettingsResult>;

export const SettingsConverter = createSettingsConverter(SettingsGroupsSchema);

export {
  CategoriesAndFiltersSettingsConverter,
  CategoriesAndFiltersSettingsSchema,
  CustomFieldsSettingsConverter,
  CustomFieldsSettingsSchema,
  DealerFormsSettingsConverter,
  DealerFormsSettingsSchema,
  LanguageSettingsConverter,
  LanguageSettingsSchema,
  ProviderSettingsConverter,
  ProviderSettingsSchema,
  resolveSettings,
  SearchBehaviourSettingsConverter,
  SearchBehaviourSettingsSchema,
};
