import { z } from "zod";

export const MAX_SETTINGS_KEY_LENGTH = 64;
export const MAX_SETTINGS_LABEL_LENGTH = 120;
export const MAX_SETTINGS_PLACEHOLDER_LENGTH = 160;
export const MAX_SETTINGS_SHORT_TEXT_LENGTH = 250;
export const MAX_SETTINGS_LONG_TEXT_LENGTH = 4000;
export const MAX_SETTINGS_LOCALE_LENGTH = 32;

export const NullableString = z.string().max(MAX_SETTINGS_SHORT_TEXT_LENGTH).optional().nullable();
export const NullableBoolean = z.boolean().optional().nullable();
export const NullableNumber = z.number().optional().nullable();
export const NullableKeyString = z.string().max(MAX_SETTINGS_KEY_LENGTH).optional().nullable();
export const NullableLabelString = z.string().max(MAX_SETTINGS_LABEL_LENGTH).optional().nullable();
export const NullablePlaceholderString = z
  .string()
  .max(MAX_SETTINGS_PLACEHOLDER_LENGTH)
  .optional()
  .nullable();
export const NullableLongTextString = z
  .string()
  .max(MAX_SETTINGS_LONG_TEXT_LENGTH)
  .optional()
  .nullable();
export const NullableLocaleString = z.string().max(MAX_SETTINGS_LOCALE_LENGTH).optional().nullable();

export function createSettingsConverter<T>(schema: z.ZodType<T>) {
  return {
    parse(input: unknown): T {
      return schema.parse(input);
    },
    convertFromEntity(input: T | null | undefined): T | null {
      if (input === null || input === undefined) {
        return null;
      }

      return schema.parse(input);
    },
    convertToEntity(input: T | null | undefined): T | null {
      if (input === null || input === undefined) {
        return null;
      }

      return schema.parse(input);
    },
  };
}
