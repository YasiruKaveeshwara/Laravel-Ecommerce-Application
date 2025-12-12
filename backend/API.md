# API Reference

Base URL: `${APP_URL}/api` (e.g., `http://127.0.0.1:8000/api`)

Auth: Bearer tokens via Laravel Sanctum. For protected routes include header:

```
Authorization: Bearer <token>
Accept: application/json
```

Errors: JSON with `message` and optionally `{ error: { message, type, details } }`.

See also: [SETUP](./SETUP.md) · [Testing](../docs/Testing.md) · [Architecture](../docs/Architecture.md)

## Auth

### POST /register

Create an account and receive an API token.

Request

```
{
  "first_name": "Demo",
  "last_name": "Customer",
  "email": "demo@example.com",
  "password": "Password#123",
  "password_confirmation": "Password#123"
}
```

Response 201

```
{
  "token": "...",
  "user": { "id": "uuid", "first_name": "Demo", "last_name": "Customer", "email": "demo@example.com", "role": "customer" },
  "redirect_to": "/"
}
```

### POST /login

Obtain a token for an existing user.

Request

```
{ "email": "demo@example.com", "password": "Password#123" }
```

Response 200 — same envelope as `/register`.

### GET /me (auth)

Return the authenticated user.

### PUT /me (auth)

Update profile; password optional.

Request

```
{
  "first_name": "New",
  "last_name": "Name",
  "email": "new@example.com",
  "password": "NewPassword#123",        // optional
  "password_confirmation": "NewPassword#123"
}
```

### DELETE /me (auth)

Delete the current account.

Request

```
{ "password": "CurrentPassword" }
```

### POST /logout (auth)

Revoke the current token.

---

## Products

### GET /products

Public list with filters + pagination.

Query params: `q`, `per_page`, `page`, `min_price`, `max_price`, `category`, `brand`

Response (paginator):

```
{
  "data": [ { "id": "uuid", "name": "...", "brand": "...", "category": "...", "price": 1299.00, "image_url": "..." }, ... ],
  "current_page": 1,
  "per_page": 20,
  "total": 84,
  "last_page": 5
}
```

### GET /products/{id}

Public product detail.

### POST /products/detail

Alternative detail by body `product_id` (useful for client selections).

Request

```
{ "product_id": "uuid" }
```

---

## Orders

### POST /orders (auth)

Create an order. If authenticated, the user is attached; email/name default from user.

Request

```
{
  "first_name": "Demo",
  "last_name": "Customer",
  "email": "demo@example.com",
  "phone": "",
  "address1": "1 Main St",
  "address2": "",
  "city": "NYC",
  "state": "NY",
  "postal_code": "10001",
  "country": "US",
  "subtotal": 1000.00,
  "tax_total": 80.00,
  "shipping_total": 15.00,
  "grand_total": 1095.00,
  "items": [
    { "product_id": "uuid", "quantity": 1, "unit_price": 1000.00 }
  ]
}
```

Response 201

```
{ "id": "uuid", "items": [ ... ], "grand_total": 1095.00, ... }
```

### GET /orders (auth)

Paginated list for the current user. Includes guest orders matching the user email for continuity.

### GET /orders/{id} (auth)

Order detail; allowed for owner or admin.

---

## Users (Admin)

All require `auth:sanctum` + `role:administrator`.

### GET /users

Query params: `q`, `per_page`, `page`, `role` (administrator|customer)

### POST /users

Create a user (admin or customer).

Request

```
{
  "first_name": "Pulse",
  "last_name": "Admin",
  "email": "admin@example.com",
  "password": "Strong#123",
  "role": "administrator"
}
```

### GET /users/{id}

### PUT /users/{id}

### DELETE /users/{id}

---

## Admin Products (Admin)

`auth:sanctum` + `role:administrator`.

### GET /admin/products

Same filters as public + `added_within_days`.

### GET /admin/products/{id}

### POST /admin/products/detail

Body: `{ "product_id": "uuid" }`.

### POST /admin/products

Multipart form required (`isForm` on client). Fields:

-   name, brand, category, description, price, image (file)

### PUT/PATCH /admin/products/{id}

Fields optional; `image` optional file.

### DELETE /admin/products/{id}

---

## Admin Orders (Admin)

### GET /admin/orders

Query params: `q` (name/email), `per_page`, `page`.

### GET /admin/orders/{id}

Same detail as customer endpoint.

---

## Notes

-   Pagination uses Laravel paginator. Some clients normalize both `{ data, meta }` and legacy paginator shapes.
-   CORS: configure `CORS_ALLOWED_ORIGINS` (CSV) or `FRONTEND_URL`.
-   Image URLs: `Product.image_url` returns absolute public URL; proxy route `/storage/{path}` is available.
