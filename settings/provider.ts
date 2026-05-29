import { z } from "zod";

import {
  createSettingsConverter,
  NullableBoolean,
  NullableLabelString,
  NullableLongTextString,
  NullableString,
} from "./shared";

export const MapProviderSchema = z
	.enum(["LEAFLET", "MAPBOX", "GOOGLE_MAPS"])
	.optional()
	.nullable()
	.describe(
		"Selected map provider powering locator rendering and search. Leaflet requires no API key, while Mapbox and Google Maps require provider credentials.",
	);

export const ProviderMapThemeModeSchema = z
	.enum(["PROVIDER_DEFAULT", "PRESET_THEME", "CUSTOM_STYLE_CODE"])
	.optional()
	.nullable()
	.describe(
		"Selected map theme mode for the current provider. Available theme options depend on the selected map provider.",
	);

export const MapPinTypeSchema = z
	.enum(["STANDARD_PIN_ICON", "CUSTOM_IMAGE"])
	.optional()
	.nullable()
	.describe(
		"How a map pin style is rendered: a standard pin icon with a chosen color, or a custom image URL.",
	);

export const CustomImageDisplayModeSchema = z
	.enum(["IMAGE_ONLY", "IMAGE_IN_PIN"])
	.optional()
	.nullable()
	.describe(
		"When using a custom image, controls whether the image is displayed by itself or inside a colored pin shell.",
	);

export const MapPinStyleSchema = z
	.object({
		name: NullableLabelString.describe(
			"Human-readable map pin style name shown to administrators when editing the pin style.",
		),
		pinType: MapPinTypeSchema,
		pinColor: NullableString.describe(
			"Primary map pin color, typically a hex value, used when the pin type is a standard pin icon.",
		),
		customImageUrl: NullableString.describe(
			"Optional custom image URL used when the pin type is a custom image.",
		),
		customImageDisplayMode: CustomImageDisplayModeSchema,
		retinaSupport: NullableBoolean.describe(
			"Whether the custom map pin image should be treated as retina-ready for sharper rendering on high-density displays.",
		),
	})
	.describe("Map pin style definition used for the default map pin or for a category/filter-specific override.");

export type MapPinStyle = z.infer<typeof MapPinStyleSchema>;

export const ProviderSettingsSchema = z
	.object({
		provider: MapProviderSchema,
		apiKey: NullableString.describe(
			"Provider API key used when the selected map service requires credentials. This should remain empty for Leaflet because Leaflet does not require a key.",
		),
		mapThemeMode: ProviderMapThemeModeSchema,
		mapThemeId: NullableString.describe(
			"Selected provider-specific map theme identifier. Available theme choices depend on the currently selected map provider.",
		),
		mapThemeStyleCode: NullableLongTextString.describe(
			"Advanced provider-specific map style code or JSON applied when the selected provider and theme mode support custom styling.",
		),
		defaultPinStyle: MapPinStyleSchema
			.optional()
			.nullable()
			.describe(
				"Required default map pin style used whenever a category/filter does not provide its own pin style override.",
			),
	})
	.describe(
		"Map provider and style settings group for selecting Leaflet, Mapbox, or Google Maps, storing any required credentials, choosing provider-dependent map themes, and managing the default map pin style.",
	);

export type ProviderSettings = z.infer<typeof ProviderSettingsSchema>;

export const ProviderSettingsConverter = createSettingsConverter(ProviderSettingsSchema);
