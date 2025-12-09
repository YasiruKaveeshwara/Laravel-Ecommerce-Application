<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Intervention\Image\Laravel\Facades\Image;

class DatabaseSeeder extends Seeder
{
	public function run(): void
	{
		$this->ensurePlaceholder();
		$this->seedMasterAdmin();
		$this->seedDemoCustomer();
		User::factory()->count(8)->customer()->create();

		$products = $this->seedCatalogProducts();
		$this->hydrateProductImages($products);
	}

	private function seedMasterAdmin(): User
	{
		return User::updateOrCreate(
			['email' => 'master.admin@pulsemobile.com'],
			[
				'first_name' => 'Pulse',
				'last_name'  => 'Admin',
				'role'       => User::ROLE_ADMIN,
				'password'   => 'PulseAdmin#2025',
			]
		);
	}

	private function seedDemoCustomer(): User
	{
		return User::updateOrCreate(
			['email' => 'demo.customer@pulsemobile.com'],
			[
				'first_name' => 'Demo',
				'last_name'  => 'Customer',
				'role'       => User::ROLE_CUSTOMER,
				'password'   => 'DemoCustomer#2025',
			]
		);
	}

	private function seedCatalogProducts(): Collection
	{
		return collect($this->demoProducts())->map(function (array $product) {
			return Product::updateOrCreate(
				['name' => $product['name']],
				array_merge($product, [
					'image_path' => 'products/placeholder.jpg',
					'original_image_path' => null,
				])
			);
		});
	}

	private function hydrateProductImages(Collection $products): void
	{
		$pending = $products->filter(fn(Product $product) => empty($product->original_image_path));
		if ($pending->isEmpty()) {
			return;
		}

		/** @var ImageService $images */
		$images = app(ImageService::class);

		foreach ($pending as $product) {
			$tmpPath = $this->makeTempImage("{$product->name}");
			$uploaded = new UploadedFile(
				$tmpPath,
				basename($tmpPath),
				'image/jpeg',
				null,
				true
			);

			$paths = $images->processAndStore($uploaded, 'products', watermark: true);
			$product->update($paths);
			@unlink($tmpPath);
		}
	}

	private function demoProducts(): array
	{
		return [
			['name' => 'Galaxy S24 Ultra', 'brand' => 'samsung', 'category' => 'flagship', 'description' => '6.8-inch QHD+ 120Hz AMOLED with Snapdragon 8 Gen 3 for Galaxy, 200MP quad camera, S Pen support and 5000mAh battery with 45W charging', 'price' => 1299.00],
			['name' => 'Galaxy S24 Plus', 'brand' => 'samsung', 'category' => 'flagship', 'description' => '6.7-inch QHD+ 120Hz AMOLED powered by Exynos 2400 globally or Snapdragon 8 Gen 3 in the US, 50MP triple camera and 4900mAh battery with 45W charging', 'price' => 999.00],
			['name' => 'Galaxy S24', 'brand' => 'samsung', 'category' => 'flagship', 'description' => '6.2-inch FHD+ 120Hz AMOLED, Exynos 2400 or Snapdragon 8 Gen 3 chipset, 50MP triple camera and Galaxy AI features with 4000mAh battery', 'price' => 799.00],
			['name' => 'Galaxy Z Fold5', 'brand' => 'samsung', 'category' => 'foldables', 'description' => '7.6-inch foldable AMOLED plus 6.2-inch cover display, Snapdragon 8 Gen 2 for Galaxy, Flex hinge design and 4400mAh battery with S Pen Fold Edition support', 'price' => 1799.00],
			['name' => 'Galaxy Z Flip5', 'brand' => 'samsung', 'category' => 'foldables', 'description' => '6.7-inch 120Hz AMOLED with 3.4-inch Flex Window cover, Snapdragon 8 Gen 2 for Galaxy, IPX8 chassis and 3700mAh battery with 25W charging', 'price' => 999.00],
			['name' => 'Galaxy A55 5G', 'brand' => 'samsung', 'category' => 'midrange', 'description' => '6.6-inch FHD+ 120Hz Super AMOLED, Exynos 1480, 50MP OIS main camera and 5000mAh battery with 25W charging in an aluminum frame', 'price' => 449.00],
			['name' => 'Galaxy A35 5G', 'brand' => 'samsung', 'category' => 'midrange', 'description' => '6.6-inch 120Hz AMOLED, Exynos 1380, 50MP OIS camera, Gorilla Glass Victus Plus protection and 5000mAh battery', 'price' => 399.00],
			['name' => 'Galaxy A15 5G', 'brand' => 'samsung', 'category' => 'budget', 'description' => '6.5-inch 90Hz Super AMOLED, MediaTek Dimensity 6100 Plus, 50MP triple camera and 5000mAh battery with 25W charging', 'price' => 249.00],
			['name' => 'Galaxy M55 5G', 'brand' => 'samsung', 'category' => 'midrange', 'description' => '6.7-inch 120Hz AMOLED Plus, Snapdragon 7 Gen 1, 50MP OIS camera, 5000mAh battery and 45W charging in a slim body', 'price' => 379.00],
			['name' => 'Galaxy A05s', 'brand' => 'samsung', 'category' => 'budget', 'description' => '6.7-inch FHD+ 90Hz LCD, Snapdragon 680, 50MP triple camera and 5000mAh battery with 25W charging', 'price' => 159.00],
			['name' => 'iPhone 15 Pro Max', 'brand' => 'apple', 'category' => 'flagship', 'description' => '6.7-inch 120Hz LTPO Super Retina XDR, A17 Pro chip, 5x tetraprism telephoto, titanium frame, USB-C and up to 29-hour video playback rating', 'price' => 1199.00],
			['name' => 'iPhone 15 Pro', 'brand' => 'apple', 'category' => 'flagship', 'description' => '6.1-inch 120Hz LTPO display, A17 Pro, 48MP main plus 3x telephoto, Action button, USB-C and pro-grade video tools', 'price' => 999.00],
			['name' => 'iPhone 15 Plus', 'brand' => 'apple', 'category' => 'midrange', 'description' => '6.7-inch Super Retina XDR with Dynamic Island, A16 Bionic, 48MP main using 2x sensor crop, USB-C and 26-hour video rating', 'price' => 899.00],
			['name' => 'iPhone 15', 'brand' => 'apple', 'category' => 'midrange', 'description' => '6.1-inch Super Retina XDR with Dynamic Island, A16 Bionic, 48MP dual camera, crash detection and USB-C connectivity', 'price' => 799.00],
			['name' => 'iPhone 14 Pro', 'brand' => 'apple', 'category' => 'flagship', 'description' => '6.1-inch 120Hz LTPO Super Retina XDR, A16 Bionic, 48MP quad-pixel main camera, Dynamic Island UI and stainless steel frame', 'price' => 999.00],
			['name' => 'iPhone 14 Plus', 'brand' => 'apple', 'category' => 'midrange', 'description' => '6.7-inch OLED with ceramic shield, A15 Bionic 5-core GPU, crash detection, emergency SOS via satellite and excellent battery life', 'price' => 899.00],
			['name' => 'iPhone 14', 'brand' => 'apple', 'category' => 'midrange', 'description' => '6.1-inch OLED, A15 Bionic, dual 12MP cameras with Action Mode, crash detection and satellite SOS support', 'price' => 799.00],
			['name' => 'iPhone 13', 'brand' => 'apple', 'category' => 'midrange', 'description' => '6.1-inch OLED, A15 Bionic, Cinematic Mode 4K HDR, MagSafe accessories and 19-hour video playback rating', 'price' => 599.00],
			['name' => 'iPhone 13 mini', 'brand' => 'apple', 'category' => 'budget', 'description' => '5.4-inch OLED compact design, A15 Bionic, dual 12MP cameras with sensor-shift OIS and MagSafe charging', 'price' => 499.00],
			['name' => 'iPhone SE (3rd gen)', 'brand' => 'apple', 'category' => 'budget', 'description' => '4.7-inch Retina HD display, A15 Bionic with 5G, Touch ID home button, IP67 rating and 12MP camera with Smart HDR 4', 'price' => 429.00],
			['name' => 'Pixel 8 Pro', 'brand' => 'pixel', 'category' => 'flagship', 'description' => '6.7-inch LTPO Actua display at 120Hz, Google Tensor G3, 50MP GN2 main plus 48MP ultra-wide and 48MP 5x telephoto, 5050mAh battery and 7 years of updates', 'price' => 999.00],
			['name' => 'Pixel 8', 'brand' => 'pixel', 'category' => 'flagship', 'description' => '6.2-inch 120Hz Actua OLED, Tensor G3, 50MP dual camera with Macro Focus, 4575mAh battery and seven years of feature drops', 'price' => 699.00],
			['name' => 'Pixel 8a', 'brand' => 'pixel', 'category' => 'midrange', 'description' => '6.1-inch Actua OLED with 120Hz Smooth Display, Tensor G3, 64MP dual camera, 4492mAh battery and IP67 durability', 'price' => 499.00],
			['name' => 'Pixel Fold', 'brand' => 'pixel', 'category' => 'foldables', 'description' => '7.6-inch inner OLED plus 5.8-inch cover display at 120Hz, Tensor G2, triple camera with 5x telephoto and 4821mAh battery with 30W charging', 'price' => 1799.00],
			['name' => 'Pixel 7 Pro', 'brand' => 'pixel', 'category' => 'midrange', 'description' => '6.7-inch LTPO 120Hz OLED, Tensor G2, 50MP main plus 48MP 5x telephoto and 12MP ultra-wide with macro, 5000mAh battery', 'price' => 899.00],
			['name' => 'Pixel 7', 'brand' => 'pixel', 'category' => 'midrange', 'description' => '6.3-inch 90Hz OLED, Tensor G2, 50MP dual camera with Real Tone, Face Unlock and 4355mAh battery', 'price' => 599.00],
			['name' => 'Pixel 7a', 'brand' => 'pixel', 'category' => 'midrange', 'description' => '6.1-inch 90Hz OLED, Tensor G2, 64MP main with OIS, 13MP ultra-wide, 4385mAh battery and wireless charging support', 'price' => 499.00],
			['name' => 'Pixel 6a', 'brand' => 'pixel', 'category' => 'budget', 'description' => '6.1-inch OLED, Google Tensor, 12.2MP dual camera with Night Sight, Titan M2 security and 4410mAh battery', 'price' => 349.00],
			['name' => 'Pixel 5a 5G', 'brand' => 'pixel', 'category' => 'budget', 'description' => '6.34-inch OLED, Snapdragon 765G, 12.2MP dual camera with ultrawide, 4680mAh battery and IP67 resistance', 'price' => 449.00],
			['name' => 'Pixel 4a (5G)', 'brand' => 'pixel', 'category' => 'budget', 'description' => '6.2-inch OLED, Snapdragon 765G, 12.2MP main plus 16MP ultra-wide, 3885mAh battery and 3.5mm audio jack', 'price' => 499.00],
			['name' => 'OnePlus 12', 'brand' => 'oneplus', 'category' => 'flagship', 'description' => '6.82-inch LTPO 120Hz AMOLED, Snapdragon 8 Gen 3, 50MP LYT808 main plus 64MP 3x periscope, 5400mAh battery with 100W wired and 50W wireless charging', 'price' => 799.00],
			['name' => 'OnePlus 12R', 'brand' => 'oneplus', 'category' => 'midrange', 'description' => '6.78-inch LTPO 120Hz display, Snapdragon 8 Gen 2, 50MP IMX890 with OIS and 5500mAh battery with 100W SUPERVOOC', 'price' => 499.00],
			['name' => 'OnePlus Open', 'brand' => 'oneplus', 'category' => 'foldables', 'description' => '7.82-inch Flexi-fluid AMOLED plus 6.31-inch cover display at 120Hz, Snapdragon 8 Gen 2, Hasselblad tuned triple camera and 4805mAh battery with 67W charging', 'price' => 1699.00],
			['name' => 'OnePlus 11', 'brand' => 'oneplus', 'category' => 'flagship', 'description' => '6.7-inch LTPO3 120Hz AMOLED, Snapdragon 8 Gen 2, Hasselblad color science triple camera and 5000mAh battery with 100W charging', 'price' => 699.00],
			['name' => 'OnePlus 10T', 'brand' => 'oneplus', 'category' => 'flagship', 'description' => '6.7-inch 120Hz AMOLED, Snapdragon 8 Plus Gen 1, 150W SUPERVOOC Endurance Edition and up to 16GB RAM with Cryo-velocity cooling', 'price' => 599.00],
			['name' => 'OnePlus Nord 3 5G', 'brand' => 'oneplus', 'category' => 'midrange', 'description' => '6.74-inch 120Hz AMOLED, MediaTek Dimensity 9000, 50MP IMX890 with OIS and 5000mAh battery with 80W charging', 'price' => 499.00],
			['name' => 'OnePlus Nord CE 3 5G', 'brand' => 'oneplus', 'category' => 'midrange', 'description' => '6.7-inch 120Hz AMOLED, Snapdragon 782G, 50MP OIS camera, 5000mAh battery and 80W SUPERVOOC', 'price' => 399.00],
			['name' => 'OnePlus Nord CE 3 Lite 5G', 'brand' => 'oneplus', 'category' => 'budget', 'description' => '6.72-inch 120Hz LCD, Snapdragon 695, 108MP camera, stereo speakers and 5000mAh battery with 67W charging', 'price' => 299.00],
			['name' => 'OnePlus Nord N30 5G', 'brand' => 'oneplus', 'category' => 'budget', 'description' => '6.72-inch 120Hz LCD, Snapdragon 695, 50MP triple camera, 5000mAh battery with 50W SUPERVOOC and NFC', 'price' => 279.00],
			['name' => 'OnePlus Nord N20 SE', 'brand' => 'oneplus', 'category' => 'budget', 'description' => '6.56-inch LCD, MediaTek Helio G35, 50MP dual camera, 5000mAh battery with 33W SUPERVOOC and dual stereo speakers', 'price' => 169.00],
			['name' => 'Xiaomi 14 Ultra', 'brand' => 'xiaomi', 'category' => 'flagship', 'description' => '6.73-inch LTPO 120Hz AMOLED, Snapdragon 8 Gen 3, Leica quad 50MP cameras with variable aperture and 5300mAh battery with 90W wired plus 80W wireless charging', 'price' => 1299.00],
			['name' => 'Xiaomi 14', 'brand' => 'xiaomi', 'category' => 'flagship', 'description' => '6.36-inch LTPO 120Hz C8 display, Snapdragon 8 Gen 3, Leica Summilux triple 50MP cameras and 4610mAh battery with 90W charging', 'price' => 899.00],
			['name' => 'Xiaomi 13T Pro', 'brand' => 'xiaomi', 'category' => 'flagship', 'description' => '6.67-inch 144Hz AMOLED, MediaTek Dimensity 9200 Plus, Leica lenses, IP68 rating and 120W HyperCharge for 5000mAh battery', 'price' => 799.00],
			['name' => 'Xiaomi 13T', 'brand' => 'xiaomi', 'category' => 'midrange', 'description' => '6.67-inch 144Hz AMOLED, Dimensity 8200 Ultra, Leica dual 50MP cameras, 5000mAh battery and 67W turbo charging', 'price' => 599.00],
			['name' => 'Redmi Note 13 Pro Plus 5G', 'brand' => 'xiaomi', 'category' => 'midrange', 'description' => '6.67-inch 120Hz AMOLED, Dimensity 7200 Ultra, 200MP OIS main camera, 120W charging and IP68 body', 'price' => 429.00],
			['name' => 'Redmi Note 13 5G', 'brand' => 'xiaomi', 'category' => 'midrange', 'description' => '6.67-inch 120Hz AMOLED, Dimensity 6080, 108MP camera, 5000mAh battery with 33W fast charging', 'price' => 349.00],
			['name' => 'Redmi 12 5G', 'brand' => 'xiaomi', 'category' => 'budget', 'description' => '6.79-inch 90Hz LCD, Snapdragon 4 Gen 2, 50MP dual camera, 5000mAh battery and premium glass back', 'price' => 199.00],
			['name' => 'POCO F5 Pro', 'brand' => 'xiaomi', 'category' => 'flagship', 'description' => '6.67-inch WQHD+ 120Hz AMOLED, Snapdragon 8 Plus Gen 1, 64MP OIS camera, 5160mAh battery with 67W wired and 30W wireless charging', 'price' => 649.00],
			['name' => 'POCO X6 Pro', 'brand' => 'xiaomi', 'category' => 'midrange', 'description' => '6.67-inch 120Hz AMOLED, Dimensity 8300 Ultra, 64MP OIS camera, 5000mAh battery with 67W turbo charging and HyperOS', 'price' => 399.00],
			['name' => 'Redmi A3', 'brand' => 'xiaomi', 'category' => 'budget', 'description' => '6.71-inch 90Hz LCD, MediaTek Helio G36, 5000mAh battery, side fingerprint reader and vegan leather finish option', 'price' => 139.00],
			['name' => 'Xperia 1 VI', 'brand' => 'sony', 'category' => 'flagship', 'description' => '6.5-inch 120Hz LTPO OLED 21:9 display, Snapdragon 8 Gen 3, Exmor T 48MP zoom sensor, 5000mAh battery with wireless charging and pro camera apps', 'price' => 1399.00],
			['name' => 'Xperia 5 V', 'brand' => 'sony', 'category' => 'flagship', 'description' => '6.1-inch 120Hz OLED, Snapdragon 8 Gen 2, Exmor T 52MP dual camera, front stereo speakers and 5000mAh battery with wireless charging', 'price' => 999.00],
			['name' => 'Xperia 10 VI', 'brand' => 'sony', 'category' => 'midrange', 'description' => '6.1-inch OLED display, Snapdragon 6 Gen 1, 48MP dual camera with 2x sensor crop zoom and 5000mAh battery with 30W charging', 'price' => 499.00],
			['name' => 'Xperia 10 V', 'brand' => 'sony', 'category' => 'midrange', 'description' => '6.1-inch OLED, Snapdragon 695, 5000mAh battery, 48MP triple camera with OIS and IP65/68 durability', 'price' => 449.00],
			['name' => 'Xperia Pro-I', 'brand' => 'sony', 'category' => 'flagship', 'description' => '1-inch Exmor RS sensor with Zeiss optics, Snapdragon 888, 6.5-inch 120Hz OLED, dedicated shutter and HDMI external monitor tools', 'price' => 1799.00],
			['name' => 'Xperia 1 V', 'brand' => 'sony', 'category' => 'flagship', 'description' => '6.5-inch 4K 120Hz OLED, Snapdragon 8 Gen 2, stacked Exmor T 52MP main camera, 5000mAh battery and stereo audio gear', 'price' => 1299.00],
			['name' => 'Xperia 5 IV', 'brand' => 'sony', 'category' => 'flagship', 'description' => '6.1-inch 120Hz OLED, Snapdragon 8 Gen 1, triple 12MP cameras with Eye AF, 5000mAh battery and 30W fast plus wireless charging', 'price' => 949.00],
			['name' => 'Xperia 10 IV', 'brand' => 'sony', 'category' => 'midrange', 'description' => '6.0-inch OLED, Snapdragon 695, 5000mAh battery, 12MP triple camera and IP65/68 certification', 'price' => 429.00],
			['name' => 'Xperia Ace III', 'brand' => 'sony', 'category' => 'budget', 'description' => '5.5-inch HD+ LCD compact body, Snapdragon 480, 4500mAh battery, IP68 resistance and side fingerprint reader', 'price' => 299.00],
			['name' => 'Xperia L4', 'brand' => 'sony', 'category' => 'budget', 'description' => '6.2-inch 21:9 LCD, MediaTek Helio P22, triple rear camera, 3580mAh battery and fast charging via USB-C', 'price' => 249.00],
			['name' => 'Honor Magic6 Pro', 'brand' => 'honor', 'category' => 'flagship', 'description' => '6.8-inch LTPO 120Hz OLED, Snapdragon 8 Gen 3, 50MP variable aperture main plus 180MP periscope, 5600mAh silicon-carbon battery with 80W wired and 66W wireless charging', 'price' => 1299.00],
			['name' => 'Honor Magic6', 'brand' => 'honor', 'category' => 'flagship', 'description' => '6.78-inch LTPO OLED, Snapdragon 8 Gen 3, 50MP triple camera with 3x telephoto and 5450mAh battery with 66W SuperCharge', 'price' => 999.00],
			['name' => 'Honor Magic V2', 'brand' => 'honor', 'category' => 'foldables', 'description' => '7.92-inch inner OLED plus 6.43-inch cover, Snapdragon 8 Gen 2, 50MP triple camera, 5000mAh silicon-carbon battery and 66W fast charging in a 9.9mm folded body', 'price' => 1799.00],
			['name' => 'Honor Magic Vs2', 'brand' => 'honor', 'category' => 'foldables', 'description' => '7.92-inch foldable OLED, Snapdragon 8 Plus Gen 1, 50MP triple camera system, 5000mAh battery with 66W charging and lightweight 229g chassis', 'price' => 1699.00],
			['name' => 'Honor 90 Pro', 'brand' => 'honor', 'category' => 'midrange', 'description' => '6.78-inch 120Hz quad-curved AMOLED, Snapdragon 8 Plus Gen 1, 200MP main camera, 50MP selfie cam and 5000mAh battery with 90W charging', 'price' => 599.00],
			['name' => 'Honor 90', 'brand' => 'honor', 'category' => 'midrange', 'description' => '6.7-inch 120Hz AMOLED, Snapdragon 7 Gen 1 Accelerated Edition, 200MP camera system and 5000mAh battery with 66W SuperCharge', 'price' => 499.00],
			['name' => 'Honor X9b', 'brand' => 'honor', 'category' => 'midrange', 'description' => '6.78-inch 120Hz AMOLED with anti-drop cushioning, Snapdragon 6 Gen 1, 108MP camera and large 5800mAh battery', 'price' => 399.00],
			['name' => 'Honor X8b', 'brand' => 'honor', 'category' => 'budget', 'description' => '6.7-inch OLED, Snapdragon 6 Gen 1, 108MP triple camera, 4500mAh battery with 35W fast charging and 7.48mm profile', 'price' => 299.00],
			['name' => 'Honor 70 Lite', 'brand' => 'honor', 'category' => 'budget', 'description' => '6.5-inch 90Hz LCD, Snapdragon 480 Plus 5G, 50MP camera, 5000mAh battery and 22.5W fast charging', 'price' => 249.00],
			['name' => 'Honor Play 40', 'brand' => 'honor', 'category' => 'budget', 'description' => '6.56-inch 90Hz LCD, Snapdragon 480 Plus, 5200mAh battery, dual SIM 5G and MagicOS 7.1', 'price' => 199.00],
		];
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
