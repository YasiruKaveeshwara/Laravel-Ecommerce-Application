<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProductService
{
  public function __construct(private ImageService $images) {}

  /** Public/customer list with optional name search */
  public function listPublic(?string $q = null, int $perPage = 12)
  {
    return Product::query()
      ->when($q, fn($qq) => $qq->where('name', 'ILIKE', "%{$q}%")) // Postgres-friendly search
      ->latest('id')
      ->paginate($perPage);
  }

  /** Public show */
  public function showPublic(int $id): Product
  {
    return Product::findOrFail($id);
  }

  /** Admin list */
  public function listAdmin(?string $q = null, int $perPage = 20)
  {
    return Product::query()
      ->when($q, fn($qq) => $qq->where('name', 'ILIKE', "%{$q}%"))
      ->latest('id')
      ->paginate($perPage);
  }

  /** Admin create (image required in controller validation) */
  public function create(array $data, UploadedFile $image): Product
  {
    return DB::transaction(function () use ($data, $image) {
      $paths = $this->images->processAndStore($image, 'products', watermark: true);
      $product = Product::create(array_merge($data, $paths));
      return $product->refresh();
    });
  }

  /** Admin update (image optional) */
  public function update(Product $product, array $data, ?UploadedFile $image = null): Product
  {
    return DB::transaction(function () use ($product, $data, $image) {
      if ($image) {
        $paths = $this->images->replace(
          $image,
          $product->image_path,
          $product->original_image_path,
          'products'
        );
        $data = array_merge($data, $paths);
      }

      $product->update($data);
      return $product->refresh();
    });
  }

  /** Admin delete (also remove image files) */
  public function delete(Product $product): void
  {
    DB::transaction(function () use ($product) {
      $this->images->delete($product->image_path);
      $this->images->delete($product->original_image_path);
      $product->delete();
    });
  }
}
