<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class UserService
{
  /** Admin list */
  public function list(?string $q = null, int $perPage = 20)
  {
    return User::query()
      ->when($q, function ($qq) use ($q) {
        $qq->where('email', 'ILIKE', "%{$q}%")
          ->orWhere('first_name', 'ILIKE', "%{$q}%")
          ->orWhere('last_name', 'ILIKE', "%{$q}%");
      })
      ->latest('id')
      ->paginate($perPage);
  }

  /** Admin create */
  public function create(array $data): User
  {
    // password is auto-hashed via cast on the model
    return DB::transaction(function () use ($data) {
      $user = User::create($data);
      return $user->refresh();
    });
  }

  /** Admin update (password & role optional) */
  public function update(User $user, array $data): User
  {
    return DB::transaction(function () use ($user, $data) {
      // Avoid overwriting with nulls; only update provided fields
      $payload = Arr::only($data, ['first_name', 'last_name', 'email', 'password', 'role']);
      $payload = array_filter($payload, fn($v) => !is_null($v));

      $user->update($payload);
      return $user->refresh();
    });
  }

  /** Admin delete */
  public function delete(User $user): void
  {
    DB::transaction(fn() => $user->delete());
  }
}
