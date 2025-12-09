<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ProductService
{
  public function __construct(private ImageService $images) {}

  /** Public/customer list with optional name search and filters */
  public function listPublic(
    ?string $q = null,
    int $perPage = 20,
    ?float $minPrice = null,
    ?float $maxPrice = null,
    ?string $category = null,
    ?string $brand = null
  ) {
    return $this->searchableQuery(Product::query(), $q)
      ->when($minPrice !== null, fn($query) => $query->where('price', '>=', $minPrice))
      ->when($maxPrice !== null, fn($query) => $query->where('price', '<=', $maxPrice))
      ->when($category, fn($query) => $query->where('category', $category))
      ->when($brand, fn($query) => $query->whereRaw('LOWER(brand) = ?', [mb_strtolower($brand)]))
      ->latest()
      ->paginate($perPage);
  }

  /** Public show */
  public function showPublic(string $id): Product
  {
    return Product::findOrFail($id);
  }

  /** Admin show */
  public function showAdmin(string $id): Product
  {
    return Product::findOrFail($id);
  }

  /** Admin list */
  public function listAdmin(?string $q = null, int $perPage = 20)
  {
    return $this->searchableQuery(Product::query(), $q)
      ->latest()
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

  /**
   * Apply a case-insensitive LIKE filter that works across SQLite/MySQL/Postgres.
   */
  private function searchableQuery(Builder $query, ?string $term): Builder
  {
    if (! $term) {
      return $query;
    }

    $needle = '%' . mb_strtolower($term) . '%';

    return $query->where(function ($inner) use ($needle) {
      $inner->whereRaw('LOWER(name) LIKE ?', [$needle])
        ->orWhereRaw('LOWER(brand) LIKE ?', [$needle]);
    });
  }
}
