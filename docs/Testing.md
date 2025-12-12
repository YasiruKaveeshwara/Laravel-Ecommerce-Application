# Testing

## Current

- Postman collection: `backend/tests/laravel-ecommerce.postman_collection.json`
- Backend Feature tests are implemented and passing (auth, products, orders, users)
- Frontend e2e: recommended via Playwright (not yet implemented)

## Backend Tests (implemented)

- Auth: register, login, me, update, logout, delete profile
- Products: public list/show/detail; admin list/show/create/update/delete; access control
- Orders: customer place order; list own orders; forbid viewing others; admin index + search
- Users (admin): list/filter; create/update/delete; access control

## Frontend E2E (suggested)

- Guest → signup → login → browse → add to cart → checkout → orders list
- Admin → login → create product → edit product → delete product → verify list

## Running

- PHP Unit: `cd backend; php artisan test`
- Playwright: `cd frontend; npx playwright install; npm run test:e2e` (once added)

See also: [Operations](./Operations.md) · [API](../backend/API.md)
