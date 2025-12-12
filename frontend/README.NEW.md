## Frontend (Next.js)

This is the Pulse Mobile storefront and admin backoffice UI. It consumes the Laravel API and implements authentication, cart/checkout, profile management, and admin tooling for products, orders, and users.

### Setup

```
cd frontend
npm install
echo NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api > .env.local
npm run dev
```

Open http://localhost:3000

### Scripts

- `npm run dev` — start Next.js in dev
- `npm run build && npm start` — production build & serve
- `npm run lint` — ESLint checks (strict: hooks order, no-img-element, typesafety, etc.)

### Environment

- `NEXT_PUBLIC_API_BASE_URL` — required, points to Laravel API (e.g. `http://127.0.0.1:8000/api`)

### Structure (selected)

- `src/app` — routes (App Router)
  - `/` — storefront home (catalog)
  - `/products/view` — product detail (client-selected)
  - `/cart`, `/checkout`, `/orders`, `/profile`
  - `/admin/products`, `/admin/orders`, `/admin/customers` (+ subroutes)
- `src/components` — UI components (buttons, dialogs, table, uploader, etc.)
- `src/lib` — API client, pagination, guards, utils
- `src/store` — Zustand stores (auth, cart)
- `src/types` — API data contracts

### UI & Patterns

- Shared destructive/edit actions: `DeleteButton`, `EditButton`
- Confirmations: `ConfirmDialog`
- Role guard: `useRouteGuard({ requireAuth, requireRole })`
- Pagination normalization: `normalizePaginatedResponse`, `summarizePagination`
- Image handling: Next/Image in previews; server returns absolute URLs

### Notes

- Ensure the backend is running and CORS allows `http://localhost:3000`
- Admin-only routes are guarded; navbar adapts to role
- The app is intentionally lint-clean. Please keep new code compliant
