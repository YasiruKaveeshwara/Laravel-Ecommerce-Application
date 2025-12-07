<?php

namespace App\Http\Middleware;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
  /**
   * Get the path the user should be redirected to when they are not authenticated.
   * For APIs, return null so Laravel sends a 401; we override the response to JSON.
   */
  protected function redirectTo($request): ?string
  {
    if (! $request->expectsJson()) {
      return route('auth.login');
    }

    return null; // API: no redirect
  }

  /**
   * Customize the unauthenticated response to be clean JSON.
   */
  protected function unauthenticated($request, array $guards)
  {
    if ($request->expectsJson()) {
      abort(response()->json([
        'message' => 'Unauthenticated.',
      ], 401));
    }

    throw new AuthenticationException(
      'Unauthenticated.',
      $guards,
      $this->redirectTo($request)
    );
  }
}
