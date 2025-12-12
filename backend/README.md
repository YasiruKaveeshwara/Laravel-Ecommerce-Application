## Backend (Laravel API)

This folder hosts the Laravel API powering the storefront and admin backoffice. It exposes authentication, products, orders, and users endpoints; implements role‑based access control; and processes product images with watermarking.

For a complete endpoint list with examples see: [API.md](./API.md).

### Setup (short)

See `SETUP.md` for details. Quick path:

```
copy .env.example .env
php artisan key:generate
php artisan migrate; php artisan db:seed
php artisan storage:link
php -S 127.0.0.1:8000 -t public
```

The seeder creates an administrator and a demo customer and hydrates a catalog with generated images (watermarked).

### Highlights

-   Auth via Sanctum tokens, `auth:sanctum` middleware
-   `role:administrator` middleware for admin routes
-   Products service handles filters + image processing (resize, watermark, public URLs)
-   Orders store captures item snapshots for immutable receipts
-   Users CRUD + search and role filtering
-   CORS configured for `api/*` paths; tune `CORS_ALLOWED_ORIGINS` or `FRONTEND_URL`

### Structure

-   app/Http/Controllers — Auth, Product, Order, User controllers
-   app/Services — ImageService, ProductService, UserService
-   app/Models — User, Product, Order, OrderItem, PersonalAccessToken
-   routes/api.php — public + protected + admin route groups
-   config/catalog.php — product categories and brands presets
-   database/seeders/DatabaseSeeder.php — admin + demo users + catalog with images

### Environment

Key environment variables (see `.env.example`):

-   `APP_URL` — base URL used to generate absolute paths
-   `CORS_ALLOWED_ORIGINS` — CSV list of allowed origins (e.g. `http://localhost:3000`)
-   `BACKOFFICE_DASHBOARD_URL` — e.g. `/admin/products`
-   `STOREFRONT_HOME_URL` — e.g. `/`

### Development Notes

-   Responses are conventional Laravel paginator JSON; `current_page` etc. are present on the root
-   `Model::preventLazyLoading()` enabled in debug to detect N+1s
-   Storage proxy route `/storage/{path}` serves files safely from `storage/app/public`

Troubleshooting and more: [SETUP.md](./SETUP.md) and [docs/Operations.md](../docs/Operations.md) in the repo root.

### Testing

The test suite uses an in-memory SQLite database configured in `phpunit.xml`.

Run tests:

```
php artisan test
```

See also `docs/Testing.md` for an overview of coverage and suggestions.
