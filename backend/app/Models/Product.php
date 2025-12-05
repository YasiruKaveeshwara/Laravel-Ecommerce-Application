<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
	use HasFactory;

	protected $fillable = [
		'name',
		'description',
		'price',
		'image_path',
		'original_image_path',
	];

	protected $casts = [
		'price' => 'decimal:2',
	];

	// Public URL for the optimized image (requires `php artisan storage:link`)
	public function getImageUrlAttribute(): ?string
	{
		return $this->image_path
			? Storage::url($this->image_path)
			: null;
	}

	protected $appends = [
		'image_url',
	];
}
