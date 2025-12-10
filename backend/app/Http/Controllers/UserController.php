<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
  public function __construct(private UserService $users) {}

  /**
   * GET /api/users  (auth:sanctum + role:administrator)
   * Query params: q, per_page, page, role
   */
  public function index(Request $request)
  {
    $validated = $request->validate([
      'q'        => ['nullable', 'string'],
      'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
      'page'     => ['nullable', 'integer', 'min:1'],
      'role'     => ['nullable', Rule::in([User::ROLE_ADMIN, User::ROLE_CUSTOMER])],
    ]);

    $q = $validated['q'] ?? null;
    $perPage = (int) ($validated['per_page'] ?? 20);
    $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 20;
    $role = $validated['role'] ?? null;

    return $this->users->list($q, $perPage, $role);
  }

  /**
   * POST /api/users  (auth:sanctum + role:administrator)
   */
  public function store(Request $request)
  {
    $data = $request->validate([
      'first_name' => ['required', 'string', 'max:100'],
      'last_name'  => ['required', 'string', 'max:100'],
      'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
      'password'   => ['required', 'string', 'min:8'],
      'role'       => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_CUSTOMER])],
    ]);

    $user = $this->users->create($data);
    return response()->json($user, 201);
  }

  /**
   * GET /api/users/{user}  (auth:sanctum + role:administrator)
   */
  public function show(User $user)
  {
    return $user;
  }

  /**
   * PUT/PATCH /api/users/{user}  (auth:sanctum + role:administrator)
   */
  public function update(Request $request, User $user)
  {
    $data = $request->validate([
      'first_name' => ['sometimes', 'string', 'max:100'],
      'last_name'  => ['sometimes', 'string', 'max:100'],
      'email'      => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
      'password'   => ['sometimes', 'string', 'min:8'],
      'role'       => ['sometimes', Rule::in([User::ROLE_ADMIN, User::ROLE_CUSTOMER])],
    ]);

    $updated = $this->users->update($user, $data);
    return $updated;
  }

  /**
   * DELETE /api/users/{user}  (auth:sanctum + role:administrator)
   */
  public function destroy(User $user)
  {
    $this->users->delete($user);
    return response()->noContent();
  }
}
