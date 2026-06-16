import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";

export const ProductSharingSenderSnapshotCollection = "productSharingSenderSnapshots";

export const ProductSharingSnapshotPriceRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currencyCode: z
    .string()
    .min(1)
    .describe("Currency captured from the sender store snapshot payload."),
});

export const ProductSharingSnapshotMetafieldValueSchema = z.object({
  namespace: z.string().min(1),
  key: z.string().min(1),
  type: z.string().min(1),
  value: z.string().min(1),
});

export const ProductSharingSnapshotSelectedOptionSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export const ProductSharingSnapshotVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  price: z.number(),
  compareAtPrice: z.number().optional().nullable(),
  taxable: z.boolean(),
  position: z.number().int().positive(),
  selectedOptions: z.array(ProductSharingSnapshotSelectedOptionSchema).max(20),
  metafields: z.array(ProductSharingSnapshotMetafieldValueSchema).max(500),
});

export const ProductSharingSnapshotOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.number().int().positive(),
  values: z.array(z.string().min(1)).max(250),
});

export const ProductSharingSnapshotMediaSchema = z.object({
  id: z.string().min(1),
  alt: z.string().optional().nullable(),
  mediaContentType: z.string().min(1),
  sourceUrl: z.string().min(1),
});

export const ProductSharingSnapshotCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const ProductSharingSenderSnapshotEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  productId: z.string().min(1),
  handle: z.string().optional().nullable(),
  title: z.string().min(1),
  descriptionHtml: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  vendor: z.string().optional().nullable(),
  productType: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  tags: z.array(z.string()).max(500),
  collections: z.array(ProductSharingSnapshotCollectionSchema).max(500),
  media: z.array(ProductSharingSnapshotMediaSchema).max(250),
  options: z.array(ProductSharingSnapshotOptionSchema).max(20),
  variants: z.array(ProductSharingSnapshotVariantSchema).max(250),
  priceRange: ProductSharingSnapshotPriceRangeSchema.optional().nullable(),
  checksum: z.string().min(1),
  sourceUpdatedAt: z.date(),
  snapshotUpdatedAt: z.date(),
  metafields: z.array(ProductSharingSnapshotMetafieldValueSchema).max(5000),
});

export type ProductSharingSenderSnapshotEntity = z.infer<
  typeof ProductSharingSenderSnapshotEntitySchema
>;
