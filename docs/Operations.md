# Operations

## Dev Setup

- Backend
  - `cd backend`
  - `cp .env.example .env` and configure DB
  - `composer install`
  - `php artisan key:generate`
  - `php artisan migrate --seed`
  - `php artisan storage:link`
  - `php artisan serve` (defaults to `http://127.0.0.1:8000`)
- Frontend
  - `cd frontend`
  - `npm install`
  - Create `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`
  - `npm run dev` (http://localhost:3000)

## Production Build

- Backend: configure web server (Apache/Nginx) to serve `public/`; set env; run migrations.
- Frontend: `npm run build`; serve with Node (`npm start`) or export to static hosting as appropriate.

## Migrations & Seeds

- Run migrations: `php artisan migrate`
- Seed database: `php artisan db:seed`

## Testing

- Backend: `cd backend; php artisan test` (uses SQLite in-memory per `phpunit.xml`)
- Frontend e2e (optional): `cd frontend; npx playwright install; npm run test:e2e` (once added)

See also: [Testing](./Testing.md)

## Troubleshooting

- CORS errors: verify `cors.php` and frontend origin.
- 401/403: ensure token sent and role correct.
- Images not visible: run `php artisan storage:link`; check disk permissions.
