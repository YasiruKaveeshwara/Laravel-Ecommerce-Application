<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
  protected $model = Product::class;

  public function definition(): array
  {
    $brands = ['Pixel', 'Galaxy', 'iPhone', 'Xperia', 'OnePlus', 'Nothing', 'Moto'];
    $categories = ['flagship', 'foldables', 'midrange', 'budget'];

    return [
      'name'        => ucfirst($this->faker->unique()->words(3, true)),
      'brand'       => $this->faker->randomElement($brands),
      'category'    => $this->faker->randomElement($categories),
      'description' => $this->faker->optional()->paragraph(),
      'price'       => $this->faker->randomFloat(2, 5, 499),
      // Temporary placeholders; DatabaseSeeder will replace with real files
      'image_path'           => 'products/placeholder.jpg',
      'original_image_path'  => null,
    ];
  }
}
