<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
  /**
   * POST /api/register
   */
  public function register(Request $request)
  {
    $data = $request->validate([
      'first_name' => ['required', 'string', 'max:100'],
      'last_name'  => ['required', 'string', 'max:100'],
      'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
      'password'   => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $user = User::create([
      'first_name' => $data['first_name'],
      'last_name'  => $data['last_name'],
      'email'      => $data['email'],
      'password'   => $data['password'],
      'role'       => User::ROLE_CUSTOMER,
    ]);

    $token = $user->createToken('api')->plainTextToken;

    return response()->json([
      'token' => $token,
      'user'  => $user,
      'redirect_to' => $this->redirectPathFor($user),
    ], 201);
  }

  /**
   * POST /api/login
   */
  public function login(Request $request)
  {
    $data = $request->validate([
      'email'    => ['required', 'email'],
      'password' => ['required', 'string'],
    ]);

    $user = User::where('email', $data['email'])->first();

    if (! $user || ! Hash::check($data['password'], $user->password)) {
      throw ValidationException::withMessages([
        'email' => __('auth.failed'),
      ]);
    }

    $token = $user->createToken('api')->plainTextToken;

    $redirectTo = $this->redirectPathFor($user);

    if (! $request->expectsJson()) {
      return redirect()->to($redirectTo);
    }

    return response()->json([
      'token' => $token,
      'user'  => $user,
      'redirect_to' => $redirectTo,
    ]);
  }

  /**
   * GET /api/me  (auth:sanctum)
   */
  public function me(Request $request)
  {
    return $request->user();
  }

  /**
   * POST /api/logout  (auth:sanctum)
   */
  public function logout(Request $request)
  {
    // Revoke current token only
    $request->user()->currentAccessToken()?->delete();
    return response()->json(['message' => 'Logged out']);
  }

  /**
   * Determine the front-end destination based on user role.
   */
  private function redirectPathFor(User $user): string
  {
    return $user->isAdmin()
      ? config('app.backoffice_dashboard_url', '/backoffice')
      : config('app.storefront_home_url', '/');
  }
}
