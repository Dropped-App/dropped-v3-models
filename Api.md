## Auth

**Method:** `GET`  
**Route:** `shopify/auth`

Checks whether shop already has active Shopify connection with required scopes. If yes, returns org payload. Otherwise creates install `state` and returns Shopify OAuth URL for an offline install flow that now exchanges into expiring offline tokens.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)
* standard Shopify HMAC params for verification

### Success response when already connected

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "name": "Example Store",
    "shopifyConnectionStatus": "ACTIVE"
  }
}
```

### Success response when install required

```json
{
  "url": "https://example.myshopify.com/admin/oauth/authorize?client_id=..."
}
```

\---

## Install

**Method:** `GET`  
**Route:** `shopify/install`

Completes Shopify OAuth install flow. Verifies `shop` + `state`, exchanges `code` for an expiring offline access token plus refresh token, stores Shopify connection and token expiry metadata on org, registers uninstall/billing webhooks, backfills basic shop settings for first-time installs, then redirects to app.

### Query parameters

* `shop: string` (required)
* `code: string` (required)
* `state: string` (required)
* standard Shopify HMAC params for verification

### Success response

HTTP `302` redirect to `APP_URL`.

\---

## Check Billing

**Method:** `GET`  
**Route:** `shopify/checkBilling`

Checks current active Shopify app subscription, maps it to internal plan, updates org billing fields, and returns updated org when active billing found.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification
* `charge_id: string` (optional, used in current lookup flow)

### Success response when active subscription found

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "billingPlanStatus": "ACTIVE",
    "billingPlanHandle": "PRO",
    "billingEnforcementReason": null,
    "billingEnforcementStartedAt": null,
    "overLimitWarningSentAt": null,
    "overLimitReminderSentAt": null,
    "overLimitResolvedAt": null,
    "overLimitAutoTrimmedAt": null
  }
}
```

### Alternate success response

```json
{}
```

### Billing field notes

* `billingPlanStatus` is core subscription state and is only `ACTIVE` or `INACTIVE`
* `billingEnforcementReason` is separate enforcement metadata and may be `DOWNGRADE` or `INACTIVE`
* over-limit timestamps are populated only when org exceeds its current plan limit after downgrade/freeze

\---

## Ping Review

**Method:** `POST`  
**Route:** `shopify/pingReview`

Stores lightweight review feedback signals on org record.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "rating": 5,
  "reviewSurface": "shopify_app_store"
}
```

### Success response

```json
{}
```

\---

## Ping Web Vitals

**Method:** `POST`  
**Route:** `shopify/pingWebVitals`

Stores reported frontend vitals payload for shop.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "path": "/products/widget",
  "vitals": {
    "lcp": 1900,
    "cls": 0.02
  }
}
```

### Success response

```json
{}
```

\---

## Ping Alert

**Method:** `POST`  
**Route:** `shopify/pingAlert`

Stores alert payload and, outside `dev`, emails admin unless `silent` is truthy.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

Arbitrary JSON payload. Common pattern:

```json
{
  "type": "client_error",
  "message": "Example issue",
  "silent": false
}
```

### Success response

```json
{}
```

\---

## Create Location

**Method:** `POST`  
**Route:** `locations/createLocation`

Creates one location owned by authenticated org and returns full `LocationModel`.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "status": "ACTIVE",
  "name": "Auckland Flagship",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "phoneNumber": "+64 9 123 4567",
  "website": "https://example.com/stores/auckland",
  "emailAddress": "auckland@example.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "notes": "Main retail showroom.",
  "customFields": [
    {
      "key": "wheelchair_access",
      "label": "Wheelchair Access",
      "type": "TEXT",
      "value": "Wheelchair accessible entrance",
      "showOnListing": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "coordinates": [174.7633, -36.8485]
}
```

### Rules

* `name` is required
* `status` can be `ACTIVE`, `UNLISTED`, or `INACTIVE`
* omitted `status` defaults to `ACTIVE`
* `website` and `logoUrl` must be valid URLs when provided
* `emailAddress` must be valid email when provided
* `coordinates` must be `[longitude, latitude]`
* `coordinates[0]` must be between `-180` and `180`
* `coordinates[1]` must be between `-90` and `90`
* custom field values must match their declared `type`
* location ownership is always set from authenticated org, not request body
* create is rejected when adding one location would exceed authenticated org's billing plan location limit

### Location limit response

When the create would exceed the org's billing plan location limit, the endpoint returns HTTP `409`:

```json
"We could not create your new location because the limit on your Lifetime Free plan is 100, and your current amount of locations used is 100."
```

### Success response

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "org": "665f0d3f4f9a9b0099999999",
  "status": "ACTIVE",
  "name": "Auckland Flagship",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "phoneNumber": "+64 9 123 4567",
  "website": "https://example.com/stores/auckland",
  "emailAddress": "auckland@example.com",
  "logoUrl": "https://cdn.example.com/logo.png",
  "notes": "Main retail showroom.",
  "customFields": [
    {
      "key": "wheelchair_access",
      "label": "Wheelchair Access",
      "type": "TEXT",
      "value": "Wheelchair accessible entrance",
      "showOnListing": true
    }
  ],
  "filters": [
    {
      "key": "region",
      "value": "north-island"
    }
  ],
  "priority": 100,
  "coordinates": [174.7633, -36.8485],
  "createdAt": "2026-04-21T00:00:00.000Z",
  "updatedAt": "2026-04-21T00:00:00.000Z"
}
```

\---

## Update Location

**Method:** `POST`  
**Route:** `locations/updateLocation`

Updates one existing location owned by authenticated org and returns full `LocationModel`.

### Query parameters

* `shop: string` (required)

### Request body

`id` is required. All other fields are optional.

```json
{
  "id": "665f0d3f4f9a9b0012345678",
  "status": "UNLISTED",
  "name": "Auckland Flagship Updated",
  "notes": "Temporarily available by appointment.",
  "priority": 90,
  "coordinates": [174.7633, -36.8485]
}
```

### Rules

* `id` must be valid ObjectId string
* location must belong to authenticated org
* at least one field besides `id` must be provided
* omitted fields keep existing stored values
* merged result must still satisfy full location validation rules

### Success response

Returns full `LocationModel`.

\---

## Get Location

**Method:** `GET`  
**Route:** `locations/getLocation/{id}`

Returns one location owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

Returns full `LocationModel`.

\---

## Get Locations

**Method:** `GET`  
**Route:** `locations/getLocations`

Returns locations owned by authenticated org, sorted by `priority`, then `updatedAt`, then `createdAt` descending.

### Query parameters

* `shop: string` (required)
* `limit: number` (optional, max `100`; enables pagination)
* `page: number` (optional, defaults to `1`; when provided without `limit`, uses a default page size of `50`)
* `ids: string | string[]` (optional, comma-separated or repeated query param; when provided, returns all matching org-owned location ids and ignores pagination, search, status, and categories filters)
* `search: string` (optional, case-insensitive partial match against location `name` and address fields)
* `status: ACTIVE | UNLISTED | INACTIVE` (optional)
* `categories: string | string[]` (optional, comma-separated or repeated query param; matches assigned location filter `value`s)

### Success response

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "ACTIVE",
      "name": "Auckland Flagship",
      "addressLine1": "123 Queen Street",
      "addressLine2": "Level 2",
      "city": "Auckland",
      "postalCode": "1010",
      "stateProvince": "Auckland",
      "country": "New Zealand",
      "phoneNumber": "+64 9 123 4567",
      "website": "https://example.com/stores/auckland",
      "emailAddress": "auckland@example.com",
      "logoUrl": "https://cdn.example.com/logo.png",
      "notes": "Main retail showroom.",
      "customFields": [],
      "filters": [],
      "priority": 100,
      "coordinates": [174.7633, -36.8485],
      "createdAt": "2026-04-21T00:00:00.000Z",
      "updatedAt": "2026-04-21T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

\---

## Get Usage

**Method:** `GET`  
**Route:** `locations/getUsage`

Returns authenticated org's current location usage and billing plan location limit.

### Query parameters

* `shop: string` (required)

### Success response

```json
{
  "plan": {
    "id": "FREE",
    "name": "Lifetime Free"
  },
  "limit": 100,
  "usage": 42,
  "remaining": 58
}
```

### Notes

* `usage` counts all current locations owned by authenticated org
* `limit` comes from org `billingPlanHandle`; unknown or missing handles fall back to `FREE`
* `remaining` never returns a negative number

\---

## Get Public Map

**Method:** `GET`  
**Route:** `getPublicMap`

Public-facing map query endpoint. Resolves org from `shop` and returns either:

* cached precomputed clusters
* dynamic on-the-fly clusters when search/category filters are used
* raw points when clustering is disabled or zoom is above org clustering threshold
* distance-sorted raw points when coordinates are supplied outside clustering zoom

This endpoint does **not** require HMAC verification.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)
* `zoom: number` (required)
* `west: number` (required, longitude bound)
* `south: number` (required, latitude bound)
* `east: number` (required, longitude bound)
* `north: number` (required, latitude bound)
* `search: string` (optional; bypasses cluster cache and clusters matching locations dynamically)
* `categories: string | string[]` (optional, comma-separated or repeated query param; bypasses cluster cache and clusters matching locations dynamically)
* `source: SEARCH | GEOLOCATION` (optional; only used when `lng` and `lat` are also supplied)
* `lng: number` (optional; longitude for distance-aware point sorting/filtering)
* `lat: number` (optional; latitude for distance-aware point sorting/filtering)

### Notes

* frontend makes one request even when viewport crosses dateline
* backend handles dateline splitting internally
* endpoint applies public abuse rate limits
* when rate limit is exceeded, endpoint returns HTTP `429` with body `"Please try again later."`
* if `search` or `categories` are provided, precomputed cluster cache is skipped
* at zoom levels above org `clusteringZoomLevel`, raw points are returned instead of clusters
* if `source`, `lng`, and `lat` are provided **and** request zoom is not clustering, results are returned as raw points sorted nearest-first
* if request zoom is clustering, `source`/`lng`/`lat` are ignored and cluster behavior remains unchanged, except for IP-based geolocation fallback described below
* distance-aware point mode ignores text-field regex matching from `search`; coordinates are the source of truth for ordering/filtering
* if `source=GEOLOCATION` and org `geolocationMethod=IP_ADDRESS`, backend resolves coordinates from request IP and ignores supplied `lng`/`lat`
* if `source=GEOLOCATION` and `lng`/`lat` are omitted, backend resolves coordinates from request IP before applying distance mode
* IP-based geolocation uses MongoDB cache keyed by request IP before calling IPGeolocation.io
* if IP-based geolocation is required for `source=GEOLOCATION` and resolution fails, endpoint returns an error
* if `source=GEOLOCATION` and backend is using IP-derived coordinates, clustering is bypassed so response uses distance-aware raw points even when zoom would normally cluster
* in distance-aware point mode:
  * `source=GEOLOCATION` uses org `geolocationRadius`
  * `source=SEARCH` + `typedSearchDistanceMode=SPECIFIC_RADIUS` uses org `searchRadius`
  * `source=SEARCH` + `typedSearchDistanceMode=ENTIRE_SEARCHED_AREA` uses current viewport bounds, then sorts results by distance from supplied coordinates
  * `source=SEARCH` + `typedSearchDistanceMode=BOTH` combines viewport-bounded and radius-bounded results, then sorts merged results by distance from supplied coordinates
* distance is returned per point in the org's configured distance unit (`MILES` or `KILOMETERS`)
* every response now includes `centerCoordinates`
* `centerCoordinates` returns resolved center point used for distance-aware mode; this includes IP-derived geolocation coordinates when applicable
* when no center point is active, `centerCoordinates` is `null`
* every response now includes `centerAddress`
* `centerAddress` is populated only when backend resolved center from IP geolocation API fields; otherwise it is `null`

### Success response using cached or dynamic clusters

```json
{
  "mode": "cached_clusters",
  "zoom": 6,
  "centerCoordinates": null,
  "centerAddress": null,
  "items": [
    {
      "type": "cluster",
      "count": 3,
      "coordinates": [174.76, -36.84],
      "pointIds": [
        "665f0d3f4f9a9b0012345678",
        "665f0d3f4f9a9b0012345679",
        "665f0d3f4f9a9b0012345680"
      ],
      "singleLocationData": null
    },
    {
      "type": "cluster",
      "count": 1,
      "coordinates": [174.7762, -41.2865],
      "pointIds": ["665f0d3f4f9a9b0012345681"],
      "singleLocationData": {
        "id": "665f0d3f4f9a9b0012345681",
        "name": "Wellington Showroom",
        "addressLine1": "50 Willis Street",
        "addressLine2": null,
        "city": "Wellington",
        "postalCode": "6011",
        "stateProvince": "Wellington",
        "country": "New Zealand",
        "phoneNumber": null,
        "website": "https://example.com/stores/wellington",
        "emailAddress": null,
        "logoUrl": null,
        "notes": null,
        "customFields": [],
        "filters": [],
        "priority": 80,
        "coordinates": [174.7762, -41.2865]
      }
    }
  ]
}
```

### Success response using raw points

```json
{
  "mode": "points",
  "zoom": 12,
  "centerCoordinates": null,
  "centerAddress": null,
  "items": [
    {
      "type": "point",
      "id": "665f0d3f4f9a9b0012345678",
      "coordinates": [174.7633, -36.8485],
      "location": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship",
        "addressLine1": "123 Queen Street",
        "addressLine2": null,
        "city": "Auckland",
        "postalCode": "1010",
        "stateProvince": "Auckland",
        "country": "New Zealand",
        "phoneNumber": "+64 9 123 4567",
        "website": "https://example.com/stores/auckland",
        "emailAddress": "auckland@example.com",
        "logoUrl": "https://cdn.example.com/logo.png",
        "notes": "Main retail showroom.",
        "customFields": [],
        "filters": [],
        "priority": 100,
        "coordinates": [174.7633, -36.8485]
      }
    }
  ]
}
```

### Success response using distance-sorted raw points

```json
{
  "mode": "points",
  "zoom": 12,
  "centerCoordinates": {
    "lng": 174.7633,
    "lat": -36.8485
  },
  "centerAddress": {
    "formattedAddress": "Santa Clara, California, 95051, United States",
    "addressLine1": null,
    "addressLine2": null,
    "city": "Santa Clara",
    "postalCode": "95051",
    "stateProvince": "California",
    "country": "United States"
  },
  "items": [
    {
      "type": "point",
      "id": "665f0d3f4f9a9b0012345678",
      "coordinates": [174.7633, -36.8485],
      "distance": 1.24,
      "location": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship",
        "addressLine1": "123 Queen Street",
        "addressLine2": null,
        "city": "Auckland",
        "postalCode": "1010",
        "stateProvince": "Auckland",
        "country": "New Zealand",
        "phoneNumber": "+64 9 123 4567",
        "website": "https://example.com/stores/auckland",
        "emailAddress": "auckland@example.com",
        "logoUrl": "https://cdn.example.com/logo.png",
        "notes": "Main retail showroom.",
        "customFields": [],
        "filters": [],
        "priority": 100,
        "coordinates": [174.7633, -36.8485]
      }
    }
  ]
}
```

\---

## Save Search

**Method:** `POST`  
**Route:** `saveSearch`

Public-facing analytics endpoint that stores a search record against an org. Intended for frontend `navigator.sendBeacon()` use and does **not** require HMAC verification.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)

### Request body

```json
{
  "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
  "addressLine1": "123 Queen Street",
  "addressLine2": "Level 2",
  "city": "Auckland",
  "postalCode": "1010",
  "stateProvince": "Auckland",
  "country": "New Zealand",
  "coordinates": [174.7633, -36.8485],
  "nearestLocations": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Notes

* endpoint accepts raw JSON string body as typically sent by `navigator.sendBeacon()`
* org is resolved from `shop`
* `coordinates` must be `[longitude, latitude]` when provided
* `nearestLocations` may contain at most `10` ids
* every `nearestLocations` id must belong to same org or event is dropped
* payload must include meaningful search signal such as address text or coordinates plus nearest locations
* duplicate submissions within short rolling window are ignored using normalized payload fingerprinting
* endpoint intentionally returns `204` even when payload is invalid or dropped, to avoid giving abuse feedback

### Success response

HTTP `204` with empty body.

\---

## Save Logs

**Method:** `POST`  
**Route:** `saveLogs`

Public-facing support endpoint that emails internal team with storefront logs for a resolved `shop`. This endpoint does **not** require HMAC verification.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)

### Request body

```json
{
  "logs": [
    {
      "level": "error",
      "code": "MAP_LOAD_FAILED"
    }
  ],
  "message": "Store locator client logs",
  "user_agent": "Mozilla/5.0",
  "page": "https://example.com/pages/store-locator"
}
```

### Notes

* payload must be valid JSON object
* `logs` must be JSON array
* email is sent to internal `ADMIN_EMAIL`

### Success response

```json
{}
```

\---

## Get Searches

**Method:** `GET`  
**Route:** `searches/getSearches`

Returns search analytics records owned by authenticated org for a requested time period.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)
* `nearestLocationsMode: BOTH | EMPTY | HAS_VALUES` (optional, defaults to `BOTH`)
* `limit: number` (optional, max `100`; enables pagination)
* `page: number` (optional, defaults to `1`; when provided without `limit`, uses default page size `50`)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* response includes only first nearest location from stored `nearestLocations` array
* first nearest location is returned as `nearestLocation` with `id` and resolved location `name`
* `nearestLocationsMode=EMPTY` returns only searches without any nearest locations
* `nearestLocationsMode=HAS_VALUES` returns only searches with at least one nearest location

### Success response

```json
{
  "searches": [
    {
      "id": "68101d3f4f9a9b0012345000",
      "org": "665f0d3f4f9a9b0099999999",
      "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
      "addressLine1": "123 Queen Street",
      "addressLine2": "Level 2",
      "city": "Auckland",
      "postalCode": "1010",
      "stateProvince": "Auckland",
      "country": "New Zealand",
      "coordinates": [174.7633, -36.8485],
      "nearestLocation": {
        "id": "665f0d3f4f9a9b0012345678",
        "name": "Auckland Flagship"
      },
      "createdAt": "2026-04-28T00:00:00.000Z",
      "updatedAt": "2026-04-28T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 42,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

\---

## Get Search Coordinates

**Method:** `GET`  
**Route:** `searches/getSearchCoordinates`

Returns only coordinates for search records owned by authenticated org for a requested time period. This endpoint is not paginated.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)
* `nearestLocationsMode: BOTH | EMPTY | HAS_VALUES` (optional, defaults to `BOTH`)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* results preserve stored search ordering by newest first

### Success response

```json
{
  "searches": [
    {
      "coordinates": [174.7633, -36.8485]
    },
    {
      "coordinates": null
    }
  ]
}
```

\---

## Get Location Search Count

**Method:** `GET`  
**Route:** `searches/getLocationSearchCount/{id}`

Returns how many searches for authenticated org include a given location inside their `nearestLocations` array within requested time period.

### Query parameters

* `shop: string` (required)
* `from: string` (required, ISO date/datetime)
* `to: string` (required, ISO date/datetime)

### Path parameters

* `id: string` (required, must be valid ObjectId string for location owned by authenticated org)

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* `to` must be greater than or equal to `from`
* requested time period must be `90` days or less
* location must belong to authenticated org

### Success response

```json
{
  "locationId": "665f0d3f4f9a9b0012345678",
  "from": "2026-04-01T00:00:00.000Z",
  "to": "2026-04-28T23:59:59.999Z",
  "count": 18
}
```

\---

## Delete Location

**Method:** `POST`  
**Route:** `locations/deleteLocation/{id}`

Deletes one location owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

```json
{
  "deleted": true,
  "id": "665f0d3f4f9a9b0012345678"
}
```

\---

## Import Locations Bulk

**Method:** `POST`  
**Route:** `locations/importLocationsBulk`

Imports many locations for authenticated org in one request. Backend may create new records, update existing records, geocode missing coordinates from address data, and parse a formatted address into structured parts based on request options.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "status": "ACTIVE",
      "name": "Auckland Flagship",
      "formattedAddress": "123 Queen Street, Auckland 1010, New Zealand",
      "addressLine1": null,
      "addressLine2": null,
      "city": null,
      "postalCode": null,
      "stateProvince": null,
      "country": null,
      "website": "https://example.com/stores/auckland",
      "emailAddress": "auckland@example.com",
      "priority": 100,
      "coordinates": null
    },
    {
      "status": "UNLISTED",
      "name": "Wellington Showroom",
      "addressLine1": "50 Willis Street",
      "city": "Wellington",
      "postalCode": "6011",
      "stateProvince": "Wellington",
      "country": "New Zealand",
      "coordinates": null
    }
  ],
  "options": {
    "matchExistingByAddressOrCoordinates": true,
    "resolveCoordinatesFromAddress": true,
    "parseFormattedAddress": true
  }
}
```

### Rules

* `locations` array must contain at least one item
* every item must include `name`
* `id`, when provided, must be valid ObjectId string and takes priority over non-id matching
* `formattedAddress` is optional and may be used by backend to derive structured address fields
* `options.matchExistingByAddressOrCoordinates=true` allows backend to update an existing location when no `id` is supplied and a unique existing match is found
* backend matching priority should be:
  * explicit `id`
  * exact normalized address match
  * unique coordinate proximity match
* ambiguous non-id matches should be skipped rather than auto-updated
* `options.resolveCoordinatesFromAddress=true` allows backend to geocode rows that have address data but no coordinates
* `options.parseFormattedAddress=true` allows backend to split `formattedAddress` into `addressLine1`, `addressLine2`, `city`, `postalCode`, `stateProvince`, and `country`
* when parsing `formattedAddress`, explicitly provided structured address fields should win and parsed values should only fill blanks
* request pre-validates rows before queueing, including `id` validation, existing-record matching, document-shape validation, and billing-plan limit checks
* rows that fail pre-validation are stored on the job as `skipped` and are not queued for execution
* import writes run asynchronously through a dedicated backend SNS worker; endpoint returns after job creation, not after location writes or geocoding finish
* once the import worker writes locations, any required geocoding/parsing follow-up is queued through backend geocode jobs
* queued geocode work is processed in batches of up to `10` location ids per job
* request may return mixed outcomes per row; backend should not fail the entire import solely because one row is skipped as ambiguous or unresolvable
* only net-new created locations count against billing plan limit; updates do not
* request is rejected before writing when created rows would exceed authenticated org's billing plan location limit

### Location limit response

When the import would exceed the org's billing plan location limit, the endpoint returns HTTP `409`:

```json
"We could not create your 10 new locations because the limit on your Lifetime Free plan is 100, and your current amount of locations used is 95."
```

### Success response

```json
{
  "job": {
    "id": "6827f0d34f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "status": "PENDING",
    "totalRows": 2,
    "queuedCount": 2,
    "createdCount": 1,
    "updatedCount": 1,
    "skipped": []
  }
}
```

\---

## Get Import Jobs

**Method:** `GET`  
**Route:** `locations/getImportJobs`

Returns paginated location import jobs for authenticated org, newest first.

### Query parameters

* `shop: string` (required)
* `limit: number` (optional, defaults to `50`, max `100`)
* `page: number` (optional, defaults to `1`)
* `status: PENDING | PROCESSING | COMPLETED | FAILED` (optional)

### Success response

```json
{
  "jobs": [
    {
      "id": "6827f0d34f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "status": "COMPLETED",
      "totalRows": 2,
      "queuedCount": 2,
      "createdCount": 1,
      "updatedCount": 1,
      "skipped": [],
      "result": {
        "createdLocationIds": ["665f0d3f4f9a9b0012345679"],
        "updatedLocationIds": ["665f0d3f4f9a9b0012345678"],
        "geocodeQueuedCount": 1
      },
      "requestedAt": "2026-05-17T01:00:00.000Z",
      "startedAt": "2026-05-17T01:00:02.000Z",
      "completedAt": "2026-05-17T01:00:04.000Z",
      "failedAt": null,
      "error": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

\---

## Get Import Job

**Method:** `GET`  
**Route:** `locations/getImportJob/{id}`

Returns one location import job owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Path parameters

* `id: string` (required, must be valid ObjectId string)

### Success response

```json
{
  "job": {
    "id": "6827f0d34f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "status": "FAILED",
    "totalRows": 8,
    "queuedCount": 6,
    "createdCount": 4,
    "updatedCount": 2,
    "skipped": [
      {
        "row": 7,
        "reason": "ambiguous_match"
      },
      {
        "row": 8,
        "reason": "id_not_found"
      }
    ],
    "result": null,
    "requestedAt": "2026-05-17T01:00:00.000Z",
    "startedAt": "2026-05-17T01:00:02.000Z",
    "completedAt": null,
    "failedAt": "2026-05-17T01:00:05.000Z",
    "error": "Location not found for queued update row 3"
  }
}
```

\---

## Queue Location Geocode

**Method:** `POST`  
**Route:** `locations/queueLocationGeocode`

Queues existing locations for address parsing and coordinate resolution using the same asynchronous geocode worker used by bulk import.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locationIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Rules

* `locationIds` array must contain at least one item
* every `locationId` must be a valid ObjectId string
* every targeted location must belong to authenticated org
* queueing creates async geocode job records and publishes SNS work in batches of up to `50` location ids per job
* queued geocode work may fill missing `addressLine1`, `addressLine2`, `city`, `postalCode`, `stateProvince`, `country`, and `coordinates`
* explicitly stored location fields still win; geocode data only fills blanks

### Success response

```json
{
  "queuedLocationIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

\---

## Suppress Location Warnings

**Method:** `POST`  
**Route:** `locations/suppressLocationWarnings`

Sets `suppressWarnings=true` on existing locations owned by authenticated org so they are ignored by maintenance audits.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locationIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Rules

* `locationIds` array must contain at least one item
* every `locationId` must be a valid ObjectId string
* every targeted location must belong to authenticated org
* endpoint only sets `suppressWarnings` to `true`
* suppressed locations are ignored by `getLocationMaintenanceAudit`, including missing address, missing coordinates, and duplicate-location checks

### Success response

```json
{
  "suppressedLocationIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

\---

## Retry Location Geocode Jobs

**Method:** `POST`  
**Route:** `locations/retryLocationGeocodeJobs`

Retries previously failed geocode jobs for authenticated org.

### Query parameters

* `shop: string` (required)

### Rules

* request retries all geocode jobs currently in `FAILED` status for authenticated org
* retry resets those jobs to `PENDING` and republishes their saved SNS payload
* geocode job records are source of truth for status; organisation model does not expose separate geocode summary fields

### Success response

```json
{
  "retriedJobIds": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

\---

## Get Location Maintenance Audit

**Method:** `GET`  
**Route:** `locations/getLocationMaintenanceAudit`

Returns maintenance-oriented location issue lists for authenticated org.

### Query parameters

* `shop: string` (required)

### Rules

* `missingAddressParts` contains location ids that have some structured address data but are missing one or more of `addressLine1`, `city`, `postalCode`, `stateProvince`, or `country`
* `missingCoordinates` contains location ids that have some structured address data but no `coordinates`
* locations with `suppressWarnings=true` are excluded from all audit result sets
* `duplicateLocations` contains one object per duplicate pair with:
  * `recommendedDelete`: weaker duplicate using existing scoring rules
  * `recommendedKeep`: other location in that pair
  * `oldestLocation`: older record by `createdAt`
  * `newestLocation`: newer record by `createdAt`
* duplicate detection uses:
  * exact normalized structured address match
  * or coordinate proximity within the same near-match threshold used by import matching
* weaker duplicate means record with fewer filled information fields
* if both duplicates have same filled-field count, older record becomes `recommendedDelete`

### Success response

```json
{
  "missingAddressParts": [
    "665f0d3f4f9a9b0012345678"
  ],
  "missingCoordinates": [
    "665f0d3f4f9a9b0012345679"
  ],
  "duplicateLocations": [
    {
      "recommendedKeep": "665f0d3f4f9a9b0012345681",
      "recommendedDelete": "665f0d3f4f9a9b0012345680",
      "oldestLocation": "665f0d3f4f9a9b0012345680",
      "newestLocation": "665f0d3f4f9a9b0012345681"
    }
  ]
}
```

\---

## Get Location Geocode Jobs Summary

**Method:** `GET`  
**Route:** `locations/getLocationGeocodeJobsSummary`

Returns geocode job summary counts for authenticated org.

### Query parameters

* `shop: string` (required)

### Rules

* `processing` includes both `PENDING` and `PROCESSING` jobs
* `failed` includes jobs currently in `FAILED` status
* use this endpoint as source of truth for geocode queue status

### Success response

```json
{
  "processing": 3,
  "failed": 1
}
```

\---

## Update Locations Bulk

**Method:** `POST`  
**Route:** `locations/updateLocationsBulk`

Updates many locations owned by authenticated org in one request.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "locations": [
    {
      "id": "665f0d3f4f9a9b0012345678",
      "status": "ACTIVE",
      "priority": 110,
      "notes": "Recently renovated.",
      "coordinates": [174.7633, -36.8485]
    },
    {
      "id": "665f0d3f4f9a9b0012345679",
      "status": "INACTIVE",
      "notes": "Closed for winter.",
      "coordinates": [174.7762, -41.2865]
    }
  ]
}
```

### Rules

* `locations` array must contain at least one item
* every `id` must be valid ObjectId string
* every targeted location must belong to authenticated org
* every item must include at least one field besides `id`
* request is all-or-nothing; if any id is missing or invalid, nothing is updated

### Success response

Returns updated `locations` array with full `LocationModel` items.

\---

## Delete Locations Bulk

**Method:** `POST`  
**Route:** `locations/deleteLocationsBulk`

Deletes many locations owned by authenticated org in one request.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "ids": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ]
}
```

### Rules

* `ids` array must contain at least one item
* every `id` must be valid ObjectId string
* every targeted location must belong to authenticated org
* request is all-or-nothing; if any id is missing or invalid, nothing is deleted

### Success response

```json
{
  "deleted": true,
  "ids": [
    "665f0d3f4f9a9b0012345678",
    "665f0d3f4f9a9b0012345679"
  ],
  "deletedCount": 2
}
```

## Update Org

**Method:** `POST`  
**Route:** `shopify/updateOrg`

Updates organisation-level fields and store locator settings for the authenticated org.

This endpoint now accepts a structured `settings` object that maps directly to the organisation settings groups stored on `Organisation.settings`.

### Settings groups

The `settings` payload is grouped by feature area so frontend and backend can share the same Zod schemas and converters when parsing request input, storing entity data, and returning API output.

Supported groups:

* `categoriesAndFilters`
  Covers category/filter definitions, optional category-level pin style overrides, and whether multiple selections use AND or OR matching.
* `customFields`
  Covers reusable location custom field definitions, their names, field types (`TEXT`, `TEXT_MULTILINE`, `LINK`), and whether they appear in storefront listings.
* `dealerForms`
  Covers public dealer application form field definitions, supported field types (`TEXT`, `TEXT_MULTILINE`, `SELECT`, `CONTACT`, `EMAIL`, `PHONE`, `ADDRESS`, `CHECKBOX`, `FILE_UPLOAD`, `IMAGE_UPLOAD`, `NUMBER`, `LINK`), whether each field is required, whether core fields are `locked` in admin UI, structured object storage for `CONTACT` and `ADDRESS` fields, admin notification email preferences, shared notification accent color, dealer confirmation email enablement, dealer email subject/body templates for both submission and published notifications with `{name}` placeholder support, and optional reCAPTCHA site key, secret key, and version settings for public form submission protection.
* `language`
  Covers primary language, translated languages, editable user-facing locator text, and per-language label overrides for categories/filters and custom fields.
* `provider`
  Covers map provider selection (`LEAFLET`, `MAPBOX`, `GOOGLE_MAPS`), provider-specific theme/style settings, and the required default map pin style. `LEAFLET` does not require an API key; the other providers do.
* `searchBehaviour`
  Covers initial map position, clustering, geolocation method/button/icon color, distance rules, result limits, units, autocomplete, and country locking.

### Converter behavior

Each settings group has its own converter in `models/OrganisationSettings.ts` and `models/settings/*`.

Those converters are used to:

* parse unknown frontend/backend input with Zod
* normalize entity data when reading from MongoDB
* normalize API payloads before persisting organisation settings

`shopify/updateOrg` performs a partial top-level merge on `settings`, so sending one group does not overwrite unrelated groups already stored on the organisation.

### Onboarding completions

`shopify/updateOrg` also accepts an optional `onboardingCompletions` object keyed by completion key.

Each completion record stores:

* `completedAt`
  ISO timestamp for when completion was last recorded.
* `install`
  Optional install metadata for storefront install steps.
* `install.themeId`
  Shopify theme ID used for install.
* `install.template`
  Template used for install, for example `index` or `page.stockists`.
* `install.pageHandle`
  Shopify page handle when completion applies to a page install.

Frontend completion resolution now follows this order:

1. read completion from current org state
2. fall back to localStorage if org value is missing or invalid
3. if localStorage has newer valid structured data than org, sync local copy back to org

Legacy localStorage values like `"1"` still count as completed for fallback checks, but they do not contain install details and are not synced back to org until overwritten by a newer structured completion record.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "contactEmail": "alerts@example.com",
  "onboardingCompletions": {
    "stockists_map_install_custom": {
      "completedAt": "2026-05-13T01:23:45.000Z",
      "install": {
        "themeId": "gid://shopify/Theme/123456789",
        "template": "page.stockists",
        "pageHandle": "stockists"
      }
    }
  },
  "settings": {
    "provider": {
      "provider": "LEAFLET",
      "mapThemeMode": "PROVIDER_DEFAULT",
      "defaultPinStyle": {
          "name": "Default pin",
          "pinType": "STANDARD_PIN_ICON",
          "pinColor": "#EA4335"
      }
    },
    "categoriesAndFilters": {
      "categories": [
        {
          "key": "retailer",
          "label": "Retailer",
          "pinStyle": null
        }
      ],
      "multipleSelectionMode": "MATCH_ANY"
    },
    "customFields": {
      "fields": [
        {
          "key": "opening-hours",
          "label": "Opening Hours",
          "type": "TEXT_MULTILINE",
          "showOnListing": true
        }
      ]
    },
    "dealerForms": {
      "notificationEnabled": true,
      "notificationEmail": "dealer-alerts@example.com",
      "dealerNotificationEnabled": true,
      "notificationAccentColor": "#2563eb",
      "dealerNotificationSubject": "Dealer submission received",
      "dealerNotificationBody": "Hi {name},\n\nYour dealer submission has been received. We will reach out to you soon on the status of your submission or if we have any questions.",
      "dealerPublishedSubject": "Dealer submission published",
      "dealerPublishedBody": "Hi {name},\n\nYour dealer submission has been published. You will see your dealer listing on our map shortly.",
      "recaptchaSiteKey": "site-key",
      "recaptchaSecretKey": "secret-key",
      "recaptchaVersion": "V3",
      "fields": [
        {
          "key": "contact",
          "label": "Contact",
          "type": "CONTACT",
          "required": true,
          "locked": true,
          "options": []
        },
        {
          "key": "address",
          "label": "Address",
          "type": "ADDRESS",
          "required": true,
          "locked": true,
          "options": []
        },
        {
          "key": "name",
          "label": "Store name",
          "type": "TEXT",
          "required": true,
          "locked": true,
          "options": []
        },
        {
          "key": "businessType",
          "label": "Business type",
          "type": "SELECT",
          "required": false,
          "locked": false,
          "options": [
            {
              "label": "Retailer",
              "value": "retailer"
            },
            {
              "label": "Distributor",
              "value": "distributor"
            }
          ]
        }
      ]
    },
    "searchBehaviour": {
      "startingPositionMode": "FIT_ALL_LOCATIONS",
      "clusterLocationsWhenZoomedOut": true,
      "geolocationMethod": "HIGH_ACCURACY",
      "typedSearchDistanceMode": "BOTH",
      "distanceUnit": "KILOMETERS",
      "searchSuggestionMode": "REGIONS_AND_ADDRESSES"
    }
  }
}
```

### Rules

* `contactEmail` must be email-shaped when provided
* `settings` is optional
* every provided settings group must match its shared Zod schema
* omitted top-level settings groups keep their existing stored values
* the response returns the full `OrganisationModel` with normalized `settings`
* `billingPlanStatus` remains `ACTIVE` or `INACTIVE`; over-limit downgrade tracking lives in separate enforcement fields on the response model

\---

## Get Dealer Form Submissions

**Method:** `GET`  
**Route:** `dealerForms/getDealerFormSubmissions`

Returns paginated dealer form submissions owned by authenticated org, newest first.

### Query parameters

* `shop: string` (required)
* `limit: number` (optional, max `100`, default `50`)
* `page: number` (optional, default `1`)
* `search: string` (optional, searches contact name, contact email, location name, and stored field values)
* `status: OPEN | PUBLISHED | ARCHIVED` (optional)
* when `status` is omitted, endpoint includes open and published submissions but excludes archived ones

### Success response

```json
{
  "submissions": [
    {
      "id": "6820adf54f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "archived": false,
      "publishedLocationId": null,
      "contactName": "Jane Doe",
      "contactEmail": "jane@example.com",
      "locationName": "Downtown Bikes",
      "fields": [
        {
          "key": "contact",
          "label": "Contact",
          "type": "CONTACT",
          "required": true,
          "value": {
            "name": "Jane Doe",
            "email": "jane@example.com"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

\---

## Publish Dealer Form Submission

**Method:** `POST`  
**Route:** `dealerForms/publishDealerFormSubmission`

Publishes one dealer form submission into a location. Can optionally email dealer using organisation publish email settings.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "id": "6820adf54f9a9b0012345678",
  "status": "ACTIVE",
  "sendEmail": true,
}
```

### Rules

* `id` must be valid ObjectId string for submission owned by authenticated org
* `status` must be `ACTIVE` or `UNLISTED`
* archived submissions cannot be published
* published submissions cannot be published again
* mapped location fields use reserved dealer field keys:
  `name`, `address`, `phoneNumber`, `website`, `emailAddress`, `logoUrl`
* `contact` field stores structured contact parts inside one value object:
  `name`, `email`
* `address` field stores structured address parts inside one value object:
  `addressLine1`, `addressLine2`, `city`, `postalCode`, `stateProvince`, `country`
* all other populated dealer form fields are stored as location `customFields`
* dealer email is only sent when `sendEmail` is truthy
* dealer publish email subject/body come from org `dealerForms.dealerPublishedSubject` and `dealerForms.dealerPublishedBody`
* dealer unsubscribe list suppresses optional publish emails
* publish is rejected when creating the location would exceed authenticated org's billing plan location limit

### Location limit response

When publishing would exceed the org's billing plan location limit, the endpoint returns HTTP `409`:

```json
"We could not create your new location because the limit on your Lifetime Free plan is 100, and your current amount of locations used is 100."
```

### Success response

```json
{
  "submission": {
    "id": "6820adf54f9a9b0012345678",
    "archived": false,
    "publishedLocationId": "6820ae104f9a9b0012345679"
  },
  "location": {
    "id": "6820ae104f9a9b0012345679",
    "status": "ACTIVE",
    "name": "Downtown Bikes"
  }
}
```

\---

## Set Dealer Form Submission Archived

**Method:** `POST`  
**Route:** `dealerForms/setDealerFormSubmissionArchived`

Sets `archived` flag on one dealer form submission.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "id": "6820adf54f9a9b0012345678",
  "archived": true
}
```

### Rules

* `id` must be valid ObjectId string for submission owned by authenticated org
* published submissions cannot be archived
* archived submissions can be unarchived by sending `"archived": false`
* archiving never sends email

### Success response

Returns updated `DealerFormSubmissionModel`.

\---

## Delete Dealer Form Submission

**Method:** `POST`  
**Route:** `dealerForms/deleteDealerFormSubmission`

Deletes one dealer form submission owned by authenticated org.

### Query parameters

* `shop: string` (required)

### Request body

```json
{
  "id": "6820adf54f9a9b0012345678"
}
```

### Success response

```json
{
  "deleted": true,
  "id": "6820adf54f9a9b0012345678"
}
```

\---

## Submit Dealer Form

**Method:** `POST`  
**Route:** `dealerForms/submit`

Public-facing dealer application endpoint. Validates submission against resolved org dealer form settings, stores new submission, emails dealer confirmation, and optionally emails org notification recipient.

This endpoint does **not** require HMAC verification.

### Query parameters

* `shop: string` (required, must end with `myshopify.com`)

### Request body

```json
{
  "recaptchaToken": "captcha-token",
  "fields": [
    {
      "key": "name",
      "value": "Downtown Bikes"
    },
    {
      "key": "address",
      "value": {
        "addressLine1": "123 Queen Street",
        "addressLine2": "Level 2",
        "city": "Auckland",
        "postalCode": "1010",
        "stateProvince": "Auckland",
        "country": "New Zealand"
      }
    },
    {
      "key": "contact",
      "value": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    },
    {
      "key": "message",
      "value": "We would love to stock your range."
    },
    {
      "key": "logoUrl",
      "value": {
        "fileName": "downtown-bikes.png",
        "mimeType": "image/png",
        "base64": "iVBORw0KGgoAAAANSUhEUgAA..."
      }
    }
  ]
}
```

### Rules

* request body must include at least one field
* submitted fields are validated against resolved org `dealerForms.fields`
* `required` fields must be present and non-empty
* `CONTACT` fields must be submitted as structured objects with `name` and `email` inside one field value
* `ADDRESS` fields must be submitted as structured objects with address parts nested inside one field value
* `EMAIL` fields must be email-shaped
* `LINK` fields must be valid URLs
* `FILE_UPLOAD` and `IMAGE_UPLOAD` fields can be sent as:
  * Shopify/public URL strings
  * data URL strings (`data:<mime>;base64,...`)
  * objects with `base64`, optional `fileName`, and optional `mimeType`
* base64 file/image uploads are uploaded to the organisation's Shopify Files and stored in MongoDB as the resulting Shopify URL
* `SELECT` fields must match one configured option value
* when org `dealerForms.recaptchaSiteKey`, `dealerForms.recaptchaSecretKey`, and `dealerForms.recaptchaVersion` are configured, `recaptchaToken` is required and validated server-side with Google reCAPTCHA before the submission is stored
* dealer confirmation email can be disabled with org `dealerForms.dealerNotificationEnabled`
* dealer confirmation email subject/body use org settings templates and replace `{name}` with submitted contact name or empty string
* dealer confirmation email is suppressed when dealer email is unsubscribed
* org admin notification email is suppressed when org dealer notifications are disabled
* endpoint applies public abuse rate limits
* when rate limit is exceeded, endpoint returns HTTP `429` with body `"Please try again later."`

### Success response

```json
{
  "submitted": true,
  "id": "6820adf54f9a9b0012345678"
}
```

\---

## Unsubscribe Org Dealer Form Notifications

**Method:** `GET`  
**Route:** `dealerForms/unsubscribeOrg`

Public unsubscribe link endpoint that disables organisation dealer form admin notifications.

This endpoint does **not** require HMAC verification.

### Query parameters

* `orgId: string` (required)
* `token: string` (required)

### Success response

Plain text response:

```text
Dealer form email notifications unsubscribed.
```

\---

## Unsubscribe Dealer Form Email

**Method:** `GET`  
**Route:** `dealerForms/unsubscribeDealer`

Public unsubscribe link endpoint that stores org-scoped dealer email unsubscribe record. Future dealer confirmation and optional published emails for that org+email are suppressed.

This endpoint does **not** require HMAC verification.

### Query parameters

* `orgId: string` (required)
* `email: string` (required)
* `token: string` (required)

### Success response

Plain text response:

```text
Dealer email unsubscribed.
```

\---

## Connect Google Sheets With Code

**Method:** `POST`  
**Route:** `googleSheets/connectWithCode`

Primary Google Sheets connect endpoint for browser popup auth code flow. Frontend obtains one-time auth code with Google Identity Services popup UX, posts it to backend, backend exchanges it for tokens, stores refresh token for offline sync, then returns same sync summary shape as `getSync`.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "code": "4/0AeaY..."
}
```

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* popup code exchange uses browser page origin as Google OAuth `redirect_uri`
* backend exchanges code for Google access/refresh tokens and stores them on existing sync record
* if Google does not return new refresh token, backend preserves previously stored refresh token when present
* backend records Google account email from Google userinfo endpoint
* sync record is moved to `CONNECTED` status after successful exchange
* response payload intentionally matches `getSync` so frontend can open Picker immediately without another auth prompt

### Success response

```json
{
  "connected": true,
  "picker": {
    "appId": "123456789012",
    "clientId": "example.apps.googleusercontent.com",
    "developerKey": "AIzaExample",
    "oauthToken": "ya29.a0AfH6SMExample",
    "oauthTokenExpiresAt": "2026-05-18T01:00:00.000Z"
  },
  "sync": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "status": "CONNECTED",
    "googleEmail": "owner@example.com",
    "spreadsheetId": null,
    "spreadsheetName": null,
    "spreadsheetUrl": null,
    "sheetId": null,
    "sheetName": null,
    "headerRow": null,
    "dataStartRow": null,
    "externalIdColumn": null,
    "externalIdFallbackStatus": "ACTIVE",
    "mappings": null,
    "options": null,
    "lastCheckedAt": null,
    "lastSourceModifiedAt": null,
    "lastSyncedAt": null,
    "lastErrorAt": null,
    "lastErrorMessage": null,
    "errorNotificationsEnabled": true,
    "createdAt": "2026-05-18T01:00:00.000Z",
    "updatedAt": "2026-05-18T01:00:00.000Z"
  }
}
```

\---

## Get Google Sheets Sync

**Method:** `GET`  
**Route:** `googleSheets/getSync`

Returns current org Google Sheets sync summary and stored sync configuration when present.

Response also includes Google Picker configuration for the frontend. When `connected=true`, `picker.oauthToken` contains a short-lived access token that the frontend can pass to Google Picker. Response shape matches `POST googleSheets/connectWithCode`.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Success response

```json
{
  "connected": true,
  "picker": {
    "appId": "123456789012",
    "clientId": "example.apps.googleusercontent.com",
    "developerKey": "AIzaExample",
    "oauthToken": "ya29.a0AfH6SMExample",
    "oauthTokenExpiresAt": "2026-05-18T01:00:00.000Z"
  },
  "sync": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "status": "ACTIVE",
    "googleEmail": "owner@example.com",
    "spreadsheetId": "1abcDEFghiJKLmnop",
    "spreadsheetName": "Store Locations",
    "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1abcDEFghiJKLmnop/edit",
    "sheetId": 0,
    "sheetName": "Locations",
    "headerRow": 1,
    "dataStartRow": 2,
    "externalIdColumn": "externalId",
    "externalIdFallbackStatus": "ACTIVE",
    "mappings": [
      {
        "kind": "LOCATION_FIELD",
        "sourceColumn": "Name",
        "field": "name"
      }
    ],
    "options": {
      "deleteMissingRows": true,
      "matchExistingByAddressOrCoordinates": true,
      "resolveCoordinatesFromAddress": true,
      "parseFormattedAddress": true
    },
    "lastCheckedAt": "2026-05-09T11:55:00.000Z",
    "lastSourceModifiedAt": "2026-05-09T11:54:40.000Z",
    "lastSyncedAt": "2026-05-09T12:00:00.000Z",
    "lastErrorAt": null,
    "lastErrorMessage": null,
    "errorNotificationsEnabled": true,
    "createdAt": "2026-05-09T11:00:00.000Z",
    "updatedAt": "2026-05-09T12:00:00.000Z"
  }
}
```

\---

## Get Google Sheets Operations

**Method:** `GET`  
**Route:** `googleSheets/getOperations`

Returns Google Sheets sync operation log records for authenticated org. Results are sorted newest to oldest by default.

### Query parameters

* `shop: string` (required)
* `limit: number` (optional, defaults to `50`, max `100`)
* `page: number` (optional, defaults to `1`)
* `syncId: string` (optional)
* `operation: CREATE | UPDATE | DELETE` (optional)
* standard Shopify HMAC params for verification

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* all returned records are scoped to authenticated org
* `syncId` filters to one Google Sheets sync record
* `operation` filters to one operation type
* default sort order is newest to oldest using operation timestamp

### Success response

```json
{
  "operations": [
    {
      "id": "681111114f9a9b0012345690",
      "org": "665f0d3f4f9a9b0099999999",
      "sync": "681111114f9a9b0012345678",
      "syncRow": "681111114f9a9b0012345689",
      "operation": "UPDATE",
      "externalId": "AKL-001",
      "rowNumber": 2,
      "rawRowData": {
        "externalId": "AKL-001",
        "Name": "Auckland Flagship",
        "Address": "1 Queen Street, Auckland 1010, New Zealand"
      },
      "mappedData": {
        "externalId": "AKL-001",
        "location": {
          "status": "ACTIVE",
          "name": "Auckland Flagship",
          "addressLine1": null,
          "addressLine2": null,
          "city": null,
          "postalCode": null,
          "stateProvince": null,
          "country": null,
          "phoneNumber": null,
          "website": null,
          "emailAddress": null,
          "logoUrl": null,
          "notes": null,
          "customFields": null,
          "filters": null,
          "priority": null,
          "suppressWarnings": null,
          "coordinates": null,
          "formattedAddress": "1 Queen Street, Auckland 1010, New Zealand",
          "id": null
        }
      },
      "locationId": "681111114f9a9b0012345688",
      "previousLocation": {
        "id": "681111114f9a9b0012345688",
        "org": "665f0d3f4f9a9b0099999999",
        "status": "ACTIVE",
        "name": "Auckland Store",
        "addressLine1": null,
        "addressLine2": null,
        "city": null,
        "postalCode": null,
        "stateProvince": null,
        "country": null,
        "phoneNumber": null,
        "website": null,
        "emailAddress": null,
        "logoUrl": null,
        "notes": null,
        "customFields": null,
        "filters": null,
        "priority": null,
        "suppressWarnings": null,
        "coordinates": null,
        "createdAt": "2026-05-09T08:00:00.000Z",
        "updatedAt": "2026-05-09T08:10:00.000Z"
      },
      "nextLocation": {
        "id": "681111114f9a9b0012345688",
        "org": "665f0d3f4f9a9b0099999999",
        "status": "ACTIVE",
        "name": "Auckland Flagship",
        "addressLine1": null,
        "addressLine2": null,
        "city": null,
        "postalCode": null,
        "stateProvince": null,
        "country": null,
        "phoneNumber": null,
        "website": null,
        "emailAddress": null,
        "logoUrl": null,
        "notes": null,
        "customFields": null,
        "filters": null,
        "priority": null,
        "suppressWarnings": null,
        "coordinates": null,
        "createdAt": "2026-05-09T08:00:00.000Z",
        "updatedAt": "2026-05-09T08:59:21.000Z"
      },
      "happenedAt": "2026-05-09T08:59:21.000Z",
      "createdAt": "2026-05-09T08:59:21.000Z",
      "updatedAt": "2026-05-09T08:59:21.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

\---

## Get Google Spreadsheet Sheets

**Method:** `GET`  
**Route:** `googleSheets/getSheets`

Lists sheets/tabs inside a selected Google spreadsheet.

### Query parameters

* `shop: string` (required)
* `spreadsheetId: string` (required)
* standard Shopify HMAC params for verification

### Rules

* org must already have completed Google OAuth
* spreadsheet must already have been explicitly selected by the user in Google Picker on the frontend
* backend reads spreadsheet tabs using authenticated Google token for org

### Success response

```json
{
  "sheets": [
    {
      "id": 0,
      "name": "Locations"
    },
    {
      "id": 123456789,
      "name": "Archive"
    }
  ]
}
```

\---

## Get Google Sheet Headers

**Method:** `GET`  
**Route:** `googleSheets/getHeaders`

Returns header values and sample preview rows for selected spreadsheet tab so frontend can build mapping UI from real sheet columns.

### Query parameters

* `shop: string` (required)
* `spreadsheetId: string` (required)
* `sheetId: number` (required)
* `headerRow: number` (optional, defaults to `1`)
* `dataStartRow: number` (optional, defaults to `headerRow + 1`)
* standard Shopify HMAC params for verification

### Rules

* org must already have completed Google OAuth
* spreadsheet must already have been explicitly selected by the user in Google Picker on the frontend
* backend reads selected tab using authenticated Google token for org
* `headerRow` determines which row becomes mapping source column names
* backend should trim blank trailing columns from header list
* duplicate or blank header cells should be normalized into unique non-empty labels before response
* `sampleRows` should include small preview window from first data rows after `dataStartRow`

### Success response

```json
{
  "spreadsheetId": "1abcDEFghiJKLmnop",
  "sheetId": 0,
  "headerRow": 1,
  "dataStartRow": 2,
  "headers": ["externalId", "Name", "Address", "Latitude", "Longitude"],
  "sampleRows": [
    {
      "rowNumber": 2,
      "values": {
        "externalId": "AKL-001",
        "Name": "Auckland Flagship",
        "Address": "1 Queen Street, Auckland 1010, New Zealand",
        "Latitude": -36.8485,
        "Longitude": 174.7633
      }
    }
  ]
}
```

\---

## Configure Google Sheets Sync

**Method:** `POST`  
**Route:** `googleSheets/configureSync`

Stores spreadsheet selection and column mapping for org, then queues a sync job immediately.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Request body

```json
{
  "spreadsheetId": "1abcDEFghiJKLmnop",
  "spreadsheetName": "Store Locations",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1abcDEFghiJKLmnop/edit",
  "sheetId": 0,
  "sheetName": "Locations",
  "headerRow": 1,
  "dataStartRow": 2,
  "externalIdColumn": "externalId",
  "externalIdFallbackStatus": "ACTIVE",
  "mappings": [
    {
      "kind": "LOCATION_FIELD",
      "sourceColumn": "Name",
      "field": "name"
    },
    {
      "kind": "LOCATION_FIELD",
      "sourceColumn": "Address",
      "field": "formattedAddress"
    },
    {
      "kind": "LOCATION_FIELD",
      "sourceColumn": "Latitude",
      "field": "latitude"
    },
    {
      "kind": "LOCATION_FIELD",
      "sourceColumn": "Longitude",
      "field": "longitude"
    },
    {
      "kind": "CUSTOM_FIELD",
      "sourceColumn": "Opening Hours",
      "key": "opening-hours",
      "label": "Opening Hours",
      "type": "TEXT",
      "showOnListing": true
    },
    {
      "kind": "FILTER",
      "sourceColumn": "Category",
      "key": "category"
    }
  ],
  "options": {
    "deleteMissingRows": true,
    "matchExistingByAddressOrCoordinates": true,
    "resolveCoordinatesFromAddress": true,
    "parseFormattedAddress": true
  }
}
```

### Rules

* spreadsheet metadata in request body should come from the spreadsheet the user explicitly selected in Google Picker
* `externalIdColumn` is required and is used as stable row identity for update/delete behavior
* rows missing an external id are skipped and reported as sync errors
* duplicated external ids are treated as invalid source data:
  * all rows with that duplicated id are skipped for the run
  * existing linked location for that id is not updated or deleted during that run
* at least one mapping is required
* `LOCATION_FIELD` mappings target built-in location fields such as `name`, `formattedAddress`, `city`, `status`, `latitude`, or `longitude`
* `CUSTOM_FIELD` mappings create location `customFields` entries
* `FILTER` mappings create location `filters` entries
* first successful save queues a sync job against current sheet contents
* sync may create, update, and optionally delete locations
* if `deleteMissingRows=true`, any previously linked row absent from current sheet snapshot deletes corresponding location
* if `matchExistingByAddressOrCoordinates=true`, unmatched external ids can attach to existing locations using same import matching rules as bulk import
* net-new synced locations are checked against authenticated org's billing plan location limit after planned deletions are subtracted
* when sync would exceed location limit, no location writes are persisted, sync records an error, and the configured Google Sheets sync error email is sent unless notifications are disabled
* response includes sync summary plus whether queueing succeeded immediately

### Success response

```json
{
  "queued": true,
  "sync": {
    "id": "681111114f9a9b0012345678",
    "status": "ACTIVE",
    "spreadsheetId": "1abcDEFghiJKLmnop",
    "sheetName": "Locations",
    "externalIdColumn": "externalId"
  }
}
```

\---

## Disconnect Google Sheets Sync

**Method:** `POST`  
**Route:** `googleSheets/disconnect`

Disconnects current org Google Sheets sync, clears stored Google token/polling state, and deletes stored row-link snapshots.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Success response

```json
{
  "disconnected": true
}
```

\---

## Unsubscribe Google Sheets Error Emails

**Method:** `GET`  
**Route:** `googleSheets/unsubscribe`

Public unsubscribe link endpoint that disables Google Sheets sync error notification emails for a sync record.

This endpoint does **not** require HMAC verification.

### Query parameters

* `syncId: string` (required)
* `token: string` (required)

### Success response

Plain text response:

```text
Google Sheets sync error emails unsubscribed.
```

\---

## Rebuild Storefront Cache

**Method:** `POST`  
**Route:** `shopify/rebuildStorefrontCache`

Schedules a full org rebuild for authenticated shop. This rebuild refreshes derived public storefront data, including cluster data and storefront snapshot/metafield payloads.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC params for verification

### Rules

* request uses standard authenticated admin flow and Shopify HMAC verification
* rebuild is scheduled asynchronously; endpoint does not wait for full rebuild completion
* only one rebuild can run at a time per org
* if rebuild is already running, endpoint returns success with `scheduled: false`
* if a rebuild completed within last `2` minutes, request is rejected by cooldown protection

### Success response when new rebuild is scheduled

```json
{
  "scheduled": true,
  "status": "scheduled"
}
```

### Success response when rebuild is already running

```json
{
  "scheduled": false,
  "status": "already_running"
}
```

\---

## Billing Webhook

**Method:** `POST`  
**Route:** `billing`

Processes Shopify `APP_SUBSCRIPTIONS_UPDATE` webhook. Verifies webhook HMAC, refreshes active subscription from Shopify, updates org billing fields, and reverts non-legacy orgs to `FREE` when no active paid subscription remains.

### Headers

* `X-Shopify-Shop-Domain: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

\---

## Uninstall Webhook

**Method:** `POST`  
**Route:** `uninstall`

Processes Shopify `APP_UNINSTALLED` webhook. Verifies webhook HMAC, keeps the organisation record as a historical shell, clears Shopify/billing/storefront rebuild state, sets `uninstalledAt`, deletes stale Shopify install/auth state, and hard-deletes org-owned connected data for that org including `locations`, `clusters`, `searches`, `dealerFormSubmissions`, `dealerFormEmailUnsubscribes`, `locationGeocodeJobs`, `googleSheetSyncs`, `googleSheetSyncRows`, `googleSheetSyncOperations`, and `googleSheetAuthStates`.

### Headers

* `X-Shopify-Shop-Domain: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

\---

## GDPR Webhook

**Method:** `POST`  
**Route:** `gdpr`

Processes Shopify GDPR webhooks. Verifies webhook HMAC and emails admin for non-`shop/redact` topics.

### Headers

* `X-Shopify-Topic: string` (required)
* Shopify webhook HMAC headers

### Success response

```json
{}
```

### Success response

Returns the full `OrganisationModel` with `includeCredentials: false`.

Example:

```json
{
  "id": "665f0d3f4f9a9b0099999999",
  "name": "Example Store",
  "contactEmail": "alerts@example.com",
  "shopifyConnectionStatus": "ACTIVE",
  "billingPlanStatus": "ACTIVE",
  "billingPlanHandle": "PRO",
  "billingEnforcementReason": null,
  "billingEnforcementStartedAt": null,
  "overLimitWarningSentAt": null,
  "overLimitReminderSentAt": null,
  "overLimitResolvedAt": null,
  "overLimitAutoTrimmedAt": null
}
```
