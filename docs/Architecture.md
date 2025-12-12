# Architecture

## Overview

- Backend: Laravel 11 API with Sanctum, Eloquent (Users, Products, Orders, OrderItems), service layer (ProductService, UserService, ImageService), and role-based routes.
- Frontend: Next.js (App Router) + TypeScript, TailwindCSS, Zustand stores, shared UI components, pagination normalization, and route guards.
- Auth: Token-based via Laravel Sanctum with bearer tokens in requests from the frontend.

## Data Flow

- Client authenticates via `/api/login` and stores bearer token in memory (Zustand).
- Client requests include `Authorization: Bearer <token>` header via centralized fetch helper.
- Backend applies auth (`auth:sanctum`) and role middleware for protected/admin routes.
- Responses use Laravel paginator (public/admin lists) with `current_page`, `per_page`, etc. Frontend normalizes shapes as needed.

## Modules

- Backend
  - Controllers: `AuthController`, `ProductController`, `OrderController`, `UserController`
  - Services: `ProductService`, `UserService`, `ImageService`
  - Models: `User`, `Product`, `Order`, `OrderItem`, `PersonalAccessToken`
  - Config: `catalog.php`, `cors.php`, `sanctum.php`
  - Seeds: `DatabaseSeeder` (admin + customers + catalog with watermarked images)
- Frontend
  - `src/app`: storefront and admin routes
  - `src/components`: `DeleteButton`, `EditButton`, `ConfirmDialog`, uploader, pagination controls
  - `src/lib`: `api.ts` (client), `pagination.ts` (normalizer/summarizer), `useRouteGuard.ts`
  - `src/store`: `useAuth`, `useCart`

## Authentication & Authorization

- Login/Signup returns a token (Sanctum). Frontend stores in memory and attaches to requests.
- Admin-only endpoints guarded by role middleware; frontend routes use `useRouteGuard` to prevent access.

## Images

- Uploaded images: resized and watermarked (tiled) in `ImageService` using Intervention Image.
- Public URLs exposed via accessor; served from `public` disk.

## Pagination

- Backend returns paginated lists.
- Frontend consumes and standardizes to a single shape for UI controls.

## Decisions

- Shared action components enforce coherent UI and accessibility.
- Service layer extracts business logic from controllers.
- Strict linting to maintain code quality across the frontend.

See also: [Features](./Features.md) · [API](../backend/API.md) · [Security](./Security.md)
