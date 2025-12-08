<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
  /**
   * Process (resize, watermark) and store an uploaded image.
   * Returns ['image_path' => 'products/abc.jpg', 'original_image_path' => 'products/original_abc.jpg']
   */
  public function processAndStore(UploadedFile $file, string $folder = 'products', bool $watermark = true): array
  {
    // filenames
    $name = Str::uuid() . '.jpg';
    $original = "{$folder}/original_{$name}";
    $optimized = "{$folder}/{$name}";

    // store original (verbatim) in public disk so we can serve it later
    Storage::disk('public')->put($original, file_get_contents($file->getRealPath()));

    // read, scale
    $img = Image::read($file->getRealPath())
      ->scaleDown(1600);               // keep large enough for web but not huge

    // optional text watermark (simple + robust cross-platform)
    if ($watermark) {
      $img->text('© Your Brand', 20, 36, function ($font) {
        $font->size(28);
        $font->color('rgba(255,255,255,0.65)');
        $font->align('left');
        $font->valign('top');
      });
    }

    // store optimized on public disk (encode after all manipulations)
    Storage::disk('public')->put($optimized, (string) $img->encodeByExtension('jpg', 85));  // quality 85

    return [
      'image_path' => $optimized,
      'original_image_path' => $original,
    ];
  }

  /**
   * Replace an existing image (if $file provided).
   * Deletes existing optimized/original, returns new paths OR the previous paths if no new file.
   */
  public function replace(?UploadedFile $file, ?string $currentOptimized, ?string $currentOriginal, string $folder = 'products'): array
  {
    if (!$file) {
      return [
        'image_path' => $currentOptimized,
        'original_image_path' => $currentOriginal,
      ];
    }

    // delete old ones (ignore errors)
    $this->delete($currentOptimized);
    $this->delete($currentOriginal);

    return $this->processAndStore($file, $folder);
  }

  /**
   * Delete a file on the public disk (safe if null or missing).
   */
  public function delete(?string $path): void
  {
    if ($path && Storage::disk('public')->exists($path)) {
      Storage::disk('public')->delete($path);
    }
  }
}
