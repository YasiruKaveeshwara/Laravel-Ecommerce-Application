<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class DatabaseSeeder extends Seeder
{
	public function run(): void
	{
		// 1) Ensure a placeholder exists on public disk (used by ProductFactory defaults)
		$this->ensurePlaceholder();

		// 2) Admin (deterministic) + some customers
		User::updateOrCreate(
			['email' => 'admin@example.com'],
			[
				'first_name' => 'Admin',
				'last_name'  => 'User',
				'role'       => User::ROLE_ADMIN,
				'password'   => Hash::make('password'),
			]
		);

		User::factory()->count(8)->customer()->create();

		// 3) Create products via factory (will start with placeholder paths)
		$products = Product::factory()->count(12)->create();

        // 4) Replace placeholder with real images using ImageService
		/** @var ImageService $images */
		$images = app(ImageService::class);

		foreach ($products as $product) {
			// Create a temp image (unique color/text) for this product
			$tmpPath = $this->makeTempImage("{$product->name}");

			// Wrap as UploadedFile so ImageService can process it
			$uploaded = new UploadedFile(
				$tmpPath,
				basename($tmpPath),
				'image/jpeg',
				null,
				true // $test (skip real HTTP checks)
			);

			$paths = $images->processAndStore($uploaded, 'products', watermark: true);

			// Update product record with processed paths
			$product->update($paths);

			// Clean up temp
			@unlink($tmpPath);
		}
	}

	/**
	 * Ensure we have a public/products/placeholder.jpg to satisfy factory defaults.
	 */
	private function ensurePlaceholder(): void
	{
		if (! Storage::disk('public')->exists('products/placeholder.jpg')) {
			$img = Image::create(600, 400)->fill('#e5e7eb'); // neutral gray

			$img->text('Placeholder', 300, 200, function ($font) {
				$font->size(28);
				$font->color('#374151');
				$font->align('center');
				$font->valign('center');
			});

			Storage::disk('public')->put(
				'products/placeholder.jpg',
				(string) $img->encodeByExtension('jpg', 85)
			);
		}
	}


	/**
	 * Generate a temporary image file on disk and return its full path.
	 */
	private function makeTempImage(string $label): string
	{
		$w = 1280;
		$h = 800;
		$bg = collect(['#fde68a', '#a7f3d0', '#bfdbfe', '#fecaca', '#ddd6fe'])->random();

		$img = Image::create($w, $h)->fill($bg);

		$img->text($label, $w / 2, $h / 2, function ($font) {
			$font->size(42);
			$font->color('rgba(0,0,0,0.65)');
			$font->align('center');
			$font->valign('center');
		});

		$tmp = storage_path('app/tmp_' . \Illuminate\Support\Str::uuid() . '.jpg');
		$img->save($tmp, 88, 'jpg');

		return $tmp;
	}
}
