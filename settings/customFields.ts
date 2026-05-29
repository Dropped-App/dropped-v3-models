import { z } from "zod";

import {
  createSettingsConverter,
  NullableBoolean,
  NullableKeyString,
  NullableLabelString,
} from "./shared";

export const CustomFieldTypeSchema = z
	.enum(["TEXT", "TEXT_MULTILINE", "LINK"])
	.optional()
	.nullable()
	.describe(
		"Input and display format used for this custom field value: single-line text, multi-line text, or external link.",
	);

export type CustomFieldType = z.infer<typeof CustomFieldTypeSchema>;

export const CustomFieldDefinitionSchema = z.object({
  key: NullableKeyString.describe("Stable identifier for the reusable custom field definition shared across every location that uses it."),
  label: NullableLabelString.describe("Display name shown to administrators and storefront users for this custom field, such as Opening Hours or Services Available."),
  type: CustomFieldTypeSchema,
  showOnListing: NullableBoolean.describe("Whether the custom field should be visible in storefront location listings and similar customer-facing results."),
}).describe("Reusable custom field definition that extends the location data model without code changes.");

export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;

export const CustomFieldsSettingsSchema = z.object({
  fields: z.array(CustomFieldDefinitionSchema).max(50).optional().nullable().describe("List of administrator-managed custom field definitions available to attach to location records."),
}).describe("Custom fields settings group for defining reusable location fields, choosing each field's data format, and controlling storefront visibility.");

export type CustomFieldsSettings = z.infer<typeof CustomFieldsSettingsSchema>;

export const CustomFieldsSettingsConverter = createSettingsConverter(CustomFieldsSettingsSchema);
