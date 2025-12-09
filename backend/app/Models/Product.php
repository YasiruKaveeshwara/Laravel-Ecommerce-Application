<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
	use HasFactory, HasUuids;

	protected $fillable = [
		'name',
		'brand',
		'category',
		'description',
		'price',
		'image_path',
		'original_image_path',
	];

	protected $casts = [
		'price' => 'decimal:2',
	];

	// Public URL for the optimized image (gracefully builds absolute URLs even without storage:link)
	public function getImageUrlAttribute(): ?string
	{
		if (! $this->image_path) {
			return null;
		}

		$rawUrl = Storage::disk('public')->url($this->image_path);
		$path = parse_url($rawUrl, PHP_URL_PATH) ?: $rawUrl;

		$host = request()?->getSchemeAndHttpHost()
			?: (config('app.url') ?: null);

		if ($host) {
			return rtrim($host, '/') . '/' . ltrim($path, '/');
		}

		return url($path);
	}

	protected $appends = [
		'image_url',
	];
}
