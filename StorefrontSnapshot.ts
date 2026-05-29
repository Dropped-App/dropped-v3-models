import { z } from "zod";

import { PublicLocationMapPayloadSchema } from "./Cluster";
import { SettingsGroupsSchema } from "./OrganisationSettings";

export const StorefrontSnapshotBoundsSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
});

export const StorefrontSnapshotItemSchema = z.union([
  z.object({
    type: z.literal("cluster"),
    count: z.number().int().nonnegative(),
    coordinates: z.tuple([z.number(), z.number()]),
    pointIds: z.array(z.string()),
    singleLocationData: PublicLocationMapPayloadSchema.optional().nullable(),
  }),
  z.object({
    type: z.literal("point"),
    id: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    location: PublicLocationMapPayloadSchema,
  }),
]);

export const StorefrontSnapshotChunkSchema = z.object({
  items: z.array(StorefrontSnapshotItemSchema),
});

export const StorefrontSnapshotChunkReferenceSchema = z.object({
  key: z.string().min(1),
  itemCount: z.number().int().nonnegative(),
});

export const StorefrontSnapshotIndexSchema = z.object({
  version: z.literal(1),
  checksum: z.string().min(1),
  updatedAt: z.string().min(1),
  settings: SettingsGroupsSchema,
  responseMode: z.enum(["cached_clusters", "dynamic_clusters", "points"]),
  responseZoom: z.number().nonnegative(),
  initialBounds: StorefrontSnapshotBoundsSchema,
  globalBounds: StorefrontSnapshotBoundsSchema,
  totalItems: z.number().int().nonnegative(),
  chunkCount: z.number().int().nonnegative().max(5),
  chunks: z.array(StorefrontSnapshotChunkReferenceSchema).max(5),
  sidebarTotalItems: z.number().int().nonnegative(),
  sidebarChunkCount: z.number().int().nonnegative().max(5),
  sidebarChunks: z.array(StorefrontSnapshotChunkReferenceSchema).max(5),
});

export type StorefrontSnapshotBounds = z.infer<typeof StorefrontSnapshotBoundsSchema>;
export type StorefrontSnapshotChunk = z.infer<typeof StorefrontSnapshotChunkSchema>;
export type StorefrontSnapshotIndex = z.infer<typeof StorefrontSnapshotIndexSchema>;
