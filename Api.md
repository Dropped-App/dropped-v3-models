# API

Current HTTP API surface in this repository.

\---

## Auth

**Method:** `GET`  
**Route:** `shopify/auth`

Completes Shopify OAuth callback flow. Verifies callback HMAC and stored state, exchanges the temporary auth code for app credentials, stores the Shopify connection, registers default webhooks, bootstraps the org, and redirects merchant back into the app.

### Query parameters

* `shop: string` (required, must resolve to a valid `*.myshopify.com` shop domain)
* `code: string` (required, temporary Shopify OAuth code)
* `state: string` (required, must match previously stored install state for this shop)
* standard Shopify HMAC query params for verification

### Success response

HTTP `302` redirect to `APP_URL`.

### Notes

* this route does not return JSON on success
* missing or invalid `shop` returns `"Shop is not valid"`
* invalid callback `state` returns `"Provided state or shop could not be verified."`

\---

## Install

**Method:** `GET`  
**Route:** `shopify/install`

Starts Shopify OAuth install flow for a shop. If the shop already has an active connection with the required scopes, returns existing org state instead of generating a fresh OAuth URL.

### Query parameters

* `shop: string` (required, must resolve to a valid `*.myshopify.com` shop domain)
* standard Shopify HMAC query params for verification

### Success response when active install already exists

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "name": "Example Store",
    "shopifyConnectionStatus": "ACTIVE"
  }
}
```

### Success response when install is required

```json
{
  "url": "https://example.myshopify.com/admin/oauth/authorize?client_id=..."
}
```

### Notes

* existing-install response comes from current org state and is only returned when scopes still match configured scopes
* install flow stores a fresh MongoDB-backed `state` token before returning the OAuth URL

\---

## Check Billing

**Method:** `GET`  
**Route:** `shopify/checkBilling`

Checks current active Shopify app subscription, maps it to the internal billing plan, updates org billing fields, and returns updated org when active billing is found.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification
* `charge_id: string` (optional, used to find and reconcile a legacy stored subscription id with the live Shopify subscription id)

### Success response when active subscription found

```json
{
  "org": {
    "id": "665f0d3f4f9a9b0099999999",
    "billingPlanStatus": "ACTIVE",
    "billingPlanHandle": "PRO",
    "billingSubscriptionId": "gid://shopify/AppSubscription/123456789",
    "billingUpdatedAt": "2026-05-31T00:00:00.000Z"
  }
}
```

### Alternate success response

```json
{}
```

### Notes

* `billingPlanStatus` is only `ACTIVE` or `INACTIVE`
* this route no longer returns legacy billing-enforcement or over-limit fields because that enforcement flow has been removed from this backend
* when no active Shopify subscription is found, the route returns an empty object instead of an org payload

\---

## Ping Review

**Method:** `POST`  
**Route:** `shopify/pingReview`

Stores lightweight merchant review metadata on the org record.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "rating": 5,
  "reviewSurface": "shopify_app_store"
}
```

### Request rules

* `rating` must be an integer between `1` and `5`
* `reviewSurface` max length is `64`
* request body max size is `8 KB`

### Success response

```json
{}
```

### Notes

* successful requests set `reviewed: true` on the org
* this route persists `rating` and `reviewSurface` only when present in the validated body

\---

## Ping Web Vitals

**Method:** `POST`  
**Route:** `shopify/pingWebVitals`

Stores raw storefront web-vitals payloads for a Shopify shop.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

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

### Request rules

* `path` max length is `500`
* `vitals` is an arbitrary object, but it may contain at most `20` top-level keys
* request body max size is `8 KB`

### Success response

```json
{}
```

### Notes

* this route stores the payload in the `vitals` collection with `store`, `path`, `vitals`, and `createdAt`
* vitals value types are intentionally flexible and are not narrowed beyond JSON parsing plus top-level key count

\---

## Ping Alert

**Method:** `POST`  
**Route:** `shopify/pingAlert`

Stores raw storefront alert payloads and emails the configured admin inbox unless the payload is marked silent.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Any JSON object is accepted. The only explicitly modeled field is:

```json
{
  "silent": false
}
```

Common payload shape:

```json
{
  "type": "client_error",
  "message": "Example issue",
  "silent": false
}
```

### Request rules

* request body max size is `32 KB`
* `silent` is optional and may be `true`, `false`, or `null`
* additional fields are accepted and stored as-is

### Success response

```json
{}
```

### Notes

* in `dev`, this route returns success immediately and skips persistence/email
* outside `dev`, successful requests are stored in the `alerts` collection
* when `silent` is falsy, the route also emails `ADMIN_EMAIL`

\---

## Update Org

**Method:** `POST`  
**Route:** `shopify/updateOrg`

Updates authenticated organisation fields and settings used by this backend.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "contactEmail": "ops@example.com",
  "onboardingCompletions": {
    "theme-install": {
      "completedAt": "2026-05-30T00:00:00.000Z",
      "install": {
        "pageHandle": "stockists",
        "template": "page.stockists",
        "themeId": "123456789"
      }
    }
  },
  "settings": {
    "productSharing": {
      "senderDefaults": {
        "shareActiveProductsOnly": true
      },
      "receiverDefaults": {
        "defaultImportProductStatus": "DRAFT",
        "defaultUpdateProductStatus": "KEEP_EXISTING",
        "taxEnabledByDefault": true
      },
      "pricing": {
        "receiverPriceModifier": {
          "adjustmentType": "PERCENTAGE",
          "amount": 10
        },
        "priceSourceRule": "REGULAR",
        "roundingRule": {
          "mode": "ROUND_TO_NEAREST",
          "increment": 0.05
        }
      },
      "matching": {
        "matchBySku": true,
        "matchByHandle": false,
        "matchByTitle": false
      },
      "metafieldPromptSuppressions": [
        {
          "namespace": "custom",
          "key": "material",
          "type": "single_line_text_field"
        }
      ]
    }
  }
}
```

### Request rules

* empty request body is allowed and is treated as `{}`
* `contactEmail` is optional, but when provided it must contain both `@` and `.`
* `onboardingCompletions` may contain at most `50` keys
* each onboarding completion key max length is `64`
* `settings` currently supports only the `productSharing` group

### Success response

Returns the full current `OrganisationModel`.

Representative response excerpt:

```json
{
  "id": "665f0d3f4f9a9b0099999999",
  "contactEmail": "ops@example.com",
  "shopifyConnectionStatus": "ACTIVE",
  "settings": {
    "productSharing": {
      "senderDefaults": {
        "shareActiveProductsOnly": true
      },
      "receiverDefaults": {
        "defaultImportProductStatus": "DRAFT",
        "defaultUpdateProductStatus": "KEEP_EXISTING",
        "taxEnabledByDefault": true
      },
      "pricing": {
        "receiverPriceModifier": {
          "adjustmentType": "PERCENTAGE",
          "amount": 10
        },
        "priceSourceRule": "REGULAR",
        "roundingRule": {
          "mode": "ROUND_TO_NEAREST",
          "increment": 0.05
        }
      },
      "matching": {
        "matchBySku": true,
        "matchByHandle": false,
        "matchByTitle": false
      },
      "metafieldPromptSuppressions": [
        {
          "namespace": "custom",
          "key": "material",
          "type": "single_line_text_field"
        }
      ]
    }
  }
}
```

### Notes

* `settings` is merged with current org settings before persistence
* onboarding completions are merged key-by-key unless caller sends an empty object, which resets the stored map to an empty object

\---

## Get Product Sharing Sender Settings

**Method:** `GET`  
**Route:** `product-sharing/settings/sender`

Returns resolved product-sharing settings for the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

```json
{
  "productSharing": {
    "senderDefaults": {
      "shareActiveProductsOnly": true
    },
    "receiverDefaults": {
      "defaultImportProductStatus": "DRAFT",
      "defaultUpdateProductStatus": "KEEP_EXISTING",
      "taxEnabledByDefault": true
    },
    "pricing": {
      "receiverPriceModifier": null,
      "priceSourceRule": "REGULAR",
      "roundingRule": null
    },
    "matching": {
      "matchBySku": false,
      "matchByHandle": false,
      "matchByTitle": false
    },
    "metafieldPromptSuppressions": []
  }
}
```

### Notes

* sender and receiver settings routes both return the same resolved `productSharing` object
* defaults are filled in server-side via `resolveSettings`

\---

## Update Product Sharing Sender Settings

**Method:** `POST`  
**Route:** `product-sharing/settings/sender`

Replaces the org-scoped `settings.productSharing` object, then schedules downstream snapshot and metafield-definition refresh work.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "productSharing": {
    "senderDefaults": {
      "shareActiveProductsOnly": true
    },
    "receiverDefaults": {
      "defaultImportProductStatus": "DRAFT",
      "defaultUpdateProductStatus": "KEEP_EXISTING",
      "taxEnabledByDefault": true
    },
    "pricing": {
      "receiverPriceModifier": {
        "adjustmentType": "PERCENTAGE",
        "amount": 10
      },
      "priceSourceRule": "REGULAR",
      "roundingRule": {
        "mode": "ROUND_TO_NEAREST",
        "increment": 0.05
      }
    },
    "matching": {
      "matchBySku": true,
      "matchByHandle": false,
      "matchByTitle": false
    },
    "metafieldPromptSuppressions": [
      {
        "namespace": "custom",
        "key": "material",
        "type": "single_line_text_field"
      }
    ]
  }
}
```

### Success response

```json
{
  "productSharing": {
    "senderDefaults": {
      "shareActiveProductsOnly": true
    },
    "receiverDefaults": {
      "defaultImportProductStatus": "DRAFT",
      "defaultUpdateProductStatus": "KEEP_EXISTING",
      "taxEnabledByDefault": true
    },
    "pricing": {
      "receiverPriceModifier": {
        "adjustmentType": "PERCENTAGE",
        "amount": 10
      },
      "priceSourceRule": "REGULAR",
      "roundingRule": {
        "mode": "ROUND_TO_NEAREST",
        "increment": 0.05
      }
    },
    "matching": {
      "matchBySku": true,
      "matchByHandle": false,
      "matchByTitle": false
    },
    "metafieldPromptSuppressions": [
      {
        "namespace": "custom",
        "key": "material",
        "type": "single_line_text_field"
      }
    ]
  }
}
```

### Notes

* request body must contain a top-level `productSharing` object
* receiver settings route uses the same request and response shape

\---

## Get Product Sharing Receiver Settings

**Method:** `GET`  
**Route:** `product-sharing/settings/receiver`

Returns resolved product-sharing settings for the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

Response shape is identical to `GET product-sharing/settings/sender`.

\---

## Update Product Sharing Receiver Settings

**Method:** `POST`  
**Route:** `product-sharing/settings/receiver`

Replaces the org-scoped `settings.productSharing` object, then schedules downstream snapshot and metafield-definition refresh work.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Request shape is identical to `POST product-sharing/settings/sender`.

### Success response

Response shape is identical to `POST product-sharing/settings/sender`.

\---

## Reroll Product Sharing Store Key

**Method:** `POST`  
**Route:** `product-sharing/store-key/reroll`

Generates and stores a fresh org-level product-sharing store key.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

No request body is required.

### Success response

```json
{
  "productSharingStoreKey": "store_ABC123DEF456",
  "updatedAt": "2026-05-31T00:00:00.000Z"
}
```

### Notes

* this route is rate-limited and returns HTTP `429` with `"Please try again later."` when exceeded

\---

## Refresh Product Sharing Sender Snapshots

**Method:** `POST`  
**Route:** `product-sharing/refresh`

Marks the authenticated org for product snapshot and metafield-definition refresh work.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Empty object or omitted body is accepted.

```json
{}
```

### Success response

```json
{
  "scheduled": true
}
```

### Notes

* this route accepts passthrough JSON but does not read any request fields
* it exists to schedule background refresh work, not to return refreshed data inline

\---

## Get Product Sharing Groups

**Method:** `GET`  
**Route:** `product-sharing/groups`

Returns all product-sharing groups owned by the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

```json
{
  "groups": [
    {
      "id": "681111114f9a9b0012345678",
      "org": "665f0d3f4f9a9b0099999999",
      "name": "Spring 2026",
      "key": "group_ABC123DEF456",
      "includeRules": {
        "productIds": ["gid://shopify/Product/1001"],
        "collectionIds": ["gid://shopify/Collection/2001"]
      },
      "excludeRules": {
        "productIds": [],
        "collectionIds": []
      },
      "priceModifier": null,
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z"
    }
  ]
}
```

\---

## Create Product Sharing Group

**Method:** `POST`  
**Route:** `product-sharing/groups/create`

Creates one product-sharing group for the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "name": "Spring 2026",
  "includeProductIds": ["gid://shopify/Product/1001"],
  "includeCollectionIds": ["gid://shopify/Collection/2001"],
  "excludeProductIds": [],
  "excludeCollectionIds": [],
  "priceModifier": {
    "adjustmentType": "PERCENTAGE",
    "amount": 10
  }
}
```

### Request rules

* `name` is required and max length is `120`
* include/exclude product and collection arrays are optional and max `500` each

### Success response

```json
{
  "group": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "name": "Spring 2026",
    "key": "group_ABC123DEF456",
    "includeRules": {
      "productIds": ["gid://shopify/Product/1001"],
      "collectionIds": ["gid://shopify/Collection/2001"]
    },
    "excludeRules": {
      "productIds": [],
      "collectionIds": []
    },
    "priceModifier": {
      "adjustmentType": "PERCENTAGE",
      "amount": 10
    },
    "createdAt": "2026-05-30T00:00:00.000Z",
    "updatedAt": "2026-05-30T00:00:00.000Z"
  }
}
```

\---

## Get Product Sharing Group

**Method:** `GET`  
**Route:** `product-sharing/groups/{id}`

Returns one product-sharing group plus connected receivers and paginated preview products for that group.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification
* `vendor: string` (optional, max `120`)
* `productType: string` (optional, max `120`)
* `tag: string` (optional, max `120`)
* `status: string` (optional, source product status filter, max `120`)
* `collectionId: string` (optional, max `250`)
* `search: string` (optional, max `250`)
* `sort: "title" | "vendor" | "status" | "sourceUpdatedAt" | "adjustedPrice"` (optional)
* `direction: "asc" | "desc"` (optional)
* `page: number` (optional, min `1`)
* `pageSize: number` (optional, min `1`, max `50`)

### Path parameters

* `id: string` (required, must be a valid ObjectId)

### Success response

```json
{
  "group": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "name": "Spring 2026",
    "key": "group_ABC123DEF456",
    "includeRules": {
      "productIds": ["gid://shopify/Product/1001"],
      "collectionIds": ["gid://shopify/Collection/2001"]
    },
    "excludeRules": {
      "productIds": [],
      "collectionIds": []
    },
    "priceModifier": null,
    "createdAt": "2026-05-30T00:00:00.000Z",
    "updatedAt": "2026-05-30T00:00:00.000Z"
  },
  "connectedReceivers": [
    {
      "id": "681111114f9a9b0012345690",
      "receiverOrgId": "681111114f9a9b0012345688",
      "receiverName": "Receiver Store",
      "status": "ACTIVE",
      "source": "GROUP_KEY",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z",
      "removedAt": null
    }
  ],
  "page": 1,
  "pageSize": 25,
  "totalProducts": 1,
  "products": [
    {
      "senderProductId": "gid://shopify/Product/1001",
      "title": "Widget",
      "vendor": "Acme",
      "productType": "Accessory",
      "sourceStatus": "ACTIVE",
      "collectionIds": ["gid://shopify/Collection/2001"],
      "tags": ["spring"],
      "adjustedPrice": 22.5,
      "sourceUpdatedAt": "2026-05-30T00:00:00.000Z",
      "checksum": "abc123",
      "availableFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"]
    }
  ]
}
```

\---

## Update Product Sharing Group

**Method:** `POST`  
**Route:** `product-sharing/groups/update/{id}`

Updates one existing product-sharing group owned by the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Path parameters

* `id: string` (required, must be a valid ObjectId)

### Request body

All fields are optional, but at least one field must be present.

```json
{
  "name": "Spring 2026 Updated",
  "includeProductIds": ["gid://shopify/Product/1001"],
  "includeCollectionIds": ["gid://shopify/Collection/2001"],
  "excludeProductIds": ["gid://shopify/Product/1002"],
  "excludeCollectionIds": [],
  "priceModifier": {
    "adjustmentType": "FIXED_AMOUNT",
    "amount": 5
  }
}
```

### Success response

```json
{
  "group": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "name": "Spring 2026 Updated",
    "key": "group_ABC123DEF456",
    "includeRules": {
      "productIds": ["gid://shopify/Product/1001"],
      "collectionIds": ["gid://shopify/Collection/2001"]
    },
    "excludeRules": {
      "productIds": ["gid://shopify/Product/1002"],
      "collectionIds": []
    },
    "priceModifier": {
      "adjustmentType": "FIXED_AMOUNT",
      "amount": 5
    },
    "createdAt": "2026-05-30T00:00:00.000Z",
    "updatedAt": "2026-05-31T00:00:00.000Z"
  }
}
```

\---

## Delete Product Sharing Group

**Method:** `POST`  
**Route:** `product-sharing/groups/delete/{id}`

Deletes one product-sharing group owned by the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Path parameters

* `id: string` (required, must be a valid ObjectId)

### Success response

```json
{
  "deleted": true,
  "id": "681111114f9a9b0012345678"
}
```

\---

## Reroll Product Sharing Group Key

**Method:** `POST`  
**Route:** `product-sharing/groups/{id}/reroll-key`

Generates and stores a fresh key for one group owned by the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Path parameters

* `id: string` (required, must be a valid ObjectId)

### Success response

```json
{
  "group": {
    "id": "681111114f9a9b0012345678",
    "org": "665f0d3f4f9a9b0099999999",
    "name": "Spring 2026",
    "key": "group_XYZ987LMN654",
    "includeRules": {
      "productIds": ["gid://shopify/Product/1001"],
      "collectionIds": ["gid://shopify/Collection/2001"]
    },
    "excludeRules": {
      "productIds": [],
      "collectionIds": []
    },
    "priceModifier": null,
    "createdAt": "2026-05-30T00:00:00.000Z",
    "updatedAt": "2026-05-31T00:00:00.000Z"
  }
}
```

### Notes

* this route is rate-limited and returns HTTP `429` with `"Please try again later."` when exceeded

\---

## Join Product Sharing Group By Key

**Method:** `POST`  
**Route:** `product-sharing/connections/join-by-group-key`

Creates or reactivates a receiver-side connection by redeeming a sender group key.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "groupKey": "group_ABC123DEF456"
}
```

### Success response

```json
{
  "connectionId": "681111114f9a9b0012345690",
  "connections": [
    {
      "id": "681111114f9a9b0012345690",
      "senderOrg": "681111114f9a9b0012345670",
      "receiverOrg": "681111114f9a9b0012345688",
      "group": "681111114f9a9b0012345678",
      "status": "ACTIVE",
      "source": "GROUP_KEY",
      "senderName": "Sender Store",
      "receiverName": "Receiver Store",
      "groupName": "Spring 2026",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z",
      "removedAt": null
    }
  ]
}
```

### Notes

* this route is rate-limited and returns HTTP `429` with `"Please try again later."` when exceeded
* invalid group keys return `"Group key is not valid"`
* blocked senders return `"Sender is blocked"`

\---

## Add Product Sharing Receiver By Store Key

**Method:** `POST`  
**Route:** `product-sharing/connections/add-by-store-key`

Creates or reactivates a sender-side connection by using another org's store key against one of the caller's groups.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "groupId": "681111114f9a9b0012345678",
  "storeKey": "store_ABC123DEF456"
}
```

### Success response

```json
{
  "connections": [
    {
      "id": "681111114f9a9b0012345690",
      "senderOrg": "665f0d3f4f9a9b0099999999",
      "receiverOrg": "681111114f9a9b0012345688",
      "group": "681111114f9a9b0012345678",
      "status": "ACTIVE",
      "source": "STORE_KEY",
      "senderName": "Sender Store",
      "receiverName": "Receiver Store",
      "groupName": "Spring 2026",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z",
      "removedAt": null
    }
  ]
}
```

### Notes

* this route is rate-limited and returns HTTP `429` with `"Please try again later."` when exceeded
* `groupId` must be a valid ObjectId and must belong to the caller
* invalid store keys return `"Store key is not valid"`

\---

## Add Existing Product Sharing Receiver To Group

**Method:** `POST`  
**Route:** `product-sharing/connections/add-existing-receiver`

Adds an already-connected receiver org to another sender-owned group.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "groupId": "681111114f9a9b0012345678",
  "receiverOrgId": "681111114f9a9b0012345688"
}
```

### Success response

```json
{
  "connections": [
    {
      "id": "681111114f9a9b0012345690",
      "senderOrg": "665f0d3f4f9a9b0099999999",
      "receiverOrg": "681111114f9a9b0012345688",
      "group": "681111114f9a9b0012345678",
      "status": "ACTIVE",
      "source": "EXISTING_RECEIVER",
      "senderName": "Sender Store",
      "receiverName": "Receiver Store",
      "groupName": "Spring 2026",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-31T00:00:00.000Z",
      "removedAt": null
    }
  ]
}
```

### Notes

* both `groupId` and `receiverOrgId` must be valid ObjectIds
* if receiver is not already connected to caller by some existing connection, route returns `"Receiver is not already connected"`

\---

## Remove Product Sharing Connection

**Method:** `POST`  
**Route:** `product-sharing/connections/remove`

Removes one product-sharing connection accessible to the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "connectionId": "681111114f9a9b0012345690"
}
```

### Success response

```json
{
  "removed": true,
  "status": "REMOVED_BY_SENDER"
}
```

### Notes

* `status` is one of the non-active connection statuses and reflects who removed or blocked access
* inaccessible connections return `"Connection not accessible"`

\---

## Block Product Sharing Sender

**Method:** `POST`  
**Route:** `product-sharing/connections/block-sender`

Blocks a sender org for the authenticated receiver org and returns the receiver connection list.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "senderOrgId": "681111114f9a9b0012345670"
}
```

### Success response

```json
{
  "blocked": true,
  "connections": [
    {
      "id": "681111114f9a9b0012345690",
      "senderOrg": "681111114f9a9b0012345670",
      "receiverOrg": "665f0d3f4f9a9b0099999999",
      "group": "681111114f9a9b0012345678",
      "status": "BLOCKED",
      "source": "GROUP_KEY",
      "senderName": "Sender Store",
      "receiverName": "Receiver Store",
      "groupName": "Spring 2026",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-31T00:00:00.000Z",
      "removedAt": "2026-05-31T00:00:00.000Z"
    }
  ]
}
```

\---

## Get Product Sharing Sender Connections

**Method:** `GET`  
**Route:** `product-sharing/connections/sender`

Returns sender-side connections for the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

```json
{
  "connections": [
    {
      "id": "681111114f9a9b0012345690",
      "senderOrg": "665f0d3f4f9a9b0099999999",
      "receiverOrg": "681111114f9a9b0012345688",
      "group": "681111114f9a9b0012345678",
      "status": "ACTIVE",
      "source": "STORE_KEY",
      "senderName": "Sender Store",
      "receiverName": "Receiver Store",
      "groupName": "Spring 2026",
      "createdAt": "2026-05-30T00:00:00.000Z",
      "updatedAt": "2026-05-30T00:00:00.000Z",
      "removedAt": null
    }
  ]
}
```

\---

## Get Product Sharing Receiver Connections

**Method:** `GET`  
**Route:** `product-sharing/connections/receiver`

Returns receiver-side connections for the authenticated org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

Response shape is identical to `GET product-sharing/connections/sender`.

\---

## Preview Product Sharing Sync

**Method:** `POST`  
**Route:** `product-sharing/preview`

Builds a full product-sharing preview for the authenticated receiver org without creating jobs.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "operation": "IMPORT",
  "preferExistingMatch": true,
  "selectedFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
  "statusOverride": "DEFAULT",
  "taxEnabledOverride": null,
  "groupId": "681111114f9a9b0012345678",
  "senderOrgId": null,
  "vendor": null,
  "productType": null,
  "tag": null,
  "status": null,
  "updatedSinceLastImport": false,
  "collectionId": null,
  "sort": "adjustedPrice",
  "direction": "desc",
  "senderProductIds": null,
  "receiverProductOverrides": {
    "gid://shopify/Product/1001": "gid://shopify/Product/9001"
  },
  "excludedVariantIdsByProduct": {
    "gid://shopify/Product/1001": ["gid://shopify/ProductVariant/3002"]
  },
  "excludedOptionValuesByProduct": {
    "gid://shopify/Product/1001": ["Color:Blue"]
  },
  "selectAll": true,
  "search": "widget"
}
```

### Request rules

* `operation` is required and must be `IMPORT` or `UPDATE`
* request must include either `selectAll: true` or a non-empty `senderProductIds` array
* `selectedFields` max length is `12`
* explicit `senderProductIds` max length is `200`
* per-product excluded variant and option arrays max length is `250`

### Success response

```json
{
  "totalMatchedResults": 2,
  "totalSelected": 2,
  "capApplied": false,
  "blockers": [],
  "summary": {
    "createCount": 1,
    "updateCount": 1,
    "blockedCount": 0
  },
  "products": [
    {
      "senderOrgId": "681111114f9a9b0012345670",
      "senderName": "Sender Store",
      "senderProductId": "gid://shopify/Product/1001",
      "title": "Widget",
      "vendor": "Acme",
      "productType": "Accessory",
      "sourceStatus": "ACTIVE",
      "status": "UPDATE_AVAILABLE",
      "adjustedPrice": 22.5,
      "sourceUpdatedAt": "2026-05-30T00:00:00.000Z",
      "importedAt": "2026-05-29T00:00:00.000Z",
      "selectedGroupId": "681111114f9a9b0012345678",
      "selectedGroupName": "Spring 2026",
      "groupIds": ["681111114f9a9b0012345678"],
      "groupNames": ["Spring 2026"],
      "receiverProductId": "gid://shopify/Product/9001",
      "action": "UPDATE",
      "alreadyQueued": false,
      "blockedReason": null,
      "linkageConflict": null,
      "ambiguousMatch": false,
      "matchedExistingProducts": [
        {
          "id": "gid://shopify/Product/9001",
          "title": "Widget Existing"
        }
      ],
      "willCreate": false,
      "willUpdate": true,
      "availableFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
      "selectedFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
      "newFields": [],
      "overrideFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
      "availableVariants": [
        {
          "id": "gid://shopify/ProductVariant/3001",
          "title": "Black",
          "sku": "WIDGET-BLACK",
          "selected": true,
          "selectedOptions": [
            {
              "name": "Color",
              "value": "Black"
            }
          ]
        }
      ],
      "availableOptions": [
        {
          "name": "Color",
          "values": [
            {
              "value": "Black",
              "selected": true
            }
          ]
        }
      ],
      "missingMetafieldDefinitionDetails": [
        {
          "ownerType": "PRODUCT",
          "namespace": "custom",
          "key": "material",
          "type": "single_line_text_field"
        }
      ],
      "missingMetafieldDefinitions": true,
      "missingMetafieldDefinitionCount": 1,
      "zeroPriceWarning": false,
      "taxEnabled": true,
      "statusOverride": "DRAFT"
    }
  ],
  "sample": []
}
```

### Notes

* `blockers` contains preview rows that prevent sync job creation
* `blockedReason` can be `ACCESS_REMOVED`, `ALREADY_QUEUED`, `AMBIGUOUS_MATCH`, or `LINKAGE_CONFLICT`
* preview never creates jobs; it only computes the selection and action plan

\---

## Create Product Sharing Sync Jobs

**Method:** `POST`  
**Route:** `product-sharing/sync`

Builds the same preview as `POST product-sharing/preview`, blocks when unresolved blockers exist, otherwise creates durable sync jobs and queues them for execution.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Same shape as preview, plus `createMissingMetafieldDefinitions`:

```json
{
  "operation": "IMPORT",
  "preferExistingMatch": true,
  "createMissingMetafieldDefinitions": true,
  "selectedFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
  "statusOverride": "DEFAULT",
  "taxEnabledOverride": null,
  "groupId": "681111114f9a9b0012345678",
  "senderProductIds": null,
  "selectAll": true,
  "search": "widget"
}
```

### Success response

```json
{
  "createdJobCount": 1,
  "selectedProductCount": 2,
  "summary": {
    "createCount": 1,
    "updateCount": 1,
    "blockedCount": 0
  },
  "jobs": [
    {
      "id": "681111114f9a9b0012345701",
      "senderOrg": "681111114f9a9b0012345670",
      "receiverOrg": "681111114f9a9b0012345688",
      "operation": "IMPORT",
      "status": "PENDING",
      "itemCount": 2,
      "requestedAt": "2026-05-30T00:00:00.000Z"
    }
  ]
}
```

### Conflict response

When blockers exist, route returns HTTP `409` with the same full preview payload returned by `POST product-sharing/preview`.

### Notes

* jobs are chunked into groups of at most `25` items
* `createMissingMetafieldDefinitions` defaults to `false` when omitted

\---

## Get Product Sharing Sync Status

**Method:** `GET`  
**Route:** `product-sharing/sync/status`

Returns aggregate counts for active and failed sync jobs visible to the authenticated receiver org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Success response

```json
{
  "active": {
    "jobCount": 2,
    "itemCount": 31,
    "importCount": 25,
    "updateCount": 6
  },
  "failed": {
    "jobCount": 1,
    "itemCount": 4,
    "importCount": 0,
    "updateCount": 4
  }
}
```

\---

## Get Product Sharing Products

**Method:** `GET`  
**Route:** `product-sharing/products`

Returns paginated accessible sender products for the authenticated receiver org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification
* `groupId: string` (optional)
* `senderOrgId: string` (optional)
* `vendor: string` (optional, max `120`)
* `productType: string` (optional, max `120`)
* `tag: string` (optional, max `120`)
* `status: "NOT_IMPORTED" | "IMPORTED" | "UPDATE_AVAILABLE" | "ACCESS_REMOVED"` (optional)
* `updatedSinceLastImport: boolean` (optional)
* `collectionId: string` (optional, max `250`)
* `search: string` (optional, max `250`)
* `sort: "group" | "title" | "vendor" | "status" | "sourceUpdatedAt" | "importedAt" | "adjustedPrice"` (optional)
* `direction: "asc" | "desc"` (optional)
* `page: number` (optional, min `1`, default `1`)
* `pageSize: number` (optional, min `1`, max `50`, default `25`)

### Success response

```json
{
  "page": 1,
  "pageSize": 25,
  "total": 1,
  "items": [
    {
      "senderOrgId": "681111114f9a9b0012345670",
      "senderName": "Sender Store",
      "senderProductId": "gid://shopify/Product/1001",
      "title": "Widget",
      "vendor": "Acme",
      "productType": "Accessory",
      "sourceStatus": "ACTIVE",
      "status": "UPDATE_AVAILABLE",
      "tags": ["spring"],
      "collectionIds": ["gid://shopify/Collection/2001"],
      "checksum": "abc123",
      "sourceUpdatedAt": "2026-05-30T00:00:00.000Z",
      "importedAt": "2026-05-29T00:00:00.000Z",
      "adjustedPrice": 22.5,
      "groupIds": ["681111114f9a9b0012345678"],
      "groupNames": ["Spring 2026"],
      "selectedGroupId": "681111114f9a9b0012345678",
      "selectedGroupName": "Spring 2026",
      "receiverProductId": "gid://shopify/Product/9001"
    }
  ]
}
```

\---

## Retry Failed Product Sharing Sync Jobs

**Method:** `POST`  
**Route:** `product-sharing/sync/retry-failed`

Retries failed sync jobs for the authenticated receiver org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Empty object retries all failed jobs. Optional targeted retry:

```json
{
  "jobIds": ["681111114f9a9b0012345701", "681111114f9a9b0012345702"]
}
```

### Success response

```json
{
  "retriedJobCount": 2
}
```

\---

## Dismiss Failed Product Sharing Sync Jobs

**Method:** `POST`  
**Route:** `product-sharing/sync/dismiss-failed`

Dismisses failed sync jobs for the authenticated receiver org by marking them cancelled.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

Empty object dismisses all failed jobs. Optional targeted dismiss:

```json
{
  "jobIds": ["681111114f9a9b0012345701", "681111114f9a9b0012345702"]
}
```

### Success response

```json
{
  "modifiedCount": 2,
  "cancelledAt": "2026-05-30T00:00:00.000Z"
}
```

\---

## Get Product Sharing History

**Method:** `GET`  
**Route:** `product-sharing/history`

Returns paginated immutable product-sharing history rows for sender or receiver views.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification
* `view: "receiver" | "sender"` (optional)
* `groupId: string` (optional)
* `senderOrgId: string` (optional)
* `receiverOrgId: string` (optional)
* `status: "SUCCEEDED" | "FAILED" | "SKIPPED"` (optional)
* `productId: string` (optional)
* `from: string` (optional, ISO date string)
* `to: string` (optional, ISO date string)
* `page: number` (optional, min `1`)
* `pageSize: number` (optional, min `1`, max `50`)

### Success response

```json
{
  "page": 1,
  "pageSize": 25,
  "total": 1,
  "items": [
    {
      "id": "681111114f9a9b0012345801",
      "senderOrgId": "681111114f9a9b0012345670",
      "receiverOrgId": "681111114f9a9b0012345688",
      "groupId": "681111114f9a9b0012345678",
      "senderProductId": "gid://shopify/Product/1001",
      "receiverProductId": "gid://shopify/Product/9001",
      "senderChecksum": "abc123",
      "importedFields": ["title", "descriptionHtml", "variants", "pricing", "compareAtPricing"],
      "variantDetails": [
        {
          "senderVariantId": "gid://shopify/ProductVariant/3001",
          "receiverVariantId": "gid://shopify/ProductVariant/8001",
          "sku": "WIDGET-BLACK"
        }
      ],
      "status": "FAILED",
      "happenedAt": "2026-05-30T00:00:00.000Z"
    }
  ]
}
```

\---

## Invite Product Sharing Group

**Method:** `POST`  
**Route:** `product-sharing/invite/group`

Sends a group-key email invite for one sender-owned group.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "groupId": "681111114f9a9b0012345678",
  "email": "receiver@example.com"
}
```

### Success response

```json
{
  "sent": true
}
```

### Notes

* route is rate-limited and returns HTTP `429` with `"Please try again later."` when either org-wide or recipient-specific invite limits are exceeded
* missing group returns `"Product sharing group not found"`
* send failures return `"Unable to send invite email"`

\---

## Invite Product Sharing Store

**Method:** `POST`  
**Route:** `product-sharing/invite/store`

Sends an org store-key email invite for the authenticated sender org.

### Query parameters

* `shop: string` (required)
* standard Shopify HMAC query params for verification

### Request body

```json
{
  "email": "receiver@example.com"
}
```

### Success response

```json
{
  "sent": true
}
```

### Notes

* route is rate-limited and returns HTTP `429` with `"Please try again later."` when either org-wide or recipient-specific invite limits are exceeded
* if caller has no `productSharingStoreKey` configured, route returns `"Store key is not configured"`
* send failures return `"Unable to send invite email"`

\---

## Billing Webhook

**Method:** `POST`  
**Route:** `billing`

Processes Shopify billing webhook deliveries, re-fetches the current active subscription from Shopify, and reconciles org billing fields.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

### Notes

* webhook authenticity is verified using Shopify webhook headers, not query-string HMAC params
* when no active matching plan is found, org is downgraded to `FREE` and `billingPlanStatus` becomes `INACTIVE`

\---

## Uninstall Webhook

**Method:** `POST`  
**Route:** `uninstall`

Receives Shopify app uninstall webhooks and queues uninstall processing.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## GDPR Webhook

**Method:** `POST`  
**Route:** `gdpr`

Receives Shopify GDPR webhook deliveries.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Product Create Webhook

**Method:** `POST`  
**Route:** `products/create`

Receives Shopify product-create webhook deliveries and marks product-sharing snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Product Update Webhook

**Method:** `POST`  
**Route:** `products/update`

Receives Shopify product-update webhook deliveries and marks product-sharing snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Product Delete Webhook

**Method:** `POST`  
**Route:** `products/delete`

Receives Shopify product-delete webhook deliveries and marks product-sharing snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Metafield Definitions Create Webhook

**Method:** `POST`  
**Route:** `metafield-definitions/create`

Receives Shopify metafield-definition create webhook deliveries and marks receiver-definition snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Metafield Definitions Update Webhook

**Method:** `POST`  
**Route:** `metafield-definitions/update`

Receives Shopify metafield-definition update webhook deliveries and marks receiver-definition snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```

\---

## Metafield Definitions Delete Webhook

**Method:** `POST`  
**Route:** `metafield-definitions/delete`

Receives Shopify metafield-definition delete webhook deliveries and marks receiver-definition snapshots dirty when relevant.

### Request body

Raw Shopify webhook JSON payload.

### Success response

```json
{}
```
