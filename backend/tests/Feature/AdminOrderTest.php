<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
  use RefreshDatabase;

  public function test_admin_can_list_orders_and_search(): void
  {
    $admin = User::factory()->admin()->create();
    Sanctum::actingAs($admin);

    // Create a customer order via customer flow
    $customer = User::factory()->create(['first_name' => 'Alice', 'last_name' => 'Smith', 'email' => 'alice@example.com']);
    Sanctum::actingAs($customer);

    // Build a minimal realistic order payload
    $products = Product::factory()->count(2)->create();
    $items = $products->map(fn($p) => [
      'product_id' => $p->id,
      'quantity' => 1,
      'unit_price' => (float) $p->price,
    ])->all();
    $subtotal = array_reduce($items, fn($c, $i) => $c + $i['unit_price'] * $i['quantity'], 0.0);
    $tax = round($subtotal * 0.1, 2);
    $shipping = 5.00;
    $grand = round($subtotal + $tax + $shipping, 2);

    $payload = [
      'first_name' => 'Alice',
      'last_name' => 'Smith',
      'email' => 'alice@example.com',
      'phone' => '1112223333',
      'address1' => '123 1st Ave',
      'address2' => null,
      'city' => 'Gotham',
      'state' => 'NY',
      'postal_code' => '10002',
      'country' => 'USA',
      'subtotal' => round($subtotal, 2),
      'tax_total' => $tax,
      'shipping_total' => $shipping,
      'grand_total' => $grand,
      'items' => $items,
    ];

    $this->postJson('/api/orders', $payload)->assertStatus(201);

    // Switch back to admin
    Sanctum::actingAs($admin);

    $this->getJson('/api/admin/orders')->assertOk()->assertJsonStructure(['data', 'current_page']);
    $this->getJson('/api/admin/orders?q=Alice')->assertOk()->assertJsonStructure(['data', 'current_page']);
  }
}
