import { z } from "zod";

import {
  createSettingsConverter,
  NullableKeyString,
  NullableLabelString,
  NullableLocaleString,
  NullableLongTextString,
  NullableString,
} from "./shared";

export const LanguageLabelOverrideSchema = z
	.object({
		key: NullableKeyString.describe(
			"Stable key of the category/filter or custom field definition this translated label override applies to.",
		),
		label: NullableLabelString.describe(
			"Translated user-facing label to use for the matching category/filter or custom field in this language bundle.",
		),
	})
	.describe(
		"Per-language label override for a category/filter or custom field definition, keyed by the original definition key.",
	);

export type LanguageLabelOverride = z.infer<typeof LanguageLabelOverrideSchema>;

export const LanguageContentSchema = z.object({
  locale: NullableLocaleString.describe("Locale code for this language variant, such as en or en-NZ, used to select which translation bundle is being edited."),
  searchPanelHeadingLabel: NullableString.describe("Heading shown above the search and filters panel, such as Search & Filters."),
  resultsPanelHeadingLabel: NullableString.describe("Heading shown above the results panel, such as Results."),
  searchPlaceholder: NullableString.describe("Placeholder text shown inside the search field before a visitor types an address, postcode, or region."),
  searchInputLabel: NullableString.describe("Accessible label used for the main search input field."),
  searchButtonLabel: NullableString.describe("Label displayed on the search button. An empty string can be used when the UI should show only a search icon."),
  loadingLabel: NullableString.describe("Short loading label used on the search button while the locator is busy."),
  loadingLocationsLabel: NullableString.describe("Loading message shown over the map while location results are loading."),
  geolocationButtonLabel: NullableString.describe("Text shown on the use-my-location action when visitors can trigger geolocation manually."),
  geolocationLoadingLabel: NullableString.describe("Loading message shown while visitor geolocation is being resolved."),
  filterDropdownButtonLabel: NullableString.describe("Text used for the filter toggle button when filters are enabled and rendered in a dropdown or similar control."),
  initialMessageHtml: NullableLongTextString.describe("Rich text or HTML message shown before any search is performed to guide first-time locator use."),
  noResultsMessageHtml: NullableLongTextString.describe("Rich text or HTML message shown when a search completes but no matching locations are found."),
  addressNotFoundMessageHtml: NullableLongTextString.describe("Rich text or HTML message shown when the entered address or place name cannot be resolved by the search provider."),
  geolocationErrorMessageHtml: NullableLongTextString.describe("Rich text or HTML error message shown when browser or device geolocation fails, is blocked, or is unavailable."),
  genericErrorMessageHtml: NullableLongTextString.describe("Fallback rich text or HTML message for unexpected locator errors that do not map to a more specific case."),
  directionsLinkLabel: NullableString.describe("Text used for the directions link in map popups or result cards, such as Directions or Get directions."),
  websiteLinkLabel: NullableString.describe("Text for the external website link in location details. An empty string means the raw domain should be displayed instead."),
  popupCloseLabel: NullableString.describe("Accessible label used for popup close buttons."),
  fullscreenToggleLabel: NullableString.describe("Accessible label used for the fullscreen map toggle button."),
  locationLogoAltLabel: NullableString.describe("Fallback alt text used for location logos when no better label is available."),
  debugReportBugLinkLabel: NullableString.describe("Label for the debug-mode report bug action."),
  debugReportBugCloseDialogLabel: NullableString.describe("Accessible label for closing the report bug dialog."),
  debugReportBugDialogTitle: NullableString.describe("Title shown at the top of the report bug dialog."),
  debugReportBugDialogDescription: NullableLongTextString.describe("Description shown inside the report bug dialog."),
  debugReportBugMessageLabel: NullableString.describe("Label shown above the report bug message field."),
  debugReportBugConsentPrefix: NullableString.describe("Consent text shown before the privacy policy link in the report bug dialog."),
  privacyPolicyLinkLabel: NullableString.describe("Label used for the privacy policy link in the report bug dialog."),
  debugReportBugSubmitLabel: NullableString.describe("Label used for the report bug submit button."),
  debugReportBugSubmittingLabel: NullableString.describe("Label used for the report bug submit button while a submission is in progress."),
  debugReportBugCopyLabel: NullableString.describe("Label used for the copy logs button in the report bug dialog."),
  debugReportBugSuccessMessage: NullableString.describe("Confirmation message shown after a bug report is successfully submitted."),
  closeButtonLabel: NullableString.describe("Generic close button label used in the storefront dialog UI."),
  categoryLabels: z.array(LanguageLabelOverrideSchema).max(50).optional().nullable().describe("Per-language label overrides for category/filter definitions, allowing the same underlying category key to be shown with different wording in different languages."),
  customFieldLabels: z.array(LanguageLabelOverrideSchema).max(50).optional().nullable().describe("Per-language label overrides for reusable custom field definitions, allowing storefront field labels to be translated without changing the default admin label."),
  dealerFormFieldLabels: z.array(LanguageLabelOverrideSchema).max(30).optional().nullable().describe("Per-language label overrides for dealer form field definitions, keyed by dealer form field key."),
  dealerFormFieldPlaceholders: z.array(LanguageLabelOverrideSchema).max(30).optional().nullable().describe("Per-language placeholder overrides for dealer form field definitions, keyed by dealer form field key."),
}).describe("Single language bundle containing every user-facing locator string that administrators can customize or translate.");

export type LanguageContent = z.infer<typeof LanguageContentSchema>;

export const LanguageSettingsSchema = z.object({
  primaryLanguage: NullableLocaleString.describe("Default language locale used by the locator unless another enabled translation is selected for the storefront experience."),
  languages: z.array(LanguageContentSchema).max(20).optional().nullable().describe("All editable language bundles, including the primary language and any additional translated languages."),
}).describe("Language settings group for localization and wording customization across the locator search UI, result messages, and link labels.");

export type LanguageSettings = z.infer<typeof LanguageSettingsSchema>;

export const LanguageSettingsConverter = createSettingsConverter(LanguageSettingsSchema);
