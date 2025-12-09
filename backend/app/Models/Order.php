<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
  use HasFactory, HasUuids;

  protected $fillable = [
    'user_id',
    'first_name',
    'last_name',
    'email',
    'phone',
    'address1',
    'address2',
    'city',
    'state',
    'postal_code',
    'country',
    'subtotal',
    'tax_total',
    'shipping_total',
    'grand_total',
    'status',
    'notes',
  ];

  public function items()
  {
    return $this->hasMany(OrderItem::class);
  }

  public function user()
  {
    return $this->belongsTo(User::class);
  }
}
