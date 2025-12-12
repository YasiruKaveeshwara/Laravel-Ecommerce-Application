# Laravel E‑commerce Application

Pulse Mobile — a full‑stack demo storefront and admin backoffice built with Laravel (API) and Next.js (frontend). It includes authentication with roles, product catalog with image processing and watermarking, cart + checkout flow with order capture, and an admin console for inventory, orders, and users.

This README gives a high‑level overview. See the docs below for deeper guides:

- [Architecture](docs/Architecture.md)
- [Features](docs/Features.md)
- [Security](docs/Security.md)
- [Operations](docs/Operations.md)
- [Testing](docs/Testing.md)
- [Docs Index](docs/README.md)
- [Backend API](backend/API.md)

## Stack

- Backend: Laravel 11, PHP 8.2+, Sanctum, Eloquent, Intervention Image
- Frontend: Next.js (App Router) + TypeScript, TailwindCSS, Zustand, Lucide icons
- Auth: Token-based (Sanctum)
- DB: Any Laravel-supported driver (SQLite/MySQL/Postgres)

## Quick Start

Prereqs: PHP 8.2+, Composer, Node 18+, npm, and a database (SQLite works out of the box). On Windows PowerShell:

1. Backend — install, migrate, seed, and serve

```
cd "backend"
copy .env.example .env
php artisan key:generate
php artisan migrate; php artisan db:seed
php artisan storage:link
php -S 127.0.0.1:8000 -t public
```

2. Frontend — configure base URL, install, run dev

```
cd "../frontend"
echo NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api > .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Testing

Run the backend test suite (uses SQLite in-memory):

```
cd "backend"
php artisan test
```

## Default Accounts

- Admin: master.admin@pulsemobile.com / PulseAdmin#2025
- Customer: demo.customer@pulsemobile.com / DemoCustomer#2025

These are created by `DatabaseSeeder`.

## Repository Layout

- backend/ — Laravel API (routes, controllers, services, models, seeds)
- frontend/ — Next.js app (storefront + admin UI)
- docs/ — Architecture, feature matrix, ops, security, tests

## Feature Highlights

- Role-based access (administrator, customer)
- Product catalog with filters, pagination, and image watermarking
- Admin: inventory CRUD, orders list/detail, users list/detail
- Storefront: cart, checkout, my orders, profile (update/delete)
- Consistent UI actions (edit/delete) and table styles; strict lint rules

## Useful Links

- API Reference: [backend/API.md](backend/API.md)
- Backend setup: [backend/SETUP.md](backend/SETUP.md)
- Frontend: [frontend/README.md](frontend/README.md)
- Operations/SRE: [docs/Operations.md](docs/Operations.md)

## License

For learning/demo use. Review dependencies’ licenses under `vendor/` and `frontend/node_modules/`.
