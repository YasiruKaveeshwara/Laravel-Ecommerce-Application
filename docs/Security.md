# Security

## Authentication

- Laravel Sanctum issues a personal access token on login/signup.
- Frontend stores token in memory (Zustand) and sends `Authorization: Bearer` headers.
- Logout revokes token on the server.

## Authorization

- Role middleware protects admin routes on the backend.
- Frontend `useRouteGuard` prevents navigation to admin pages for non-admins.

## CORS

- Configured to allow the frontend origin (e.g., `http://localhost:3000`).
- Only API routes are exposed with necessary methods and headers.

## Input Validation

- Controllers validate inputs (products, users, auth) with Laravel validation.
- Service layer ensures image handling is safe (size/format) and paths are sanitized.

## Storage & Files

- Images stored on the `public` disk; public URLs generated via accessor.
- `ImageService` resizes and applies watermarking to deter misuse.

## Other Considerations

- Passwords hashed using Laravel’s defaults (bcrypt/argon per config).
- CSRF not required for token-based API calls.
- Avoid token persistence in `localStorage` to reduce XSS risk; keep in memory.
