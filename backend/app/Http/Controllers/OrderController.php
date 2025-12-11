<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
  public function index(Request $request)
  {
    $user = $request->user() ?: auth('sanctum')->user();

    $perPage = (int) $request->query('per_page', 20);
    $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 20;

    if (! $user) {
      abort(401, 'Unauthenticated');
    }

    $orders = Order::with('items')
      ->where(function ($query) use ($user) {
        $query->where('user_id', $user->id);

        // Include guest orders previously placed with the same email so customers can still see them
        if ($user->email) {
          $query->orWhere('email', $user->email);
        }
      })
      ->latest()
      ->paginate($perPage);

    return $orders;
  }

  public function adminIndex(Request $request)
  {
    $perPage = (int) $request->query('per_page', 20);
    $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 20;
    $q = trim((string) $request->query('q', ''));

    $query = Order::with(['items', 'user'])->latest();

    if ($q !== '') {
      $needle = '%' . mb_strtolower($q) . '%';
      $query->where(function ($inner) use ($needle) {
        $inner
          ->orWhereRaw('LOWER(first_name) LIKE ?', [$needle])
          ->orWhereRaw('LOWER(last_name) LIKE ?', [$needle])
          ->orWhereRaw('LOWER(email) LIKE ?', [$needle])
          ->orWhereHas('user', function ($userQuery) use ($needle) {
            $userQuery
              ->whereRaw('LOWER(first_name) LIKE ?', [$needle])
              ->orWhereRaw('LOWER(last_name) LIKE ?', [$needle])
              ->orWhereRaw('LOWER(email) LIKE ?', [$needle]);
          });
      });
    }

    return $query->paginate($perPage);
  }

  public function show(Request $request, Order $order)
  {
    $user = $request->user();
    $isOwner = $user && $order->user_id === $user->id;
    $isAdmin = $user?->isAdmin();

    if (! $isOwner && ! $isAdmin) {
      abort(403, 'You are not allowed to view this order.');
    }

    return $order->load(['items', 'user']);
  }

  public function store(Request $request)
  {
    $authUser = $request->user() ?: auth('sanctum')->user();

    $data = $request->validate([
      'first_name' => ['required', 'string', 'max:100'],
      'last_name' => ['required', 'string', 'max:100'],
      'email' => ['required', 'email', 'max:255'],
      'phone' => ['nullable', 'string', 'max:50'],
      'address1' => ['required', 'string', 'max:255'],
      'address2' => ['nullable', 'string', 'max:255'],
      'city' => ['required', 'string', 'max:120'],
      'state' => ['nullable', 'string', 'max:120'],
      'postal_code' => ['nullable', 'string', 'max:30'],
      'country' => ['required', 'string', 'max:120'],
      'subtotal' => ['required', 'numeric', 'min:0'],
      'tax_total' => ['required', 'numeric', 'min:0'],
      'shipping_total' => ['required', 'numeric', 'min:0'],
      'grand_total' => ['required', 'numeric', 'min:0'],
      'items' => ['required', 'array', 'min:1'],
      'items.*.product_id' => ['required', 'uuid', 'exists:products,id'],
      'items.*.quantity' => ['required', 'integer', 'min:1'],
      'items.*.unit_price' => ['required', 'numeric', 'min:0'],
    ]);

    $itemsInput = $data['items'];
    unset($data['items']);

    // Attach authenticated user if present
    if ($authUser) {
      $data['user_id'] = $authUser->id;
      $data['email'] = $authUser->email ?? $data['email'];
      $data['first_name'] = $authUser->first_name ?? $data['first_name'];
      $data['last_name'] = $authUser->last_name ?? $data['last_name'];
    }

    $order = DB::transaction(function () use ($data, $itemsInput) {
      $order = Order::create(array_merge($data, [
        'status' => 'processing',
      ]));

      $products = Product::whereIn('id', collect($itemsInput)->pluck('product_id')->all())
        ->get()
        ->keyBy('id');

      $items = collect($itemsInput)->map(function ($item) use ($order, $products) {
        $product = $products->get($item['product_id']);
        $lineTotal = round($item['unit_price'] * $item['quantity'], 2);

        return new OrderItem([
          'product_id' => $item['product_id'],
          'product_name' => $product?->name ?? 'Unknown product',
          'product_brand' => $product?->brand,
          'quantity' => $item['quantity'],
          'unit_price' => $item['unit_price'],
          'line_total' => $lineTotal,
          'product_snapshot' => $product ? [
            'id' => $product->id,
            'name' => $product->name,
            'brand' => $product->brand,
            'image_url' => $product->image_url,
          ] : null,
        ]);
      })->all();

      $order->items()->saveMany($items);

      return $order->load('items');
    });

    return response()->json($order, 201);
  }
}
