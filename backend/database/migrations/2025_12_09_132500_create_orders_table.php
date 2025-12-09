<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('orders', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
      $table->string('first_name');
      $table->string('last_name');
      $table->string('email');
      $table->string('phone', 50)->nullable();
      $table->string('address1');
      $table->string('address2')->nullable();
      $table->string('city');
      $table->string('state')->nullable();
      $table->string('postal_code')->nullable();
      $table->string('country');
      $table->decimal('subtotal', 10, 2);
      $table->decimal('tax_total', 10, 2);
      $table->decimal('shipping_total', 10, 2);
      $table->decimal('grand_total', 10, 2);
      $table->string('status')->default('pending');
      $table->text('notes')->nullable();
      $table->timestamps();
    });

    Schema::create('order_items', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
      $table->foreignUuid('product_id')->nullable()->constrained()->nullOnDelete();
      $table->string('product_name');
      $table->string('product_brand')->nullable();
      $table->unsignedInteger('quantity');
      $table->decimal('unit_price', 10, 2);
      $table->decimal('line_total', 10, 2);
      $table->json('product_snapshot')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('order_items');
    Schema::dropIfExists('orders');
  }
};
