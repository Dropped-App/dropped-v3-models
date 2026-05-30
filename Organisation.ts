import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { SettingsConverter, SettingsResult } from "./OrganisationSettings";

export const ShopifyConnectionResult = z
  .object({
    apiKey: z.string(),
    domain: z.string(),
    scopes: z.string().nullable().optional().describe("Approved scopes as comma-separated string."),
    tokenMode: z
      .union([z.literal("NON_EXPIRING_OFFLINE"), z.literal("EXPIRING_OFFLINE")])
      .optional()
      .nullable()
      .describe("Whether stored offline Shopify token is legacy non-expiring or expiring."),
    accessTokenExpiresAt: z
      .date()
      .optional()
      .nullable()
      .describe("When expiring offline access token expires."),
    refreshToken: z
      .string()
      .optional()
      .nullable()
      .describe("Refresh token used to rotate expiring offline access tokens."),
    refreshTokenExpiresAt: z
      .date()
      .optional()
      .nullable()
      .describe("When expiring offline refresh token expires."),
  })
  .optional()
  .nullable();

export type ShopifyConnection = z.infer<typeof ShopifyConnectionResult>;

export const ShopifyStatusResult = z
  .union([
    z.literal("ACTIVE"),
    z.literal("PENDING"),
    z.literal("INACTIVE"),
    z.literal("ERROR"),
  ])
  .optional()
  .nullable();

export const OnboardingCompletionInstallResult = z.object({
  pageHandle: z.string().optional().nullable(),
  template: z.string().optional().nullable(),
  themeId: z.string().optional().nullable(),
});

export const OnboardingCompletionResult = z.object({
  completedAt: z.date(),
  install: OnboardingCompletionInstallResult.optional().nullable(),
});

export const OnboardingCompletionModelSchema = z.object({
  completedAt: z.string(),
  install: OnboardingCompletionInstallResult.optional().nullable(),
});

export type OnboardingCompletionModel = z.infer<typeof OnboardingCompletionModelSchema>;

export const OrganisationResult = z.object({
  _id: ObjectIdSchema,
  country: z.string().optional().nullable().describe("Country of origin."),
  contactEmail: z.string().optional().nullable().describe("Contact email for this org."),
  locale: z.string().optional().nullable().describe("Shop locale / language."),
  passwordProtected: z.boolean().optional().nullable().describe("Whether store is password protected."),
  reviewed: z.boolean().optional().nullable().describe("Whether merchant engaged with review element."),
  reviewSurface: z.string().optional().nullable().describe("Where merchant left a review."),
  rating: z.number().optional().nullable().describe("Rating score."),
  plan: z.string().optional().nullable().describe("Shopify plan."),
  website: z.string().optional().nullable().describe("Website URL."),
  settingsLastSynced: z.date().nullable().optional(),
  productSharingStoreKey: z.string().optional().nullable(),
  productSharingProductSnapshotChecksum: z.string().optional().nullable(),
  productSharingProductSnapshotDirtyAt: z.date().nullable().optional(),
  productSharingProductSnapshotStartedAt: z.date().nullable().optional(),
  productSharingProductSnapshotLeaseExpiresAt: z.date().nullable().optional(),
  productSharingProductSnapshotLeaseToken: z.string().optional().nullable(),
  productSharingProductSnapshotLastSyncedAt: z.date().nullable().optional(),
  productSharingMetafieldDefinitionsChecksum: z.string().optional().nullable(),
  productSharingMetafieldDefinitionsDirtyAt: z.date().nullable().optional(),
  productSharingMetafieldDefinitionsStartedAt: z.date().nullable().optional(),
  productSharingMetafieldDefinitionsLeaseExpiresAt: z.date().nullable().optional(),
  productSharingMetafieldDefinitionsLeaseToken: z.string().optional().nullable(),
  productSharingMetafieldDefinitionsLastSyncedAt: z.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  uninstalledAt: z.date().nullable().optional(),
  shopifyConnection: ShopifyConnectionResult,
  shopifyConnectionStatus: ShopifyStatusResult,
  name: z.string().optional().nullable().describe("Org / brand name."),
  currency: z.string().optional().nullable().describe("Shop base currency code."),
  timezone: z.string().optional().nullable().describe("Shop timezone."),
  shopCreatedAt: z.string().optional().nullable().describe("Shop created at."),
  settings: SettingsResult,
  billingPlanStatus: z.union([z.literal("INACTIVE"), z.literal("ACTIVE")]).optional().nullable(),
  billingSubscriptionId: z.string().optional().nullable(),
  billingPlanHandle: z.string().optional().nullable(),
  billingUpdatedAt: z.date().nullable().optional(),
  onboardingCompletions: z
    .record(z.string(), OnboardingCompletionResult)
    .optional()
    .nullable()
    .describe("Per-completion onboarding/install records keyed by completion key."),
});

export type OrganisationResultEntity = z.infer<typeof OrganisationResult>;

export const OrganisationModelSchema = z.object({
  id: z.string(),
  country: OrganisationResult.shape.country,
  contactEmail: OrganisationResult.shape.contactEmail,
  passwordProtected: OrganisationResult.shape.passwordProtected,
  locale: OrganisationResult.shape.locale,
  reviewed: OrganisationResult.shape.reviewed,
  reviewSurface: OrganisationResult.shape.reviewSurface,
  rating: OrganisationResult.shape.rating,
  plan: OrganisationResult.shape.plan,
  website: OrganisationResult.shape.website,
  shopifyConnection: OrganisationResult.shape.shopifyConnection,
  shopifyConnectionStatus: OrganisationResult.shape.shopifyConnectionStatus,
  name: OrganisationResult.shape.name,
  shopCreatedAt: OrganisationResult.shape.shopCreatedAt,
  timezone: OrganisationResult.shape.timezone,
  currency: OrganisationResult.shape.currency,
  createdAt: OrganisationResult.shape.createdAt,
  updatedAt: OrganisationResult.shape.updatedAt,
  uninstalledAt: OrganisationResult.shape.uninstalledAt,
  settingsLastSynced: OrganisationResult.shape.settingsLastSynced,
  productSharingStoreKey: OrganisationResult.shape.productSharingStoreKey,
  productSharingProductSnapshotChecksum:
    OrganisationResult.shape.productSharingProductSnapshotChecksum,
  productSharingProductSnapshotDirtyAt:
    OrganisationResult.shape.productSharingProductSnapshotDirtyAt,
  productSharingProductSnapshotStartedAt:
    OrganisationResult.shape.productSharingProductSnapshotStartedAt,
  productSharingProductSnapshotLeaseExpiresAt:
    OrganisationResult.shape.productSharingProductSnapshotLeaseExpiresAt,
  productSharingProductSnapshotLeaseToken:
    OrganisationResult.shape.productSharingProductSnapshotLeaseToken,
  productSharingProductSnapshotLastSyncedAt:
    OrganisationResult.shape.productSharingProductSnapshotLastSyncedAt,
  productSharingMetafieldDefinitionsChecksum:
    OrganisationResult.shape.productSharingMetafieldDefinitionsChecksum,
  productSharingMetafieldDefinitionsDirtyAt:
    OrganisationResult.shape.productSharingMetafieldDefinitionsDirtyAt,
  productSharingMetafieldDefinitionsStartedAt:
    OrganisationResult.shape.productSharingMetafieldDefinitionsStartedAt,
  productSharingMetafieldDefinitionsLeaseExpiresAt:
    OrganisationResult.shape.productSharingMetafieldDefinitionsLeaseExpiresAt,
  productSharingMetafieldDefinitionsLeaseToken:
    OrganisationResult.shape.productSharingMetafieldDefinitionsLeaseToken,
  productSharingMetafieldDefinitionsLastSyncedAt:
    OrganisationResult.shape.productSharingMetafieldDefinitionsLastSyncedAt,
  shopifySite: z.string().nullable().optional(),
  settings: OrganisationResult.shape.settings,
  billingPlanStatus: OrganisationResult.shape.billingPlanStatus,
  billingSubscriptionId: OrganisationResult.shape.billingSubscriptionId,
  billingPlanHandle: OrganisationResult.shape.billingPlanHandle,
  billingUpdatedAt: OrganisationResult.shape.billingUpdatedAt,
  onboardingCompletions: z
    .record(z.string(), OnboardingCompletionModelSchema)
    .optional()
    .nullable(),
});

export type OrganisationModel = z.infer<typeof OrganisationModelSchema>;

export const OrganisationModel = {
  convertFromEntity(entity: OrganisationResultEntity, includeCredentials = false): OrganisationModel {
    const obj: OrganisationModel = {
      id: entity._id.toHexString(),
      country: entity.country ?? null,
      passwordProtected: entity.passwordProtected ?? null,
      contactEmail: entity.contactEmail ?? null,
      locale: entity.locale ?? null,
      reviewed: entity.reviewed ?? null,
      reviewSurface: entity.reviewSurface ?? null,
      rating: entity.rating ?? null,
      plan: entity.plan ?? null,
      website: entity.website ?? null,
      name: entity.name ?? null,
      timezone: entity.timezone ?? null,
      shopCreatedAt: entity.shopCreatedAt ?? null,
      currency: entity.currency ?? null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
      uninstalledAt: entity.uninstalledAt ? new Date(entity.uninstalledAt) : null,
      settingsLastSynced: entity.settingsLastSynced ? new Date(entity.settingsLastSynced) : null,
      productSharingStoreKey: entity.productSharingStoreKey ?? null,
      productSharingProductSnapshotChecksum: entity.productSharingProductSnapshotChecksum ?? null,
      productSharingProductSnapshotDirtyAt: entity.productSharingProductSnapshotDirtyAt
        ? new Date(entity.productSharingProductSnapshotDirtyAt)
        : null,
      productSharingProductSnapshotStartedAt: entity.productSharingProductSnapshotStartedAt
        ? new Date(entity.productSharingProductSnapshotStartedAt)
        : null,
      productSharingProductSnapshotLeaseExpiresAt:
        entity.productSharingProductSnapshotLeaseExpiresAt
          ? new Date(entity.productSharingProductSnapshotLeaseExpiresAt)
          : null,
      productSharingProductSnapshotLeaseToken:
        entity.productSharingProductSnapshotLeaseToken ?? null,
      productSharingProductSnapshotLastSyncedAt:
        entity.productSharingProductSnapshotLastSyncedAt
          ? new Date(entity.productSharingProductSnapshotLastSyncedAt)
          : null,
      productSharingMetafieldDefinitionsChecksum:
        entity.productSharingMetafieldDefinitionsChecksum ?? null,
      productSharingMetafieldDefinitionsDirtyAt: entity.productSharingMetafieldDefinitionsDirtyAt
        ? new Date(entity.productSharingMetafieldDefinitionsDirtyAt)
        : null,
      productSharingMetafieldDefinitionsStartedAt:
        entity.productSharingMetafieldDefinitionsStartedAt
          ? new Date(entity.productSharingMetafieldDefinitionsStartedAt)
          : null,
      productSharingMetafieldDefinitionsLeaseExpiresAt:
        entity.productSharingMetafieldDefinitionsLeaseExpiresAt
          ? new Date(entity.productSharingMetafieldDefinitionsLeaseExpiresAt)
          : null,
      productSharingMetafieldDefinitionsLeaseToken:
        entity.productSharingMetafieldDefinitionsLeaseToken ?? null,
      productSharingMetafieldDefinitionsLastSyncedAt:
        entity.productSharingMetafieldDefinitionsLastSyncedAt
          ? new Date(entity.productSharingMetafieldDefinitionsLastSyncedAt)
          : null,
      shopifyConnection: includeCredentials ? (entity.shopifyConnection ?? null) : null,
      shopifyConnectionStatus: entity.shopifyConnectionStatus ?? "INACTIVE",
      shopifySite: entity.shopifyConnection?.domain ?? null,
      settings: SettingsConverter.convertFromEntity(entity.settings),
      billingPlanStatus: entity.billingPlanStatus ?? "INACTIVE",
      billingSubscriptionId: entity.billingSubscriptionId ?? null,
      billingPlanHandle: entity.billingPlanHandle ?? null,
      billingUpdatedAt: entity.billingUpdatedAt ? new Date(entity.billingUpdatedAt) : null,
      onboardingCompletions: entity.onboardingCompletions
        ? Object.fromEntries(
            Object.entries(entity.onboardingCompletions).map(([key, value]) => [
              key,
              {
                completedAt: value.completedAt.toISOString(),
                install: value.install ?? null,
              },
            ]),
          )
        : null,
    };

    return OrganisationModelSchema.parse(obj);
  },
};
