<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
  use RefreshDatabase;

  private function actAsAdmin(): User
  {
    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);
    return $admin;
  }

  public function test_admin_list_and_show_products(): void
  {
    $this->actAsAdmin();
    Product::factory()->count(3)->create();

    $this->getJson('/api/admin/products')->assertOk()->assertJsonStructure(['data', 'current_page']);

    $p = Product::first();
    $this->getJson('/api/admin/products/' . $p->id)->assertOk()->assertJsonPath('id', $p->id);
  }

  public function test_admin_can_create_product_with_image(): void
  {
    $this->actAsAdmin();
    Storage::fake('public');

    $payload = [
      'name' => 'Test Phone',
      'brand' => 'Acme',
      'category' => 'flagship',
      'description' => 'Great phone',
      'price' => 199.99,
      'image' => UploadedFile::fake()->image('photo.jpg', 800, 800),
    ];

    $res = $this->post('/api/admin/products', $payload);
    $res->assertStatus(201)->assertJsonPath('name', 'Test Phone');
    $this->assertDatabaseHas('products', ['name' => 'Test Phone']);
  }

  public function test_admin_can_update_product_without_image(): void
  {
    $this->actAsAdmin();
    $product = Product::factory()->create();

    $res = $this->putJson('/api/admin/products/' . $product->id, [
      'price' => 249.50,
    ]);

    $res->assertOk()->assertJsonPath('price', '249.50');
    $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 249.5]);
  }

  public function test_admin_can_delete_product(): void
  {
    $this->actAsAdmin();
    $product = Product::factory()->create();

    $this->deleteJson('/api/admin/products/' . $product->id)->assertNoContent();
    $this->assertDatabaseMissing('products', ['id' => $product->id]);
  }

  public function test_non_admin_cannot_access_admin_endpoints(): void
  {
    // Unauthenticated
    $this->getJson('/api/admin/products')->assertStatus(401);

    // Authenticated customer
    $customer = User::factory()->customer()->create();
    Sanctum::actingAs($customer);
    $this->getJson('/api/admin/products')->assertStatus(403);
  }
}
