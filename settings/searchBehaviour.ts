import { z } from "zod";

import {
  createSettingsConverter,
  NullableBoolean,
  NullableLabelString,
  NullableNumber,
  NullableString,
} from "./shared";

export const SearchStartingPositionModeSchema = z
  .enum(["FIT_ALL_LOCATIONS", "SPECIFIC_AREA"])
  .optional()
  .nullable()
  .describe("Initial map loading strategy: fit the viewport to all locations or focus on an administrator-defined area.");

export const SearchGeolocationMethodSchema = z
  .enum(["HIGH_ACCURACY", "LOW_ACCURACY", "IP_ADDRESS"])
  .optional()
  .nullable()
  .describe("How visitor location should be resolved: high-accuracy device geolocation, lower-accuracy device geolocation, or IP-based lookup.");

export const SearchDistanceModeSchema = z
  .enum(["ENTIRE_SEARCHED_AREA", "SPECIFIC_RADIUS", "BOTH"])
  .optional()
  .nullable()
  .describe("How typed-in searches define the search area: entire matched region, a fixed radius, or both combined.");

export const SearchDistanceUnitSchema = z
  .enum(["MILES", "KILOMETERS"])
  .optional()
  .nullable()
  .describe("Distance measurement unit used for search radii, labels, and nearby result messaging.");

export const SearchSuggestionModeSchema = z
  .enum(["REGIONS", "ADDRESSES", "REGIONS_AND_ADDRESSES"])
  .optional()
  .nullable()
  .describe("Autocomplete strategy for the search field: suggest broader regions, exact street addresses, or both.");

export const SearchCountryLockModeSchema = z
  .enum(["DISABLED", "LIMITED_COUNTRIES"])
  .optional()
  .nullable()
  .describe("Whether search should be unrestricted across countries or locked to a specific administrator-defined country list.");

export const SearchStartingAreaSchema = z.object({
  label: NullableLabelString.describe("Administrative label for the predefined area used when the map starts focused on a specific region."),
  lat: NullableNumber.describe("Latitude for the predefined starting area center point."),
  lng: NullableNumber.describe("Longitude for the predefined starting area center point."),
  zoom: NullableNumber.describe("Zoom level to apply when focusing on a specific starting area rather than fitting all locations."),
}).describe("Predefined starting area used when the locator loads focused on a specific region.");

export type SearchStartingArea = z.infer<typeof SearchStartingAreaSchema>;

export const SearchBehaviourSettingsSchema = z.object({
  startingPositionMode: SearchStartingPositionModeSchema,
  startingArea: SearchStartingAreaSchema.optional().nullable().describe("Preselected starting area details used only when the locator should focus on a specific area on first load."),
  clusterLocationsWhenZoomedOut: NullableBoolean.describe("Whether nearby location markers should be grouped into cluster circles when visitors zoom out on the map."),
  clusteringZoomLevel: NullableNumber.describe("Zoom threshold at which grouped cluster markers begin replacing individual location pins."),
  automaticGeolocation: NullableBoolean.describe("Whether the locator should automatically attempt to detect the visitor's location and show nearby stores on load."),
  geolocationMethod: SearchGeolocationMethodSchema,
  typedSearchDistanceMode: SearchDistanceModeSchema,
  searchRadius: NullableNumber.describe("Radius used for typed searches when search behavior is configured to show results in a specific radius."),
  geolocationRadius: NullableNumber.describe("Distance from the detected visitor location within which results should be shown after geolocation succeeds."),
  maximumResults: NullableNumber.describe("Maximum number of locations the locator should display at once to balance usefulness and performance."),
  distanceUnit: SearchDistanceUnitSchema,
  searchSuggestionMode: SearchSuggestionModeSchema,
  countryLockMode: SearchCountryLockModeSchema,
  countryCodes: z.array(z.string().max(3)).max(250).optional().nullable().describe("Allowed country codes when search is restricted to specific countries for accuracy and relevance."),
}).describe("Search behavior settings group for initial map positioning, clustering, geolocation, distance rules, result limits, and search suggestion constraints.");

export type SearchBehaviourSettings = z.infer<typeof SearchBehaviourSettingsSchema>;

export const SearchBehaviourSettingsConverter = createSettingsConverter(SearchBehaviourSettingsSchema);
