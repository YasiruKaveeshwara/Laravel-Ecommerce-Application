<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
  public function __construct(private ProductService $products) {}

  /**
   * GET /api/products  (public)
   * Query params: q, per_page
   */
  public function index(Request $request)
  {
    $q        = $request->query('q');
    $perPage  = (int) ($request->query('per_page', 12));
    $perPage  = $perPage > 0 && $perPage <= 100 ? $perPage : 12;

    return $this->products->listPublic($q, $perPage);
  }

  /**
   * GET /api/products/{product}  (public)
   */
  public function show(Product $product)
  {
    return $product;
  }

  /**
   * POST /api/products/detail  (public)
   * Body: product_id
   */
  public function detail(Request $request)
  {
    $data = $request->validate([
      'product_id' => ['required', 'uuid', 'exists:products,id'],
    ]);

    return $this->products->showPublic($data['product_id']);
  }

  /**
   * GET /api/admin/products  (auth:sanctum + role:administrator)
   * Query params: q, per_page
   */
  public function adminIndex(Request $request)
  {
    $q        = $request->query('q');
    $perPage  = (int) ($request->query('per_page', 20));
    $perPage  = $perPage > 0 && $perPage <= 100 ? $perPage : 20;

    return $this->products->listAdmin($q, $perPage);
  }

  /**
   * GET /api/admin/products/{product}  (auth:sanctum + role:administrator)
   */
  public function adminShow(Product $product)
  {
    return $product;
  }

  /**
   * POST /api/admin/products/detail  (auth:sanctum + role:administrator)
   * Body: product_id
   */
  public function adminDetail(Request $request)
  {
    $data = $request->validate([
      'product_id' => ['required', 'uuid', 'exists:products,id'],
    ]);

    return $this->products->showAdmin($data['product_id']);
  }

  /**
   * POST /api/admin/products  (auth:sanctum + role:administrator)
   * Body: name, price, description?, image (file)
   */
  public function store(Request $request)
  {
    $data = $request->validate([
      'name'        => ['required', 'string', 'max:255'],
      'brand'       => ['required', 'string', 'max:255'],
      'category'    => ['required', 'string', 'in:flagship,foldables,midrange,budget'],
      'description' => ['nullable', 'string'],
      'price'       => ['required', 'numeric', 'min:0'],
      'image'       => ['required', 'image', 'max:5120'], // 5MB
    ]);

    $product = $this->products->create($data, $request->file('image'));

    return response()->json($product, 201);
  }

  /**
   * PUT/PATCH /api/admin/products/{product}  (auth:sanctum + role:administrator)
   * Body: name?, price?, description?, image? (file)
   */
  public function update(Request $request, Product $product)
  {
    $data = $request->validate([
      'name'        => ['sometimes', 'string', 'max:255'],
      'brand'       => ['sometimes', 'string', 'max:255'],
      'category'    => ['sometimes', 'string', 'in:flagship,foldables,midrange,budget'],
      'description' => ['sometimes', 'nullable', 'string'],
      'price'       => ['sometimes', 'numeric', 'min:0'],
      'image'       => ['sometimes', 'image', 'max:5120'],
    ]);

    $updated = $this->products->update($product, $data, $request->file('image'));
    return $updated;
  }

  /**
   * DELETE /api/admin/products/{product}  (auth:sanctum + role:administrator)
   */
  public function destroy(Product $product)
  {
    $this->products->delete($product);
    return response()->noContent();
  }
}
