<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
  use RefreshDatabase;

  private function sampleOrderPayload(array $overrides = [], ?User $asUser = null): array
  {
    $products = Product::factory()->count(2)->create();
    $items = $products->map(fn($p) => [
      'product_id' => $p->id,
      'quantity' => 2,
      'unit_price' => (float) $p->price,
    ])->all();

    $subtotal = array_reduce($items, fn($c, $i) => $c + $i['unit_price'] * $i['quantity'], 0.0);
    $tax = round($subtotal * 0.1, 2);
    $shipping = 5.00;
    $grand = round($subtotal + $tax + $shipping, 2);

    $base = [
      'first_name' => 'John',
      'last_name' => 'Doe',
      'email' => $asUser?->email ?? 'john@example.com',
      'phone' => '1234567890',
      'address1' => '123 Main St',
      'address2' => 'Apt 4',
      'city' => 'Metropolis',
      'state' => 'NY',
      'postal_code' => '10001',
      'country' => 'USA',
      'subtotal' => round($subtotal, 2),
      'tax_total' => $tax,
      'shipping_total' => $shipping,
      'grand_total' => $grand,
      'items' => $items,
    ];

    return array_merge($base, $overrides);
  }

  public function test_customer_can_place_order_and_list_own_orders(): void
  {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = $this->sampleOrderPayload(asUser: $user);
    $res = $this->postJson('/api/orders', $payload);
    $res->assertStatus(201)->assertJsonStructure(['id', 'items']);

    $this->getJson('/api/orders')
      ->assertOk()
      ->assertJsonStructure(['data', 'current_page'])
      ->assertJsonPath('data.0.user_id', $user->id);
  }

  public function test_customer_cannot_view_others_orders(): void
  {
    $owner = User::factory()->create();
    Sanctum::actingAs($owner);

    $order = $this->postJson('/api/orders', $this->sampleOrderPayload(asUser: $owner))
      ->json('id');

    $stranger = User::factory()->create();
    Sanctum::actingAs($stranger);

    $this->getJson('/api/orders/' . $order)->assertStatus(403);
  }
}
