<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
  use HasFactory, HasUuids;

  protected $fillable = [
    'order_id',
    'product_id',
    'product_name',
    'product_brand',
    'quantity',
    'unit_price',
    'line_total',
    'product_snapshot',
  ];

  protected $casts = [
    'product_snapshot' => 'array',
  ];

  public function order()
  {
    return $this->belongsTo(Order::class);
  }

  public function product()
  {
    return $this->belongsTo(Product::class);
  }
}
