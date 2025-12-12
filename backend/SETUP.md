# Backend Setup (Laravel)

## Requirements

-   PHP 8.2+
-   Composer
-   Database (SQLite, MySQL, or Postgres)
-   GD/Image libraries (for Intervention Image)

## Install

```
cd backend
copy .env.example .env
composer install
php artisan key:generate
```

## Database & Storage

```
php artisan migrate; php artisan db:seed
php artisan storage:link
```

-   Seeds create:
    -   Admin: `master.admin@pulsemobile.com` / `PulseAdmin#2025`
    -   Customer: `demo.customer@pulsemobile.com` / `DemoCustomer#2025`
    -   Products: large catalog with generated images and baked watermark

## Run

```
php -S 127.0.0.1:8000 -t public
```

Base API URL: `http://127.0.0.1:8000/api`

## Testing

The backend test suite uses an in-memory SQLite database configured in `phpunit.xml`, so no extra setup is required.

Run tests:

```
php artisan test
```

## Environment Variables

Key values in `.env`:

-   `APP_URL` — e.g., `http://127.0.0.1:8000`
-   `CORS_ALLOWED_ORIGINS` — CSV list of allowed origins (e.g. `http://localhost:3000`)
-   `BACKOFFICE_DASHBOARD_URL` — `/admin/products`
-   `STOREFRONT_HOME_URL` — `/`

DB (use default Laravel settings or your own). For SQLite:

```
# .env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

Create file if missing:

```
ni database/database.sqlite
```

## Useful Commands

```
php artisan migrate:fresh --seed
php artisan tinker
php artisan route:list
```

## Troubleshooting

-   401 on protected routes: include `Authorization: Bearer <token>` header.
-   CORS errors: set `CORS_ALLOWED_ORIGINS=http://localhost:3000` and clear browser cache.
-   Missing images: run `php artisan storage:link` and re-seed (`php artisan migrate:fresh --seed`).
-   N+1 warnings in dev: triggered by `Model::preventLazyLoading()` — eager load relations.
