import { z } from "zod";

export const PRODUCT_SHARING_SYNC_FIELDS = [
  "title",
  "descriptionHtml",
  "vendor",
  "productType",
  "tags",
  "seo",
  "variants",
  "pricing",
  "compareAtPricing",
  "metafields",
  "media",
] as const;

export const ProductSharingSyncFieldSchema = z
  .enum(PRODUCT_SHARING_SYNC_FIELDS)
  .describe(
    "Product fields sender and receiver product-sharing settings can allow for snapshotting, import, or update. Product status is managed separately and is not a selectable sync field.",
  );
export const ProductSharingSyncFieldListSchema = z
  .array(ProductSharingSyncFieldSchema)
  .max(PRODUCT_SHARING_SYNC_FIELDS.length);

export const DEFAULT_PRODUCT_SHARING_SYNC_FIELDS = [...PRODUCT_SHARING_SYNC_FIELDS];

export type ProductSharingSyncField = z.infer<typeof ProductSharingSyncFieldSchema>;
