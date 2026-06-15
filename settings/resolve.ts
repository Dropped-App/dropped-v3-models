import { type Settings } from "../OrganisationSettings";
import { DEFAULT_PRODUCT_SHARING_SYNC_FIELDS } from "../ProductSharingSyncField";
import {
  type ProductSharingMetafieldPromptSuppression,
  type ProductSharingSettings,
} from "./productSharing";

type ResolvableSettingsInput = {
  productSharing?: ProductSharingSettings | null;
} | null | undefined;

const DEFAULT_PRODUCT_SHARING_METAFIELD_PROMPT_SUPPRESSIONS: ProductSharingMetafieldPromptSuppression[] =
  [];

function resolveProductSharingSettings(
  settings?: ProductSharingSettings | null,
): ProductSharingSettings {
  return {
    senderDefaults: {
      shareActiveProductsOnly: settings?.senderDefaults?.shareActiveProductsOnly ?? true,
    },
    receiverDefaults: {
      defaultImportProductStatus:
        settings?.receiverDefaults?.defaultImportProductStatus ?? "DRAFT",
      defaultUpdateProductStatus:
        settings?.receiverDefaults?.defaultUpdateProductStatus ?? "KEEP_EXISTING",
      defaultImportSelectedFields:
        settings?.receiverDefaults?.defaultImportSelectedFields?.length
          ? [...settings.receiverDefaults.defaultImportSelectedFields]
          : [...DEFAULT_PRODUCT_SHARING_SYNC_FIELDS],
      defaultUpdateSelectedFields:
        settings?.receiverDefaults?.defaultUpdateSelectedFields?.length
          ? [...settings.receiverDefaults.defaultUpdateSelectedFields]
          : [...DEFAULT_PRODUCT_SHARING_SYNC_FIELDS],
      taxEnabledByDefault: settings?.receiverDefaults?.taxEnabledByDefault ?? true,
    },
    pricing: {
      receiverPriceModifier: settings?.pricing?.receiverPriceModifier
        ? {
            adjustmentType:
              settings.pricing.receiverPriceModifier.adjustmentType ?? "PERCENTAGE",
            amount: settings.pricing.receiverPriceModifier.amount ?? 0,
          }
        : null,
      priceSourceRule: settings?.pricing?.priceSourceRule ?? "REGULAR",
      roundingRule: settings?.pricing?.roundingRule
        ? {
            mode: settings.pricing.roundingRule.mode ?? "NONE",
            increment: settings.pricing.roundingRule.increment ?? 0.01,
          }
        : null,
    },
    matching: {
      matchBySku: settings?.matching?.matchBySku ?? false,
      matchByHandle: settings?.matching?.matchByHandle ?? false,
      matchByTitle: settings?.matching?.matchByTitle ?? false,
    },
    metafieldPromptSuppressions:
      settings?.metafieldPromptSuppressions ??
      DEFAULT_PRODUCT_SHARING_METAFIELD_PROMPT_SUPPRESSIONS,
  };
}

export function resolveSettings(settings?: ResolvableSettingsInput): NonNullable<Settings> {
  return {
    productSharing: resolveProductSharingSettings(settings?.productSharing),
  };
}
