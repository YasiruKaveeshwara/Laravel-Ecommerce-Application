# Features

## Storefront

- Browse catalog with images and details
- View product detail
- Cart management and checkout
- Orders list and order detail
- Profile update and account deletion

## Admin

- Product management (list, create, edit, delete)
- Orders management with search
- Customers list (with pagination) and customer detail

## Cross-cutting

- Consistent Delete/Edit actions across UI
- Standardized table/list appearance per inventory reference
- Pagination parity across customers and orders lists
- Route guards for auth and roles
- Centralized API client with typed errors

## Mapping to API

- Products: `GET /api/products`, `GET /api/products/{id}` (public)
- Admin Products: `GET /api/admin/products`, `GET /api/admin/products/{id}`, `POST /api/admin/products`, `PUT/DELETE /api/admin/products/{id}`
- Orders: `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders`
- Admin Orders: `GET /api/admin/orders`, `GET /api/admin/orders/{id}`
- Users (admin): `GET/POST/PUT/DELETE /api/users[...]`
- Auth: `POST /api/register`, `POST /api/login`, `GET /api/me`, `PUT /api/me`, `DELETE /api/me`, `POST /api/logout`

See also: [Architecture](./Architecture.md) · [API Reference](../backend/API.md)
