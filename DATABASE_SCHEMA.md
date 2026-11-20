# Database Schema

MongoDB, accessed through Mongoose. Five collections. See `ER_DIAGRAM.svg` for how they connect — this doc is the field-by-field detail.

All five collections get `createdAt` and `updatedAt` automatically (`timestamps: true` on every schema), so those aren't repeated per-field below.

## users

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, unique, lowercased before saving |
| `password` | String | required, min 6 chars — stored as a bcrypt hash, never plaintext |
| `phone` | String | optional |
| `address` | String | optional |
| `role` | String | enum: `customer`, `owner`, `delivery`, `admin`. Defaults to `customer` |
| `isActive` | Boolean | default `true`. Set to `false` by an admin to block login |

Password hashing happens in a `pre('save')` hook, and only re-runs if the password field was actually changed — so updating a user's name doesn't re-hash an already-hashed password.

## restaurants

| Field | Type | Notes |
|---|---|---|
| `owner` | ObjectId → users | required |
| `name` | String | required |
| `description` | String | optional |
| `cuisine` | String | optional, free text (not an enum) |
| `address` | String | required |
| `image` | String | optional URL, defaults to empty string |
| `isActive` | Boolean | default `true`. Admin-controlled; inactive restaurants are hidden from public browsing |
| `avgRating` | Number | default 0, recalculated whenever a review is added |
| `numReviews` | Number | default 0, same as above |

Text index on `name` + `cuisine` — that's what powers the search bar on the home page.

## menuitems

| Field | Type | Notes |
|---|---|---|
| `restaurant` | ObjectId → restaurants | required |
| `name` | String | required |
| `description` | String | optional |
| `price` | Number | required, min 0 |
| `category` | String | optional free text |
| `image` | String | optional |
| `isAvailable` | Boolean | default `true` |

Text index on `name` + `category`, same idea as restaurants — powers the menu search box on a restaurant's page.

## orders

| Field | Type | Notes |
|---|---|---|
| `customer` | ObjectId → users | required |
| `restaurant` | ObjectId → restaurants | required |
| `deliveryPartner` | ObjectId → users | nullable, set when an owner assigns the order |
| `items` | array of embedded objects | see below |
| `totalAmount` | Number | required, calculated server-side from item prices × quantities — never trusted from the client |
| `deliveryAddress` | String | required |
| `status` | String | enum: `placed → confirmed → preparing → out_for_delivery → delivered`, or `cancelled` |
| `paymentMethod` | String | enum: `cod`, `mock_online` |
| `paymentStatus` | String | enum: `pending`, `paid`, `failed` |

Each entry in `items[]` is: `menuItem` (ObjectId reference), `name`, `price`, `quantity`. The name and price are **copied in at order time**, not read live from the menu item. That's deliberate — if a restaurant changes a dish's price next week, last month's order history shouldn't silently change with it.

## reviews

| Field | Type | Notes |
|---|---|---|
| `customer` | ObjectId → users | required |
| `restaurant` | ObjectId → restaurants | required |
| `order` | ObjectId → orders | required |
| `rating` | Number | required, 1–5 |
| `comment` | String | optional |

Compound unique index on `(customer, order)` — stops a customer from leaving two reviews on the same order. A review can only be submitted once the order's status is `delivered`, which is enforced in the controller, not the schema.

## Why references instead of embedding everywhere

Users, restaurants, menu items, and orders are kept as separate collections linked by ObjectId rather than nested inside each other, because they're each queried and updated independently — a restaurant owner editing a menu item shouldn't require touching every order that ever referenced it. The one deliberate exception is `order.items`, which is embedded on purpose for the price-snapshot reason above.
