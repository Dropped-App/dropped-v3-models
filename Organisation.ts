import { ObjectId } from "bson";
import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { SettingsConverter, SettingsResult } from "./OrganisationSettings";

export const ShopifyConnectionResult = z.object({
  apiKey: z.string(),
  domain: z.string(),
  scopes: z.string().nullable().optional().describe("The scopes approved (comma seperated string)"),
  tokenMode: z
    .union([z.literal("NON_EXPIRING_OFFLINE"), z.literal("EXPIRING_OFFLINE")])
    .optional()
    .nullable()
    .describe("Whether stored offline Shopify token is legacy non-expiring or expiring"),
  accessTokenExpiresAt: z
    .date()
    .optional()
    .nullable()
    .describe("When expiring offline access token expires"),
  refreshToken: z
    .string()
    .optional()
    .nullable()
    .describe("Refresh token used to rotate expiring offline access tokens"),
  refreshTokenExpiresAt: z
    .date()
    .optional()
    .nullable()
    .describe("When expiring offline refresh token expires")
}).optional().nullable();

export type ShopifyConnection = z.infer<typeof ShopifyConnectionResult>;

export const ShopifyStatusResult = z.union([
  z.literal("ACTIVE"),
  z.literal("PENDING"),
  z.literal("INACTIVE"),
  z.literal("ERROR"),
]).optional().nullable();

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
  country: z.string().optional().nullable().describe("country of origin"),
  contactEmail: z.string().optional().nullable().describe("The email to contact for this org"),
  locale: z.string().optional().nullable().describe("shop locale / language"),
  passwordProtected: z.boolean().optional().nullable().describe("whether or not store is password protected"),
  reviewed: z.boolean().optional().nullable().describe("whether or not store has engaged with review element"),
  reviewSurface: z.string().optional().nullable().describe("where they left a review"),
  rating: z.number().optional().nullable().describe("rating score"),
  plan: z.string().optional().nullable().describe("shopify plan"),
  website: z.string().optional().nullable().describe("website URL"),
  settingsLastSynced: z.date().nullable().optional(),
  storefrontSnapshotChecksum: z.string().optional().nullable(),
  storefrontSnapshotDirtyAt: z.date().nullable().optional(),
  storefrontSnapshotStartedAt: z.date().nullable().optional(),
  storefrontSnapshotLeaseExpiresAt: z.date().nullable().optional(),
  storefrontSnapshotLeaseToken: z.string().optional().nullable(),
  storefrontSnapshotLastSyncedAt: z.date().nullable().optional(),
  orgRebuildRequestedAt: z.date().nullable().optional(),
  orgRebuildStartedAt: z.date().nullable().optional(),
  orgRebuildLeaseExpiresAt: z.date().nullable().optional(),
  orgRebuildLastCompletedAt: z.date().nullable().optional(),
  orgRebuildLeaseToken: z.string().optional().nullable(),
  createdAt: z.date().nullable().optional(),
  activeClusterVersion: z.string().optional().nullable().describe("Active precomputed cluster dataset version for public map queries"),
  shopifyConnection: ShopifyConnectionResult,
  shopifyConnectionStatus: ShopifyStatusResult,
  name: z.string().optional().nullable().describe("Org/brand name"),
  currency: z.string().optional().nullable().describe("shop base currency code"),
  timezone: z.string().optional().nullable().describe("shop timezone"),
  shopCreatedAt: z.string().optional().nullable().describe("shop created at"),
  // Custom
  settings: SettingsResult,
  // Billing stuff
  billingPlanStatus: z.union([
    z.literal("INACTIVE"),
    z.literal("ACTIVE"),
  ]).optional().nullable(),
  billingSubscriptionId: z.string().optional().nullable(),
  billingPlanHandle: z.string().optional().nullable(),
  billingUpdatedAt: z.date().nullable().optional(),
  billingEnforcementReason: z
    .union([z.literal("DOWNGRADE"), z.literal("INACTIVE")])
    .optional()
    .nullable(),
  billingEnforcementStartedAt: z.date().nullable().optional(),
  overLimitWarningSentAt: z.date().nullable().optional(),
  overLimitReminderSentAt: z.date().nullable().optional(),
  overLimitResolvedAt: z.date().nullable().optional(),
  overLimitAutoTrimmedAt: z.date().nullable().optional(),
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
  settingsLastSynced: OrganisationResult.shape.settingsLastSynced,
  storefrontSnapshotChecksum: OrganisationResult.shape.storefrontSnapshotChecksum,
  storefrontSnapshotDirtyAt: OrganisationResult.shape.storefrontSnapshotDirtyAt,
  storefrontSnapshotStartedAt: OrganisationResult.shape.storefrontSnapshotStartedAt,
  storefrontSnapshotLeaseExpiresAt: OrganisationResult.shape.storefrontSnapshotLeaseExpiresAt,
  storefrontSnapshotLeaseToken: OrganisationResult.shape.storefrontSnapshotLeaseToken,
  storefrontSnapshotLastSyncedAt: OrganisationResult.shape.storefrontSnapshotLastSyncedAt,
  orgRebuildRequestedAt: OrganisationResult.shape.orgRebuildRequestedAt,
  orgRebuildStartedAt: OrganisationResult.shape.orgRebuildStartedAt,
  orgRebuildLeaseExpiresAt: OrganisationResult.shape.orgRebuildLeaseExpiresAt,
  orgRebuildLastCompletedAt: OrganisationResult.shape.orgRebuildLastCompletedAt,
  orgRebuildLeaseToken: OrganisationResult.shape.orgRebuildLeaseToken,
  activeClusterVersion: OrganisationResult.shape.activeClusterVersion,
  shopifySite: z.string().nullable().optional(),
  // custom
  settings: OrganisationResult.shape.settings,
  // billing
  billingPlanStatus: OrganisationResult.shape.billingPlanStatus,
  billingSubscriptionId: OrganisationResult.shape.billingSubscriptionId,
  billingPlanHandle: OrganisationResult.shape.billingPlanHandle,
  billingUpdatedAt: OrganisationResult.shape.billingUpdatedAt,
  billingEnforcementReason: OrganisationResult.shape.billingEnforcementReason,
  billingEnforcementStartedAt: OrganisationResult.shape.billingEnforcementStartedAt,
  overLimitWarningSentAt: OrganisationResult.shape.overLimitWarningSentAt,
  overLimitReminderSentAt: OrganisationResult.shape.overLimitReminderSentAt,
  overLimitResolvedAt: OrganisationResult.shape.overLimitResolvedAt,
  overLimitAutoTrimmedAt: OrganisationResult.shape.overLimitAutoTrimmedAt,
  onboardingCompletions: z
    .record(z.string(), OnboardingCompletionModelSchema)
    .optional()
    .nullable(),
});

export type OrganisationModel = z.infer<typeof OrganisationModelSchema>;

export const OrganisationModel = {
  convertFromEntity(entity: OrganisationResultEntity, includeCredentials = false): OrganisationModel {
    if(includeCredentials) {
      console.log("includeCredentials IS TRUE");
    }

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
      settingsLastSynced: entity.settingsLastSynced ? new Date(entity.settingsLastSynced) : null,
      storefrontSnapshotChecksum: entity.storefrontSnapshotChecksum ?? null,
      storefrontSnapshotDirtyAt: entity.storefrontSnapshotDirtyAt
        ? new Date(entity.storefrontSnapshotDirtyAt)
        : null,
      storefrontSnapshotStartedAt: entity.storefrontSnapshotStartedAt
        ? new Date(entity.storefrontSnapshotStartedAt)
        : null,
      storefrontSnapshotLeaseExpiresAt: entity.storefrontSnapshotLeaseExpiresAt
        ? new Date(entity.storefrontSnapshotLeaseExpiresAt)
        : null,
      storefrontSnapshotLeaseToken: entity.storefrontSnapshotLeaseToken ?? null,
      storefrontSnapshotLastSyncedAt: entity.storefrontSnapshotLastSyncedAt
        ? new Date(entity.storefrontSnapshotLastSyncedAt)
        : null,
      orgRebuildRequestedAt: entity.orgRebuildRequestedAt
        ? new Date(entity.orgRebuildRequestedAt)
        : null,
      orgRebuildStartedAt: entity.orgRebuildStartedAt ? new Date(entity.orgRebuildStartedAt) : null,
      orgRebuildLeaseExpiresAt: entity.orgRebuildLeaseExpiresAt
        ? new Date(entity.orgRebuildLeaseExpiresAt)
        : null,
      orgRebuildLastCompletedAt: entity.orgRebuildLastCompletedAt
        ? new Date(entity.orgRebuildLastCompletedAt)
        : null,
      orgRebuildLeaseToken: entity.orgRebuildLeaseToken ?? null,
      activeClusterVersion: entity.activeClusterVersion ?? null,
      shopifyConnection: includeCredentials ? (entity.shopifyConnection ?? null) : null,
      shopifyConnectionStatus: entity.shopifyConnectionStatus ?? "INACTIVE",
      shopifySite: entity?.shopifyConnection?.domain ?? null,
      // custom
      settings: SettingsConverter.convertFromEntity(entity.settings),
      // billing
      billingPlanStatus: entity.billingPlanStatus ?? "INACTIVE",
      billingSubscriptionId: entity.billingSubscriptionId ?? null,
      billingPlanHandle: entity.billingPlanHandle ?? null,
      billingUpdatedAt: entity.billingUpdatedAt ? new Date(entity.billingUpdatedAt) : null,
      billingEnforcementReason: entity.billingEnforcementReason ?? null,
      billingEnforcementStartedAt: entity.billingEnforcementStartedAt
        ? new Date(entity.billingEnforcementStartedAt)
        : null,
      overLimitWarningSentAt: entity.overLimitWarningSentAt
        ? new Date(entity.overLimitWarningSentAt)
        : null,
      overLimitReminderSentAt: entity.overLimitReminderSentAt
        ? new Date(entity.overLimitReminderSentAt)
        : null,
      overLimitResolvedAt: entity.overLimitResolvedAt ? new Date(entity.overLimitResolvedAt) : null,
      overLimitAutoTrimmedAt: entity.overLimitAutoTrimmedAt
        ? new Date(entity.overLimitAutoTrimmedAt)
        : null,
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
