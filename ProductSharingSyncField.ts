import { z } from "zod";

export const PRODUCT_SHARING_SYNC_FIELDS = [
  "title",
  "descriptionHtml",
  "vendor",
  "productType",
  "tags",
  "status",
  "seo",
  "variants",
  "pricing",
  "compareAtPricing",
  "metafields",
  "media",
] as const;

export const ProductSharingSyncFieldSchema = z.enum(PRODUCT_SHARING_SYNC_FIELDS);
export const ProductSharingSyncFieldListSchema = z
  .array(ProductSharingSyncFieldSchema)
  .max(PRODUCT_SHARING_SYNC_FIELDS.length);

export const DEFAULT_PRODUCT_SHARING_SYNC_FIELDS = [...PRODUCT_SHARING_SYNC_FIELDS];

export type ProductSharingSyncField = z.infer<typeof ProductSharingSyncFieldSchema>;
