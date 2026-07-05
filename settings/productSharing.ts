import { z } from "zod";

import { ProductSharingSyncFieldListSchema } from "../ProductSharingSyncField";

import {
  createSettingsConverter,
  NullableBoolean,
  NullableLabelString,
  NullableNumber,
  NullableString,
} from "./shared";

const MAX_METAFIELD_SUPPRESSIONS = 500;

export const ProductSharingAdjustmentTypeSchema = z
  .enum(["PERCENTAGE", "FIXED_AMOUNT"])
  .optional()
  .nullable();

export const ProductSharingPriceSourceRuleSchema = z
  .enum(["REGULAR", "LOWEST_COMPARE_AT_OR_REGULAR", "HIGHEST_COMPARE_AT_OR_REGULAR"])
  .optional()
  .nullable();

export const ProductSharingRoundingModeSchema = z
  .enum(["NONE", "ROUND_UP", "ROUND_DOWN", "ROUND_TO_NEAREST"])
  .optional()
  .nullable();

export const ProductSharingDefaultProductStatusSchema = z
  .enum(["DEFAULT", "DRAFT", "ACTIVE", "UNLISTED", "KEEP_EXISTING"])
  .optional()
  .nullable();

export const ProductSharingPriceModifierSchema = z.object({
  adjustmentType: ProductSharingAdjustmentTypeSchema,
  amount: NullableNumber,
});

export type ProductSharingPriceModifier = z.infer<typeof ProductSharingPriceModifierSchema>;

export const ProductSharingRoundingRuleSchema = z.object({
  mode: ProductSharingRoundingModeSchema,
  increment: NullableNumber,
});

export type ProductSharingRoundingRule = z.infer<typeof ProductSharingRoundingRuleSchema>;

export const ProductSharingSenderDefaultsSchema = z.object({
  shareActiveProductsOnly: NullableBoolean.describe(
    "When true, sender snapshots and receiver-facing product results only include products that are active unless a more permissive eligible group still allows the product.",
  ),
  defaultSelectedFields: ProductSharingSyncFieldListSchema.optional().nullable(),
});

export type ProductSharingSenderDefaults = z.infer<typeof ProductSharingSenderDefaultsSchema>;

export const ProductSharingReceiverDefaultsSchema = z.object({
  defaultImportProductStatus: ProductSharingDefaultProductStatusSchema,
  defaultUpdateProductStatus: ProductSharingDefaultProductStatusSchema,
  defaultImportSelectedFields: ProductSharingSyncFieldListSchema.optional().nullable(),
  defaultUpdateSelectedFields: ProductSharingSyncFieldListSchema.optional().nullable(),
  taxEnabledByDefault: NullableBoolean,
});

export type ProductSharingReceiverDefaults = z.infer<typeof ProductSharingReceiverDefaultsSchema>;

export const ProductSharingPricingSettingsSchema = z.object({
  receiverPriceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
  priceSourceRule: ProductSharingPriceSourceRuleSchema,
  roundingRule: ProductSharingRoundingRuleSchema.optional().nullable(),
});

export type ProductSharingPricingSettings = z.infer<typeof ProductSharingPricingSettingsSchema>;

export const ProductSharingMatchingSettingsSchema = z.object({
  matchBySku: NullableBoolean,
  matchByHandle: NullableBoolean,
  matchByTitle: NullableBoolean,
});

export type ProductSharingMatchingSettings = z.infer<typeof ProductSharingMatchingSettingsSchema>;

export const ProductSharingMetafieldPromptSuppressionSchema = z.object({
  namespace: NullableLabelString,
  key: NullableLabelString,
  type: NullableString,
});

export type ProductSharingMetafieldPromptSuppression = z.infer<
  typeof ProductSharingMetafieldPromptSuppressionSchema
>;

export const ProductSharingSettingsSchema = z
  .object({
    senderDefaults: ProductSharingSenderDefaultsSchema.optional().nullable(),
    receiverDefaults: ProductSharingReceiverDefaultsSchema.optional().nullable(),
    pricing: ProductSharingPricingSettingsSchema.optional().nullable(),
    matching: ProductSharingMatchingSettingsSchema.optional().nullable(),
    metafieldPromptSuppressions: z
      .array(ProductSharingMetafieldPromptSuppressionSchema)
      .max(MAX_METAFIELD_SUPPRESSIONS)
      .optional()
      .nullable(),
  })
  .describe(
    "Product sharing sender and receiver defaults, including active-only sender filtering, sender snapshot field selections, default receiver sync field selections, pricing behavior, matching preferences, and metafield prompt suppressions stored at organisation scope.",
  );

export type ProductSharingSettings = z.infer<typeof ProductSharingSettingsSchema>;

export const ProductSharingSettingsConverter = createSettingsConverter(
  ProductSharingSettingsSchema,
);
