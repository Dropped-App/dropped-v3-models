import { type Settings } from "../OrganisationSettings";
import {
  type CategoriesAndFiltersSettings,
  type CategoryFilterDefinition,
} from "./categoriesAndFilters";
import { type CustomFieldDefinition, type CustomFieldsSettings } from "./customFields";
import {
  DEFAULT_DEALER_FORM_FIELDS,
  type DealerFormsSettings,
  type DealerFormFieldDefinition,
} from "./dealerForms";
import { type LanguageContent, type LanguageSettings } from "./language";
import { type MapPinStyle, type ProviderSettings } from "./provider";
import { type SearchBehaviourSettings, type SearchStartingArea } from "./searchBehaviour";

type ResolvableSettingsInput = {
  searchBehaviour?: SearchBehaviourSettings | null;
  provider?: ProviderSettings | null;
  categoriesAndFilters?: CategoriesAndFiltersSettings | null;
  customFields?: CustomFieldsSettings | null;
  dealerForms?: DealerFormsSettings | null;
  language?: LanguageSettings | null;
} | null | undefined;

const DEFAULT_STARTING_AREA: SearchStartingArea = {
  label: "",
  lat: 20,
  lng: 0,
  zoom: 2,
};

const DEFAULT_PIN_STYLE: MapPinStyle = {
  name: "Default pin",
  pinType: "STANDARD_PIN_ICON",
  pinColor: "#FB2C36",
  customImageUrl: "",
  customImageDisplayMode: "IMAGE_ONLY",
  retinaSupport: true,
};

const DEFAULT_LANGUAGE_CONTENT: Omit<LanguageContent, "locale"> = {
  searchPanelHeadingLabel: "Search & Filters",
  resultsPanelHeadingLabel: "Results",
  searchPlaceholder: "Search by city, postcode, or address",
  searchInputLabel: "Search by city, postcode, or address",
  searchButtonLabel: "Search",
  loadingLabel: "Loading",
  loadingLocationsLabel: "Loading locations...",
  geolocationButtonLabel: "Use my location",
  geolocationLoadingLabel: "Finding your location...",
  filterDropdownButtonLabel: "Filter results",
  initialMessageHtml: "Enter your city or postcode to find nearby locations.",
  noResultsMessageHtml: "Sorry, we couldn’t find any matching locations.",
  addressNotFoundMessageHtml: "We couldn’t recognize that address. Try another search.",
  geolocationErrorMessageHtml:
    "We couldn’t access your location. Check your browser settings and try again.",
  genericErrorMessageHtml: "Something went wrong. Please try again.",
  directionsLinkLabel: "Directions",
  websiteLinkLabel: "Website",
  popupCloseLabel: "Close popup",
  fullscreenToggleLabel: "Toggle fullscreen map",
  locationLogoAltLabel: "Location logo",
  debugReportBugLinkLabel: "report a bug",
  debugReportBugCloseDialogLabel: "Close report bug popup",
  debugReportBugDialogTitle: "Report bug",
  debugReportBugDialogDescription:
    "If you have encountered a bug with your map please leave a message describing your issue and our team will be notified.",
  debugReportBugMessageLabel: "Message",
  debugReportBugConsentPrefix:
    "By submitting your bug you consent to your app usage logs and user agent details being shared with our team, see our",
  privacyPolicyLinkLabel: "privacy policy",
  debugReportBugSubmitLabel: "Submit",
  debugReportBugSubmittingLabel: "Submitting...",
  debugReportBugCopyLabel: "Copy logs to clipboard",
  debugReportBugSuccessMessage: "Your bug report has been received.",
  closeButtonLabel: "Close",
  categoryLabels: [],
  customFieldLabels: [],
  dealerFormFieldLabels: [],
  dealerFormFieldPlaceholders: [],
};

const DEFAULT_DEALER_NOTIFICATION_ACCENT_COLOR = "#2563eb";
const DEFAULT_DEALER_NOTIFICATION_SUBJECT = "Your submission has been received.";
const DEFAULT_DEALER_NOTIFICATION_BODY = "Hi {name},\n\nYour submission has been received. We will contact you once your submission has been accepted or if we have any questions.";
const DEFAULT_DEALER_PUBLISHED_SUBJECT = "Your submission has been published";
const DEFAULT_DEALER_PUBLISHED_BODY = "Hi {name},\n\nYour dealer submission has been published and your listing will appear on our stockists map shortly.";

function resolveSearchBehaviourSettings(
  settings?: SearchBehaviourSettings | null,
): SearchBehaviourSettings {
  return {
    startingPositionMode: settings?.startingPositionMode ?? "FIT_ALL_LOCATIONS",
    startingArea: {
      ...DEFAULT_STARTING_AREA,
      ...(settings?.startingArea || {}),
    },
    clusterLocationsWhenZoomedOut: settings?.clusterLocationsWhenZoomedOut ?? true,
    clusteringZoomLevel: settings?.clusteringZoomLevel ?? 8,
    automaticGeolocation: settings?.automaticGeolocation ?? false,
    geolocationMethod: settings?.geolocationMethod ?? "IP_ADDRESS",
    typedSearchDistanceMode: settings?.typedSearchDistanceMode ?? "BOTH",
    searchRadius: settings?.searchRadius ?? 25,
    geolocationRadius: settings?.geolocationRadius ?? 25,
    maximumResults: settings?.maximumResults ?? 100,
    distanceUnit: settings?.distanceUnit ?? "KILOMETERS",
    searchSuggestionMode: settings?.searchSuggestionMode ?? "REGIONS_AND_ADDRESSES",
    countryLockMode: settings?.countryLockMode ?? "DISABLED",
    countryCodes: settings?.countryCodes ?? [],
  };
}

function resolveProviderSettings(
  settings?: ProviderSettings | null,
): ProviderSettings {
  const provider = settings?.provider ?? "LEAFLET";
  const defaultThemeId =
    provider === "MAPBOX" ? "STREETS" : (provider === "GOOGLE_MAPS" ? "ROADMAP" : "OPENSTREETMAP_STANDARD");

  return {
    provider,
    apiKey: settings?.apiKey ?? "",
    mapThemeMode: settings?.mapThemeMode ?? "PROVIDER_DEFAULT",
    mapThemeId: settings?.mapThemeId ?? defaultThemeId,
    mapThemeStyleCode: settings?.mapThemeStyleCode ?? "",
    defaultPinStyle: {
      ...DEFAULT_PIN_STYLE,
      ...(settings?.defaultPinStyle || {}),
    },
  };
}

function resolveCategoriesAndFiltersSettings(
  settings?: CategoriesAndFiltersSettings | null,
): CategoriesAndFiltersSettings {
  return {
    categories: (settings?.categories || []).map((category): CategoryFilterDefinition => ({
      key: category.key ?? "",
      label: category.label ?? "",
      showInSearch: category.showInSearch ?? true,
      showOnListing: category.showOnListing ?? true,
      pinStyle: category.pinStyle
        ? {
            name: category.pinStyle.name ?? "",
            pinType: category.pinStyle.pinType ?? "STANDARD_PIN_ICON",
            pinColor: category.pinStyle.pinColor ?? "#FB2C36",
            customImageUrl: category.pinStyle.customImageUrl ?? "",
            customImageDisplayMode: category.pinStyle.customImageDisplayMode ?? "IMAGE_ONLY",
            retinaSupport: category.pinStyle.retinaSupport ?? true,
          }
        : null,
    })),
    multipleSelectionMode: settings?.multipleSelectionMode ?? "MATCH_ANY",
  };
}

function resolveCustomFieldsSettings(
  settings?: CustomFieldsSettings | null,
): CustomFieldsSettings {
  return {
    fields: (settings?.fields || []).map((field): CustomFieldDefinition => ({
      key: field.key ?? "",
      label: field.label ?? "",
      type: field.type ?? "TEXT",
      showOnListing: field.showOnListing ?? true,
    })),
  };
}

function resolveDealerFormsSettings(
  settings?: DealerFormsSettings | null,
): DealerFormsSettings {
  const fields = (settings?.fields || []).length
    ? (settings?.fields || []).map((field): DealerFormFieldDefinition => ({
        key: field.key ?? "",
        label: field.label ?? "",
        placeholder: field.placeholder ?? "",
        type: field.type ?? "TEXT",
        required: field.required ?? false,
        locked: field.locked ?? false,
        options: (field.options || []).map((option) => ({
          label: option.label ?? "",
          value: option.value ?? "",
        })),
      }))
    : DEFAULT_DEALER_FORM_FIELDS;

  return {
    fields,
    notificationEnabled: settings?.notificationEnabled ?? true,
    notificationEmail: settings?.notificationEmail ?? "",
    dealerNotificationEnabled: settings?.dealerNotificationEnabled ?? true,
    notificationAccentColor:
      settings?.notificationAccentColor?.trim() || DEFAULT_DEALER_NOTIFICATION_ACCENT_COLOR,
    dealerNotificationSubject:
      settings?.dealerNotificationSubject?.trim() || DEFAULT_DEALER_NOTIFICATION_SUBJECT,
    dealerNotificationBody:
      settings?.dealerNotificationBody?.trim() || DEFAULT_DEALER_NOTIFICATION_BODY,
    dealerPublishedSubject:
      settings?.dealerPublishedSubject?.trim() || DEFAULT_DEALER_PUBLISHED_SUBJECT,
    dealerPublishedBody: settings?.dealerPublishedBody?.trim() || DEFAULT_DEALER_PUBLISHED_BODY,
    recaptchaSiteKey: settings?.recaptchaSiteKey?.trim() || "",
    recaptchaSecretKey: settings?.recaptchaSecretKey?.trim() || "",
    recaptchaVersion: settings?.recaptchaVersion ?? null,
  };
}

function createDefaultLanguageContent(locale: string): LanguageContent {
  return {
    locale,
    ...DEFAULT_LANGUAGE_CONTENT,
  };
}

function createLanguageContent(language?: LanguageContent | null): LanguageContent {
  return {
    locale: language?.locale ?? "en",
    searchPanelHeadingLabel:
      language?.searchPanelHeadingLabel ?? DEFAULT_LANGUAGE_CONTENT.searchPanelHeadingLabel,
    resultsPanelHeadingLabel:
      language?.resultsPanelHeadingLabel ?? DEFAULT_LANGUAGE_CONTENT.resultsPanelHeadingLabel,
    searchPlaceholder: language?.searchPlaceholder ?? DEFAULT_LANGUAGE_CONTENT.searchPlaceholder,
    searchInputLabel: language?.searchInputLabel ?? DEFAULT_LANGUAGE_CONTENT.searchInputLabel,
    searchButtonLabel: language?.searchButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.searchButtonLabel,
    loadingLabel: language?.loadingLabel ?? DEFAULT_LANGUAGE_CONTENT.loadingLabel,
    loadingLocationsLabel:
      language?.loadingLocationsLabel ?? DEFAULT_LANGUAGE_CONTENT.loadingLocationsLabel,
    geolocationButtonLabel:
      language?.geolocationButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.geolocationButtonLabel,
    geolocationLoadingLabel:
      language?.geolocationLoadingLabel ?? DEFAULT_LANGUAGE_CONTENT.geolocationLoadingLabel,
    filterDropdownButtonLabel:
      language?.filterDropdownButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.filterDropdownButtonLabel,
    initialMessageHtml: language?.initialMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.initialMessageHtml,
    noResultsMessageHtml:
      language?.noResultsMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.noResultsMessageHtml,
    addressNotFoundMessageHtml:
      language?.addressNotFoundMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.addressNotFoundMessageHtml,
    geolocationErrorMessageHtml:
      language?.geolocationErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.geolocationErrorMessageHtml,
    genericErrorMessageHtml:
      language?.genericErrorMessageHtml ?? DEFAULT_LANGUAGE_CONTENT.genericErrorMessageHtml,
    directionsLinkLabel: language?.directionsLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.directionsLinkLabel,
    websiteLinkLabel: language?.websiteLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.websiteLinkLabel,
    popupCloseLabel: language?.popupCloseLabel ?? DEFAULT_LANGUAGE_CONTENT.popupCloseLabel,
    fullscreenToggleLabel:
      language?.fullscreenToggleLabel ?? DEFAULT_LANGUAGE_CONTENT.fullscreenToggleLabel,
    locationLogoAltLabel:
      language?.locationLogoAltLabel ?? DEFAULT_LANGUAGE_CONTENT.locationLogoAltLabel,
    debugReportBugLinkLabel:
      language?.debugReportBugLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugLinkLabel,
    debugReportBugCloseDialogLabel:
      language?.debugReportBugCloseDialogLabel ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugCloseDialogLabel,
    debugReportBugDialogTitle:
      language?.debugReportBugDialogTitle ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugDialogTitle,
    debugReportBugDialogDescription:
      language?.debugReportBugDialogDescription ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugDialogDescription,
    debugReportBugMessageLabel:
      language?.debugReportBugMessageLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugMessageLabel,
    debugReportBugConsentPrefix:
      language?.debugReportBugConsentPrefix ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugConsentPrefix,
    privacyPolicyLinkLabel:
      language?.privacyPolicyLinkLabel ?? DEFAULT_LANGUAGE_CONTENT.privacyPolicyLinkLabel,
    debugReportBugSubmitLabel:
      language?.debugReportBugSubmitLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugSubmitLabel,
    debugReportBugSubmittingLabel:
      language?.debugReportBugSubmittingLabel ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugSubmittingLabel,
    debugReportBugCopyLabel:
      language?.debugReportBugCopyLabel ?? DEFAULT_LANGUAGE_CONTENT.debugReportBugCopyLabel,
    debugReportBugSuccessMessage:
      language?.debugReportBugSuccessMessage ??
      DEFAULT_LANGUAGE_CONTENT.debugReportBugSuccessMessage,
    closeButtonLabel: language?.closeButtonLabel ?? DEFAULT_LANGUAGE_CONTENT.closeButtonLabel,
    categoryLabels: language?.categoryLabels ?? [],
    customFieldLabels: language?.customFieldLabels ?? [],
    dealerFormFieldLabels: language?.dealerFormFieldLabels ?? [],
    dealerFormFieldPlaceholders: language?.dealerFormFieldPlaceholders ?? [],
  };
}

function resolveLanguageSettings(
  settings?: LanguageSettings | null,
): LanguageSettings {
  const primaryLanguage = settings?.primaryLanguage?.trim() || "en";
  const languages = (settings?.languages || []).length
    ? (settings?.languages || []).map((language) => createLanguageContent(language))
    : [createDefaultLanguageContent(primaryLanguage)];

  if (!languages.some((language) => language.locale === primaryLanguage)) {
    languages.unshift(createDefaultLanguageContent(primaryLanguage));
  }

  return {
    primaryLanguage,
    languages,
  };
}

export function resolveSettings(settings?: ResolvableSettingsInput): NonNullable<Settings> {
  return {
    searchBehaviour: resolveSearchBehaviourSettings(settings?.searchBehaviour),
    provider: resolveProviderSettings(settings?.provider),
    categoriesAndFilters: resolveCategoriesAndFiltersSettings(settings?.categoriesAndFilters),
    customFields: resolveCustomFieldsSettings(settings?.customFields),
    dealerForms: resolveDealerFormsSettings(settings?.dealerForms),
    language: resolveLanguageSettings(settings?.language),
  };
}
