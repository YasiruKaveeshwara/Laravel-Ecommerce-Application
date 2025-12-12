<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
  use RefreshDatabase;

  public function test_public_list_products_returns_paginated(): void
  {
    Product::factory()->count(5)->create();

    $res = $this->getJson('/api/products');
    $res->assertOk()->assertJsonStructure(['data', 'current_page']);
  }

  public function test_public_show_product_returns_single_product(): void
  {
    $product = Product::factory()->create();

    $res = $this->getJson('/api/products/' . $product->id);
    $res->assertOk()->assertJsonPath('id', $product->id);
  }

  public function test_public_detail_by_id(): void
  {
    $product = Product::factory()->create();
    $res = $this->postJson('/api/products/detail', ['product_id' => $product->id]);
    $res->assertOk()->assertJsonPath('id', $product->id);
  }
}
