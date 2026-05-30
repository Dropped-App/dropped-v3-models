import { z } from "zod";

import {
  ProductSharingDefaultProductStatusSchema,
  ProductSharingPriceModifierSchema,
  ProductSharingSettingsSchema,
} from "./settings/productSharing";
import { parseJsonBody } from "./apiParsing";

export const ProductSharingSyncFieldSchema = z.enum([
  "title",
  "descriptionHtml",
  "vendor",
  "productType",
  "tags",
  "status",
  "seo",
  "variants",
  "metafields",
  "media",
]);
export const ProductSharingBrowseStatusSchema = z.enum([
  "NOT_IMPORTED",
  "IMPORTED",
  "UPDATE_AVAILABLE",
  "ACCESS_REMOVED",
]);

const ProductSharingSenderProductIdRecordSchema = z.record(z.string(), z.string().min(1));
const ProductSharingSenderProductArrayRecordSchema = z.record(
  z.string(),
  z.array(z.string().min(1)).max(250),
);

export const ProductSharingRefreshBodySchema = z.object({}).passthrough();

export const ProductSharingSettingsUpdateBodySchema = z.object({
  productSharing: ProductSharingSettingsSchema,
});

export const ProductSharingGroupBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  includeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  includeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  excludeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  excludeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
});

export const ProductSharingGroupUpdateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    includeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    includeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    excludeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    excludeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Request body is not valid",
  });

export const ProductSharingJoinByGroupKeyBodySchema = z.object({
  groupKey: z.string().trim().min(1),
});

export const ProductSharingAddReceiverByStoreKeyBodySchema = z.object({
  groupId: z.string().min(1),
  storeKey: z.string().trim().min(1),
});

export const ProductSharingAddExistingReceiverBodySchema = z.object({
  groupId: z.string().min(1),
  receiverOrgId: z.string().min(1),
});

export const ProductSharingRemoveConnectionBodySchema = z.object({
  connectionId: z.string().min(1),
});

export const ProductSharingBlockSenderBodySchema = z.object({
  senderOrgId: z.string().min(1),
});

export const ProductSharingPreviewBodySchema = z.object({
  operation: z.enum(["IMPORT", "UPDATE"]),
  preferExistingMatch: z.boolean().optional().nullable(),
  selectedFields: z.array(ProductSharingSyncFieldSchema).min(1).max(10).optional().nullable(),
  statusOverride: ProductSharingDefaultProductStatusSchema,
  taxEnabledOverride: z.boolean().optional().nullable(),
  groupId: z.string().optional().nullable(),
  senderOrgId: z.string().optional().nullable(),
  vendor: z.string().max(120).optional().nullable(),
  productType: z.string().max(120).optional().nullable(),
  tag: z.string().max(120).optional().nullable(),
  status: ProductSharingBrowseStatusSchema.optional().nullable(),
  updatedSinceLastImport: z.boolean().optional().nullable(),
  collectionId: z.string().max(250).optional().nullable(),
  sort: z
    .enum([
      "group",
      "title",
      "vendor",
      "status",
      "sourceUpdatedAt",
      "importedAt",
      "adjustedPrice",
    ])
    .optional()
    .nullable(),
  direction: z.enum(["asc", "desc"]).optional().nullable(),
  senderProductIds: z.array(z.string().min(1)).min(1).max(200).optional().nullable(),
  receiverProductOverrides: ProductSharingSenderProductIdRecordSchema.optional().nullable(),
  excludedVariantIdsByProduct: ProductSharingSenderProductArrayRecordSchema.optional().nullable(),
  excludedOptionValuesByProduct: ProductSharingSenderProductArrayRecordSchema.optional().nullable(),
  selectAll: z.boolean().optional().nullable(),
  search: z.string().max(250).optional().nullable(),
});

export const ProductSharingSyncBodySchema = z
  .object({
    operation: z.enum(["IMPORT", "UPDATE"]),
    preferExistingMatch: z.boolean().optional().nullable(),
    createMissingMetafieldDefinitions: z.boolean().optional().nullable(),
    selectedFields: z.array(ProductSharingSyncFieldSchema).min(1).max(10).optional().nullable(),
    statusOverride: ProductSharingDefaultProductStatusSchema,
    taxEnabledOverride: z.boolean().optional().nullable(),
    groupId: z.string().optional().nullable(),
    senderOrgId: z.string().optional().nullable(),
    vendor: z.string().max(120).optional().nullable(),
    productType: z.string().max(120).optional().nullable(),
    tag: z.string().max(120).optional().nullable(),
    status: ProductSharingBrowseStatusSchema.optional().nullable(),
    updatedSinceLastImport: z.boolean().optional().nullable(),
    collectionId: z.string().max(250).optional().nullable(),
    sort: z
      .enum([
        "group",
        "title",
        "vendor",
        "status",
        "sourceUpdatedAt",
        "importedAt",
        "adjustedPrice",
      ])
      .optional()
      .nullable(),
    direction: z.enum(["asc", "desc"]).optional().nullable(),
    senderProductIds: z.array(z.string().min(1)).min(1).max(200).optional().nullable(),
    receiverProductOverrides: ProductSharingSenderProductIdRecordSchema.optional().nullable(),
    excludedVariantIdsByProduct: ProductSharingSenderProductArrayRecordSchema.optional().nullable(),
    excludedOptionValuesByProduct: ProductSharingSenderProductArrayRecordSchema.optional().nullable(),
    selectAll: z.boolean().optional().nullable(),
    search: z.string().max(250).optional().nullable(),
  })
  .refine((value) => Boolean(value.selectAll || value.senderProductIds?.length), {
    message: "Request body is not valid",
  });

export const ProductSharingBrowseQuerySchema = z.object({
  groupId: z.string().optional().nullable(),
  senderOrgId: z.string().optional().nullable(),
  vendor: z.string().max(120).optional().nullable(),
  productType: z.string().max(120).optional().nullable(),
  tag: z.string().max(120).optional().nullable(),
  status: ProductSharingBrowseStatusSchema.optional().nullable(),
  updatedSinceLastImport: z.coerce.boolean().optional().nullable(),
  collectionId: z.string().max(250).optional().nullable(),
  search: z.string().max(250).optional().nullable(),
  sort: z
    .enum([
      "group",
      "title",
      "vendor",
      "status",
      "sourceUpdatedAt",
      "importedAt",
      "adjustedPrice",
    ])
    .optional()
    .nullable(),
  direction: z.enum(["asc", "desc"]).optional().nullable(),
  page: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  pageSize: z.coerce.number().int().min(1).max(50).optional().nullable(),
});

export const ProductSharingHistoryQuerySchema = z.object({
  view: z.enum(["receiver", "sender"]).optional().nullable(),
  groupId: z.string().optional().nullable(),
  senderOrgId: z.string().optional().nullable(),
  receiverOrgId: z.string().optional().nullable(),
  status: z.enum(["SUCCEEDED", "FAILED", "SKIPPED"]).optional().nullable(),
  productId: z.string().optional().nullable(),
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  page: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  pageSize: z.coerce.number().int().min(1).max(50).optional().nullable(),
});

export const ProductSharingRetryFailedSyncBodySchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1).max(100),
});

export const ProductSharingDismissFailedSyncBodySchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1).max(100),
});

export const ProductSharingInviteGroupBodySchema = z.object({
  groupId: z.string().min(1),
  email: z.string().email(),
});

export const ProductSharingInviteStoreBodySchema = z.object({
  email: z.string().email(),
});

export function parseProductSharingRefreshBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingRefreshBodySchema, {
    allowEmpty: true,
    emptyValue: {},
    includeIssueMessages: false,
  });
}

export function parseProductSharingSettingsUpdateBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingSettingsUpdateBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingGroupCreateBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingGroupBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingGroupUpdateBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingGroupUpdateBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingJoinByGroupKeyBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingJoinByGroupKeyBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingAddReceiverByStoreKeyBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingAddReceiverByStoreKeyBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingAddExistingReceiverBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingAddExistingReceiverBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingRemoveConnectionBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingRemoveConnectionBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingBlockSenderBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingBlockSenderBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingBrowseQuery(query: Record<string, string | undefined> | null | undefined) {
  return ProductSharingBrowseQuerySchema.parse(query ?? {});
}

export function parseProductSharingHistoryQuery(query: Record<string, string | undefined> | null | undefined) {
  return ProductSharingHistoryQuerySchema.parse(query ?? {});
}

export function parseProductSharingRetryFailedSyncBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingRetryFailedSyncBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingDismissFailedSyncBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingDismissFailedSyncBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingInviteGroupBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingInviteGroupBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}

export function parseProductSharingInviteStoreBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingInviteStoreBodySchema, {
    allowEmpty: false,
    includeIssueMessages: false,
  });
}
