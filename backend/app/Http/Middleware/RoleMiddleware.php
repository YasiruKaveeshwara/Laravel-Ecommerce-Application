<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
  /**
   * Handle an incoming request.
   *
   * Usage:
   *   ->middleware('role:administrator')
   *   ->middleware('role:administrator,customer')
   */
  public function handle(Request $request, Closure $next, string ...$roles)
  {
    $user = $request->user();

    if (!$user) {
      return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // If no roles passed, allow (acts as a no-op)
    if (empty($roles)) {
      return $next($request);
    }

    // Allow if user's role is in the allowed list
    if (!in_array($user->role, $roles, true)) {
      return response()->json(['message' => 'Forbidden.'], 403);
    }

    return $next($request);
  }
}
