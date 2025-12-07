<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
  /**
   * Global HTTP middleware stack.
   * These run on every request to your application.
   */
  protected $middleware = [

    // Handle CORS (configured in config/cors.php)
    \Illuminate\Http\Middleware\HandleCors::class,

    // Enforce max POST size from php.ini
    \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,

  ];

  /**
   * Route middleware groups.
   */
  protected $middlewareGroups = [
    'web' => [
      \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
      \Illuminate\Session\Middleware\StartSession::class,
      \Illuminate\View\Middleware\ShareErrorsFromSession::class,
      \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],

    'api' => [
      // If you use Sanctum **cookie** auth for SPAs, uncomment the next line:
      // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,

      // Rate limiting (configured in app/Providers/RouteServiceProvider.php)
      'throttle:api',

      // Route model binding, implicit bindings, etc.
      \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
  ];

  /**
   * Route middleware aliases.
   * You may assign any of these to routes/groups.
   */
  protected $middlewareAliases = [
    // Auth / Guards
    'auth' => \App\Http\Middleware\Authenticate::class,
    'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
    'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
    'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,

    // Authorization
    'can' => \Illuminate\Auth\Middleware\Authorize::class,

    // Signed URLs / email verification
    'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
    'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,

    // Cache / CORS / Throttle
    'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,

    // 🔹 Custom: role-based access (administrator / customer)
    'role' => \App\Http\Middleware\RoleMiddleware::class,
  ];
}
