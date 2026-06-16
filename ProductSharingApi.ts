import { z } from "zod";

import {
  ProductSharingDefaultProductStatusSchema,
  ProductSharingPriceModifierSchema,
  ProductSharingSettingsSchema,
} from "./settings/productSharing";
import {
  ProductSharingSyncFieldListSchema,
  ProductSharingSyncFieldSchema,
} from "./ProductSharingSyncField";
import { parseJsonBody } from "./apiParsing";
import {
  ProductSharingConnectionSourceSchema,
  ProductSharingConnectionStatusSchema,
} from "./ProductSharingConnection";
import {
  ProductSharingHistoryStatusSchema,
  ProductSharingHistoryVariantDetailSchema,
} from "./ProductSharingHistoryEvent";
import {
  ProductSharingSnapshotCollectionSchema,
  ProductSharingSnapshotMediaSchema,
  ProductSharingSnapshotMetafieldValueSchema,
  ProductSharingSnapshotOptionSchema,
  ProductSharingSnapshotPriceRangeSchema,
} from "./ProductSharingSenderSnapshot";

export const ProductSharingBrowseStatusSchema = z.enum([
  "NOT_IMPORTED",
  "IMPORTED",
  "UPDATE_AVAILABLE",
  "ACCESS_REMOVED",
]);

const ProductSharingBooleanQueryParamSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const ProductSharingGroupModelSchema = z.object({
  id: z.string().min(1),
  org: z.string().min(1),
  name: z.string().min(1).max(120),
  key: z.string().min(1),
  memberCount: z.number().int().min(0).optional(),
  shareActiveProductsOnly: z
    .boolean()
    .optional()
    .nullable()
    .describe(
      "Optional group-level active-only override applied on top of the sender org defaults when determining group-visible products.",
    ),
  includeRules: z
    .object({
      productIds: z.array(z.string().min(1)).optional().nullable(),
      collectionIds: z.array(z.string().min(1)).optional().nullable(),
    })
    .optional()
    .nullable(),
  excludeRules: z
    .object({
      productIds: z.array(z.string().min(1)).optional().nullable(),
      collectionIds: z.array(z.string().min(1)).optional().nullable(),
    })
    .optional()
    .nullable(),
  priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductSharingGroupModel = z.infer<typeof ProductSharingGroupModelSchema>;

export const ProductSharingConnectedReceiverSchema = z.object({
  id: z.string().min(1),
  receiverOrgId: z.string().min(1),
  receiverName: z.string().optional().nullable(),
  status: z.enum([
    "ACTIVE",
    "REMOVED_BY_SENDER",
    "REMOVED_BY_RECEIVER",
    "BLOCKED",
    "ACCESS_REMOVED",
  ]),
  source: z.enum(["GROUP_KEY", "STORE_KEY", "EXISTING_RECEIVER"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  removedAt: z.date().optional().nullable(),
});

export type ProductSharingConnectedReceiver = z.infer<
  typeof ProductSharingConnectedReceiverSchema
>;

export const ProductSharingSenderGroupPreviewProductSchema = z.object({
  senderProductId: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().optional().nullable(),
  productType: z.string().optional().nullable(),
  sourceStatus: z.string().optional().nullable(),
  collections: z.array(ProductSharingSnapshotCollectionSchema),
  tags: z.array(z.string()),
  adjustedPrice: z
    .number()
    .optional()
    .nullable()
    .describe(
      "Receiver-visible adjusted price for the selected group, or null when pricing is not available in the receiver store currency.",
    ),
  sourceUpdatedAt: z.date(),
  checksum: z.string().min(1),
  availableFields: ProductSharingSyncFieldListSchema.describe(
    "Sync fields currently available for this sender product after active-only eligibility, field mapping, and pricing availability are applied.",
  ),
});

export type ProductSharingSenderGroupPreviewProduct = z.infer<
  typeof ProductSharingSenderGroupPreviewProductSchema
>;

export const ProductSharingGroupListResponseSchema = z.object({
  groups: z.array(ProductSharingGroupModelSchema),
});

export type ProductSharingGroupListResponse = z.infer<
  typeof ProductSharingGroupListResponseSchema
>;

export const ProductSharingGroupMutationResponseSchema = z.object({
  group: ProductSharingGroupModelSchema,
});

export type ProductSharingGroupMutationResponse = z.infer<
  typeof ProductSharingGroupMutationResponseSchema
>;

export const ProductSharingGroupDeleteResponseSchema = z.object({
  deleted: z.literal(true),
  id: z.string().min(1),
});

export type ProductSharingGroupDeleteResponse = z.infer<
  typeof ProductSharingGroupDeleteResponseSchema
>;

export const ProductSharingGroupDetailResponseSchema = z.object({
  group: ProductSharingGroupModelSchema,
  connectedReceivers: z.array(ProductSharingConnectedReceiverSchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(50),
  totalProducts: z.number().int().min(0),
  products: z.array(ProductSharingSenderGroupPreviewProductSchema),
});

export type ProductSharingGroupDetailResponse = z.infer<
  typeof ProductSharingGroupDetailResponseSchema
>;

export const ProductSharingConnectionModelSchema = z.object({
  id: z.string().min(1),
  senderOrg: z.string().min(1),
  receiverOrg: z.string().min(1),
  group: z.string().min(1),
  status: ProductSharingConnectionStatusSchema,
  source: ProductSharingConnectionSourceSchema,
  senderName: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  groupName: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  removedAt: z.date().optional().nullable(),
});

export type ProductSharingConnectionModel = z.infer<
  typeof ProductSharingConnectionModelSchema
>;

export const ProductSharingConnectionListResponseSchema = z.object({
  connections: z.array(ProductSharingConnectionModelSchema),
});

export type ProductSharingConnectionListResponse = z.infer<
  typeof ProductSharingConnectionListResponseSchema
>;

export const ProductSharingJoinByGroupKeyResponseSchema =
  ProductSharingConnectionListResponseSchema.extend({
    connectionId: z.string().min(1),
  });

export type ProductSharingJoinByGroupKeyResponse = z.infer<
  typeof ProductSharingJoinByGroupKeyResponseSchema
>;

export const ProductSharingRemoveConnectionResponseSchema = z.object({
  removed: z.literal(true),
  status: ProductSharingConnectionStatusSchema.exclude(["ACTIVE"]),
});

export type ProductSharingRemoveConnectionResponse = z.infer<
  typeof ProductSharingRemoveConnectionResponseSchema
>;

export const ProductSharingBlockSenderResponseSchema =
  ProductSharingConnectionListResponseSchema.extend({
    blocked: z.literal(true),
  });

export type ProductSharingBlockSenderResponse = z.infer<
  typeof ProductSharingBlockSenderResponseSchema
>;

const ProductSharingBrowseVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  compareAtPrice: z.number().optional().nullable(),
  taxable: z.boolean(),
  position: z.number().int().positive(),
  selectedOptions: z.array(
    z.object({
      name: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
  metafields: z.array(ProductSharingSnapshotMetafieldValueSchema).max(500),
});

export const ProductSharingBrowseProductSchema = z.object({
  senderOrgId: z.string().min(1),
  senderName: z.string().optional().nullable(),
  senderProductId: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().optional().nullable(),
  productType: z.string().optional().nullable(),
  sourceStatus: z.string().optional().nullable(),
  status: ProductSharingBrowseStatusSchema,
  tags: z.array(z.string()),
  collections: z.array(ProductSharingSnapshotCollectionSchema),
  checksum: z.string().min(1),
  sourceUpdatedAt: z.date(),
  importedAt: z.date().optional().nullable(),
  adjustedPrice: z
    .number()
    .optional()
    .nullable()
    .describe(
      "Receiver-visible adjusted price for the selected group, or null when sender market pricing is unavailable in the receiver store currency.",
    ),
  groupIds: z.array(z.string().min(1)),
  groupNames: z.array(z.string()),
  selectedGroupId: z.string().min(1),
  selectedGroupName: z.string().optional().nullable(),
  receiverProductId: z.string().optional().nullable(),
  availableFields: ProductSharingSyncFieldListSchema.describe(
    "Fields the receiver may sync for this product after pricing availability and payload availability are evaluated.",
  ),
  visibleFields: ProductSharingSyncFieldListSchema.describe(
    "Subset of availableFields exposed in this browse payload after applying the receiver org default field mapping choices.",
  ),
  product: z.object({
    handle: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    descriptionHtml: z.string().optional().nullable(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    vendor: z.string().optional().nullable(),
    productType: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    collections: z.array(ProductSharingSnapshotCollectionSchema).optional().nullable(),
    media: z.array(ProductSharingSnapshotMediaSchema).optional().nullable(),
    options: z.array(ProductSharingSnapshotOptionSchema).optional().nullable(),
    variants: z.array(ProductSharingBrowseVariantSchema).optional().nullable(),
    priceRange: ProductSharingSnapshotPriceRangeSchema
      .optional()
      .nullable()
      .describe(
        "Resolved sender-market price range in the receiver store currency when available; otherwise null.",
      ),
    metafields: z.array(ProductSharingSnapshotMetafieldValueSchema).optional().nullable(),
  }).describe(
    "Receiver-visible product payload. Fields not selected in the receiver org mapping defaults are returned as null or omitted from visibleFields.",
  ),
});

export type ProductSharingBrowseProduct = z.infer<
  typeof ProductSharingBrowseProductSchema
>;

export const ProductSharingBrowseResponseSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(50),
  total: z.number().int().min(0),
  items: z.array(ProductSharingBrowseProductSchema),
});

export type ProductSharingBrowseResponse = z.infer<
  typeof ProductSharingBrowseResponseSchema
>;

const ProductSharingNamedFilterOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const ProductSharingBrowseFilterOptionsResponseSchema = z.object({
  groups: z.array(ProductSharingNamedFilterOptionSchema),
  senders: z.array(ProductSharingNamedFilterOptionSchema),
  vendors: z.array(z.string().min(1)),
  productTypes: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  collections: z.array(ProductSharingSnapshotCollectionSchema),
});

export type ProductSharingBrowseFilterOptionsResponse = z.infer<
  typeof ProductSharingBrowseFilterOptionsResponseSchema
>;

export const ProductSharingGroupFilterOptionsResponseSchema = z.object({
  vendors: z.array(z.string().min(1)),
  productTypes: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  collections: z.array(ProductSharingSnapshotCollectionSchema),
});

export type ProductSharingGroupFilterOptionsResponse = z.infer<
  typeof ProductSharingGroupFilterOptionsResponseSchema
>;

export const ProductSharingPreviewMatchedExistingProductSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
});

export type ProductSharingPreviewMatchedExistingProduct = z.infer<
  typeof ProductSharingPreviewMatchedExistingProductSchema
>;

export const ProductSharingPreviewLinkageConflictSchema = z.object({
  receiverProductId: z.string().min(1),
  senderOrgId: z.string().min(1),
  senderProductId: z.string().min(1),
});

export type ProductSharingPreviewLinkageConflict = z.infer<
  typeof ProductSharingPreviewLinkageConflictSchema
>;

export const ProductSharingPreviewBlockedReasonSchema = z.enum([
  "ACCESS_REMOVED",
  "ALREADY_QUEUED",
  "AMBIGUOUS_MATCH",
  "LINKAGE_CONFLICT",
]);

export type ProductSharingPreviewBlockedReason = z.infer<
  typeof ProductSharingPreviewBlockedReasonSchema
>;

export const ProductSharingPreviewVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sku: z.string().optional().nullable(),
  selected: z.boolean(),
  selectedOptions: z.array(
    z.object({
      name: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

export type ProductSharingPreviewVariant = z.infer<
  typeof ProductSharingPreviewVariantSchema
>;

export const ProductSharingPreviewOptionValueSchema = z.object({
  value: z.string().min(1),
  selected: z.boolean(),
});

export type ProductSharingPreviewOptionValue = z.infer<
  typeof ProductSharingPreviewOptionValueSchema
>;

export const ProductSharingPreviewOptionSchema = z.object({
  name: z.string().min(1),
  values: z.array(ProductSharingPreviewOptionValueSchema),
});

export type ProductSharingPreviewOption = z.infer<
  typeof ProductSharingPreviewOptionSchema
>;

export const ProductSharingMissingMetafieldDefinitionSchema = z.object({
  ownerType: z.enum(["PRODUCT", "VARIANT"]),
  namespace: z.string().min(1),
  key: z.string().min(1),
  type: z.string().min(1),
});

export type ProductSharingMissingMetafieldDefinition = z.infer<
  typeof ProductSharingMissingMetafieldDefinitionSchema
>;

export const ProductSharingPreviewProductSchema = z.object({
  senderOrgId: z.string().min(1),
  senderName: z.string().optional().nullable(),
  senderProductId: z.string().min(1),
  title: z.string().min(1),
  vendor: z.string().optional().nullable(),
  productType: z.string().optional().nullable(),
  sourceStatus: z.string().optional().nullable(),
  status: ProductSharingBrowseStatusSchema,
  adjustedPrice: z
    .number()
    .optional()
    .nullable()
    .describe(
      "Receiver-visible adjusted price for preview, or null when sender market pricing is unavailable in the receiver store currency.",
    ),
  sourceUpdatedAt: z.date(),
  importedAt: z.date().optional().nullable(),
  selectedGroupId: z.string().min(1),
  selectedGroupName: z.string().optional().nullable(),
  groupIds: z.array(z.string().min(1)),
  groupNames: z.array(z.string()),
  receiverProductId: z.string().optional().nullable(),
  action: z.enum(["IMPORT", "UPDATE"]),
  alreadyQueued: z.boolean(),
  blockedReason: ProductSharingPreviewBlockedReasonSchema.optional().nullable(),
  linkageConflict: ProductSharingPreviewLinkageConflictSchema.optional().nullable(),
  ambiguousMatch: z.boolean(),
  matchedExistingProducts: z.array(ProductSharingPreviewMatchedExistingProductSchema),
  willCreate: z.boolean(),
  willUpdate: z.boolean(),
  availableFields: ProductSharingSyncFieldListSchema.describe(
    "Fields currently available to sync after pricing availability and snapshot payload availability are evaluated.",
  ),
  selectedFields: ProductSharingSyncFieldListSchema.describe(
    "Selected sync fields after removing anything unavailable for the current product.",
  ),
  newFields: ProductSharingSyncFieldListSchema,
  overrideFields: ProductSharingSyncFieldListSchema,
  availableVariants: z.array(ProductSharingPreviewVariantSchema),
  availableOptions: z.array(ProductSharingPreviewOptionSchema),
  missingMetafieldDefinitionDetails: z.array(ProductSharingMissingMetafieldDefinitionSchema),
  missingMetafieldDefinitions: z.boolean(),
  missingMetafieldDefinitionCount: z.number().int().min(0),
  zeroPriceWarning: z.boolean(),
  taxEnabled: z.boolean(),
  statusOverride: ProductSharingDefaultProductStatusSchema,
});

export type ProductSharingPreviewProduct = z.infer<
  typeof ProductSharingPreviewProductSchema
>;

export const ProductSharingPreviewSummarySchema = z.object({
  createCount: z.number().int().min(0),
  updateCount: z.number().int().min(0),
  blockedCount: z.number().int().min(0),
});

export type ProductSharingPreviewSummary = z.infer<
  typeof ProductSharingPreviewSummarySchema
>;

export const ProductSharingPreviewResponseSchema = z.object({
  totalMatchedResults: z.number().int().min(0),
  totalSelected: z.number().int().min(0),
  capApplied: z.boolean(),
  blockers: z.array(ProductSharingPreviewProductSchema),
  summary: ProductSharingPreviewSummarySchema,
  products: z.array(ProductSharingPreviewProductSchema),
  sample: z.array(ProductSharingPreviewProductSchema),
});

export type ProductSharingPreviewResponse = z.infer<
  typeof ProductSharingPreviewResponseSchema
>;

export const ProductSharingSyncJobSummarySchema = z.object({
  id: z.string().min(1),
  senderOrg: z.string().min(1),
  receiverOrg: z.string().min(1),
  operation: z.enum(["IMPORT", "UPDATE"]),
  status: z.literal("PENDING"),
  itemCount: z.number().int().min(1).max(25),
  requestedAt: z.date(),
});

export type ProductSharingSyncJobSummary = z.infer<
  typeof ProductSharingSyncJobSummarySchema
>;

export const ProductSharingCreateSyncJobsResponseSchema = z.object({
  createdJobCount: z.number().int().min(0),
  selectedProductCount: z.number().int().min(0),
  summary: ProductSharingPreviewSummarySchema,
  jobs: z.array(ProductSharingSyncJobSummarySchema),
});

export type ProductSharingCreateSyncJobsResponse = z.infer<
  typeof ProductSharingCreateSyncJobsResponseSchema
>;

export const ProductSharingSyncRouteResponseSchema = z.union([
  ProductSharingCreateSyncJobsResponseSchema,
  ProductSharingPreviewResponseSchema,
]);

export type ProductSharingSyncRouteResponse = z.infer<
  typeof ProductSharingSyncRouteResponseSchema
>;

export const ProductSharingRetryFailedSyncResponseSchema = z.object({
  retriedJobCount: z.number().int().min(0),
});

export type ProductSharingRetryFailedSyncResponse = z.infer<
  typeof ProductSharingRetryFailedSyncResponseSchema
>;

export const ProductSharingDismissFailedSyncResponseSchema = z.object({
  modifiedCount: z.number().int().min(0),
  cancelledAt: z.date(),
});

export type ProductSharingDismissFailedSyncResponse = z.infer<
  typeof ProductSharingDismissFailedSyncResponseSchema
>;

export const ProductSharingSyncBannerSummarySchema = z.object({
  jobCount: z.number().int().min(0),
  itemCount: z.number().int().min(0),
  importCount: z.number().int().min(0),
  updateCount: z.number().int().min(0),
});

export type ProductSharingSyncBannerSummary = z.infer<
  typeof ProductSharingSyncBannerSummarySchema
>;

export const ProductSharingSyncStatusResponseSchema = z.object({
  active: ProductSharingSyncBannerSummarySchema,
  failed: ProductSharingSyncBannerSummarySchema,
});

export type ProductSharingSyncStatusResponse = z.infer<
  typeof ProductSharingSyncStatusResponseSchema
>;

export const ProductSharingHistoryItemSchema = z.object({
  id: z.string().min(1),
  senderOrgId: z.string().min(1),
  receiverOrgId: z.string().min(1),
  groupId: z.string().min(1),
  senderProductId: z.string().min(1),
  receiverProductId: z.string().optional().nullable(),
  senderChecksum: z.string().optional().nullable(),
  importedFields: z.array(z.string().min(1)).max(200),
  variantDetails: z.array(ProductSharingHistoryVariantDetailSchema).max(500),
  status: ProductSharingHistoryStatusSchema,
  happenedAt: z.date(),
});

export type ProductSharingHistoryItem = z.infer<
  typeof ProductSharingHistoryItemSchema
>;

export const ProductSharingHistoryResponseSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(50),
  total: z.number().int().min(0),
  items: z.array(ProductSharingHistoryItemSchema),
});

export type ProductSharingHistoryResponse = z.infer<
  typeof ProductSharingHistoryResponseSchema
>;

export const ProductSharingInviteResponseSchema = z.object({
  sent: z.literal(true),
});

export type ProductSharingInviteResponse = z.infer<
  typeof ProductSharingInviteResponseSchema
>;

const ProductSharingSenderProductIdRecordSchema = z.record(z.string(), z.string().min(1));
const ProductSharingSenderProductArrayRecordSchema = z.record(
  z.string(),
  z.array(z.string().min(1)).max(250),
);

export const ProductSharingRefreshBodySchema = z.object({}).passthrough();

export const ProductSharingRefreshResponseSchema = z.object({
  scheduled: z.literal(true),
});

export type ProductSharingRefreshResponse = z.infer<
  typeof ProductSharingRefreshResponseSchema
>;

export const ProductSharingSettingsUpdateBodySchema = z.object({
  productSharing: ProductSharingSettingsSchema,
});

export const ProductSharingGroupBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  shareActiveProductsOnly: z.boolean().optional().nullable(),
  includeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  includeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  excludeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  excludeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
  priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
});

export const ProductSharingGroupUpdateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    shareActiveProductsOnly: z.boolean().optional().nullable(),
    includeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    includeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    excludeProductIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    excludeCollectionIds: z.array(z.string().min(1)).max(500).optional().nullable(),
    priceModifier: ProductSharingPriceModifierSchema.optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Request body is not valid",
  });

export const ProductSharingSenderGroupDetailQuerySchema = z.object({
  vendor: z.string().max(120).optional().nullable(),
  productType: z.string().max(120).optional().nullable(),
  tag: z.string().max(120).optional().nullable(),
  status: z.string().max(120).optional().nullable(),
  collectionId: z.string().max(250).optional().nullable(),
  search: z.string().max(250).optional().nullable(),
  sort: z
    .enum(["title", "vendor", "status", "sourceUpdatedAt", "adjustedPrice"])
    .optional()
    .nullable(),
  direction: z.enum(["asc", "desc"]).optional().nullable(),
  page: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  pageSize: z.coerce.number().int().min(1).max(50).optional().nullable(),
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
  selectedFields: z.array(ProductSharingSyncFieldSchema).min(1).max(12).optional().nullable(),
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
}).refine((value) => Boolean(value.selectAll || value.senderProductIds?.length), {
  message: "Request body is not valid",
});

export const ProductSharingSyncBodySchema = z
  .object({
    operation: z.enum(["IMPORT", "UPDATE"]),
    preferExistingMatch: z.boolean().optional().nullable(),
    createMissingMetafieldDefinitions: z.boolean().optional().nullable(),
    selectedFields: z.array(ProductSharingSyncFieldSchema).min(1).max(12).optional().nullable(),
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
  updatedSinceLastImport: ProductSharingBooleanQueryParamSchema.optional().nullable(),
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
  jobIds: z.array(z.string().min(1)).min(1).max(100).optional().nullable(),
}).passthrough();

export const ProductSharingDismissFailedSyncBodySchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1).max(100).optional().nullable(),
}).passthrough();

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

export function parseProductSharingSenderGroupDetailQuery(
  query: Record<string, string | undefined> | null | undefined,
) {
  return ProductSharingSenderGroupDetailQuerySchema.parse(query ?? {});
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
    allowEmpty: true,
    emptyValue: {},
    includeIssueMessages: false,
  });
}

export function parseProductSharingDismissFailedSyncBody(body: string | null | undefined) {
  return parseJsonBody(body, ProductSharingDismissFailedSyncBodySchema, {
    allowEmpty: true,
    emptyValue: {},
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
