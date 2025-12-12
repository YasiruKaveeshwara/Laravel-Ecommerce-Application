<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
  use RefreshDatabase;

  public function test_register_creates_user_and_returns_token(): void
  {
    $payload = [
      'first_name' => 'Ada',
      'last_name'  => 'Lovelace',
      'email'      => 'ada@example.com',
      'password'   => 'password123',
      'password_confirmation' => 'password123',
    ];

    $resp = $this->postJson('/api/register', $payload);
    $resp->assertStatus(201)
      ->assertJsonStructure(['token', 'user' => ['id', 'email'], 'redirect_to']);

    $this->assertDatabaseHas('users', ['email' => 'ada@example.com']);
  }

  public function test_login_returns_token_and_user(): void
  {
    $user = User::factory()->create([
      'email' => 'test@example.com',
      'password' => 'password123',
    ]);

    $resp = $this->postJson('/api/login', [
      'email' => $user->email,
      'password' => 'password123',
    ]);

    $resp->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email'], 'redirect_to']);
  }

  public function test_me_requires_auth_and_returns_user(): void
  {
    $this->getJson('/api/me')->assertStatus(401);

    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/me')
      ->assertOk()
      ->assertJsonPath('email', $user->email);
  }

  public function test_update_profile_allows_changes_and_password(): void
  {
    $user = User::factory()->create([
      'first_name' => 'Grace',
      'last_name' => 'Hopper',
      'email' => 'grace@example.com',
      'password' => 'oldpassword',
    ]);
    Sanctum::actingAs($user);

    $resp = $this->putJson('/api/me', [
      'first_name' => 'Amazing',
      'password' => 'newpassword123',
      'password_confirmation' => 'newpassword123',
    ]);

    $resp->assertOk()->assertJsonPath('first_name', 'Amazing');
  }

  public function test_logout_revokes_current_token(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/logout')->assertOk();
  }

  public function test_destroy_profile_requires_password_and_deletes_user(): void
  {
    $user = User::factory()->create(['password' => 'secretPass123']);
    Sanctum::actingAs($user);

    $this->deleteJson('/api/me', ['password' => 'wrong'])->assertStatus(422);

    $this->deleteJson('/api/me', ['password' => 'secretPass123'])->assertNoContent();
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
  }
}
