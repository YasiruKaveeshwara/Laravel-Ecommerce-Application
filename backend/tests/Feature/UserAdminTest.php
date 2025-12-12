<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserAdminTest extends TestCase
{
  use RefreshDatabase;

  private function actAsAdmin(): User
  {
    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);
    return $admin;
  }

  public function test_admin_can_list_and_filter_users(): void
  {
    $this->actAsAdmin();
    User::factory()->customer()->count(3)->create();

    $this->getJson('/api/users')
      ->assertOk()
      ->assertJsonStructure(['data', 'current_page']);

    $this->getJson('/api/users?role=customer')
      ->assertOk()
      ->assertJsonStructure(['data', 'current_page']);
  }

  public function test_admin_crud_user(): void
  {
    $this->actAsAdmin();

    $create = $this->postJson('/api/users', [
      'first_name' => 'Tina',
      'last_name' => 'Admin',
      'email' => 'tina.admin@example.com',
      'password' => 'secretPass123',
      'role' => 'customer',
    ])->assertStatus(201)->json('id');

    $this->assertDatabaseHas('users', ['id' => $create, 'email' => 'tina.admin@example.com']);

    $this->putJson('/api/users/' . $create, [
      'first_name' => 'Tina2',
    ])->assertOk()->assertJsonPath('first_name', 'Tina2');

    $this->deleteJson('/api/users/' . $create)->assertNoContent();
    $this->assertDatabaseMissing('users', ['id' => $create]);
  }

  public function test_non_admin_cannot_manage_users(): void
  {
    $customer = User::factory()->customer()->create();
    Sanctum::actingAs($customer);

    $this->getJson('/api/users')->assertStatus(403);
    $this->postJson('/api/users', [])->assertStatus(403);
  }
}
