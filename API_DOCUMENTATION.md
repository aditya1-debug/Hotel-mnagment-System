# API Documentation

Base URL (local): `http://localhost:5000/api`

## Auth

Protected routes expect a JWT in the header:
```
Authorization: Bearer <token>
```
You get the token back in the response body of register/login. It's valid for 7 days.

## Response shape

Every response is JSON with a `success` boolean. On success, the payload is in `data` (list endpoints also include a `pagination` object: `total`, `page`, `pages`). On failure, `message` explains what went wrong, and validation failures include an `errors` array with one `{ field, message }` entry per invalid field.

List endpoints that support pagination accept `?page=1&limit=10` query params (defaults shown).

---

## Auth — `/api/auth`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/register` | none | `name, email, password, phone?, address?, role?` — role must be `customer`/`owner`/`delivery`, anything else (or omitted) defaults to `customer`. Returns the user + token. |
| POST | `/login` | none | `email, password` → user + token |
| GET | `/me` | any logged-in user | returns the current user (no password field) |
| GET | `/delivery-partners` | owner, admin | list of active delivery-partner accounts (name, email, phone only) — used to populate the assignment dropdown on the owner's order page |

## Restaurants — `/api/restaurants`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | none | browse restaurants. Query params: `keyword` (text search on name/cuisine), `cuisine` (exact match), `page`, `limit` |
| GET | `/mine` | owner, admin | restaurants owned by the logged-in user |
| GET | `/:id` | none | single restaurant |
| POST | `/` | owner, admin | `name, address` required; `description, cuisine, image` optional. Creates it under the logged-in owner |
| PUT | `/:id` | owner (own restaurant only), admin | partial update — any field from the schema |
| DELETE | `/:id` | owner (own restaurant only), admin | |

## Menu — `/api/menu`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/restaurant/:restaurantId` | none | menu items for a restaurant. Query params: `keyword`, `category`, `page`, `limit`. Only returns items where `isAvailable` is true |
| POST | `/` | owner (of that restaurant), admin | `restaurantId, name, price` required; `description, category, image` optional |
| PUT | `/:id` | owner (of that item's restaurant), admin | |
| DELETE | `/:id` | owner (of that item's restaurant), admin | |

## Orders — `/api/orders`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | customer | `restaurantId, items: [{menuItemId, quantity}], deliveryAddress, paymentMethod?`. Price and total are computed server-side from the current menu item prices, never taken from the request. `paymentMethod: "mock_online"` marks the order paid immediately (no real gateway call); `"cod"` leaves it pending |
| GET | `/mine` | customer | the logged-in customer's own order history |
| GET | `/assigned` | delivery | orders currently/previously assigned to the logged-in delivery partner |
| PATCH | `/:id/delivery-status` | delivery (must be the assigned partner) | `status`, restricted to `out_for_delivery` or `delivered` only |
| GET | `/restaurant/:restaurantId` | owner, admin | all orders for that restaurant. Query: `status`, `page`, `limit` |
| PATCH | `/:id/status` | owner, admin | `status?, deliveryPartnerId?` — either or both; this is also how a delivery partner gets assigned to an order |
| GET | `/:id` | the customer who placed it, the assigned delivery partner, or any owner/admin | single order, used for the tracking page |

## Reviews — `/api/reviews`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/restaurant/:restaurantId` | none | reviews for a restaurant, paginated |
| POST | `/` | customer | `orderId, rating (1-5), comment?`. Only works if the order belongs to that customer and its status is `delivered`. One review per order (enforced by a unique index) — also triggers a recalculation of the restaurant's `avgRating`/`numReviews` |

## Admin — `/api/admin`

Every route here requires an `admin` account — applied once at the router level, not per-route.

| Method | Path | Notes |
|---|---|---|
| GET | `/stats` | user counts by role, total restaurants, total orders, sum of `totalAmount` across delivered orders |
| GET | `/users` | all users. Query: `role`, `page`, `limit` |
| PATCH | `/users/:id/active` | `isActive: boolean` — activate/deactivate an account. Can't be used on your own account |
| PATCH | `/users/:id/role` | `role` — change a user's role. Can't be used on your own account |
| GET | `/restaurants` | all restaurants including inactive ones, with owner info populated |
| PATCH | `/restaurants/:id/active` | `isActive: boolean` |
| GET | `/orders` | every order on the platform. Query: `status`, `page`, `limit` |

---

## Example — placing an order

Request:
```http
POST /api/orders
Authorization: Bearer <customer token>
Content-Type: application/json

{
  "restaurantId": "6aff3771ec72575195eb4d11",
  "items": [{ "menuItemId": "6aff378bec72575195eb4d12", "quantity": 2 }],
  "deliveryAddress": "12 Market Street",
  "paymentMethod": "mock_online"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "_id": "6aff341be5a2d9cdde9e7895",
    "customer": "6aff3409e5a2d9cdde9e7891",
    "restaurant": "6aff3771ec72575195eb4d11",
    "items": [{ "menuItem": "6aff378bec72575195eb4d12", "name": "Margherita Pizza", "price": 249, "quantity": 2 }],
    "totalAmount": 498,
    "status": "placed",
    "paymentMethod": "mock_online",
    "paymentStatus": "paid",
    "deliveryAddress": "12 Market Street"
  }
}
```

A ready-to-run Postman collection covering every endpoint above is in `postman_collection.json`.
