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

    // optional embedded watermark tiled across the image (Puls Mobile branding)
    if ($watermark) {
      // larger, higher-contrast tiled watermark for clarity
      $fontSize = (int) max(36, min($img->width(), $img->height()) * 0.1);
      $step = (int) max(220, $fontSize * 2.6);
      $angle = -18;

      // tile watermark text diagonally so it is baked into the saved image (not an overlay layer)
      for ($y = -$step; $y < $img->height() + $step; $y += $step) {
        for ($x = -$step; $x < $img->width() + $step; $x += $step) {
          $img->text('Puls Mobile', $x, $y, function ($font) use ($fontSize, $angle) {
            $font->size($fontSize);
            // slightly higher opacity for legibility, plus shadow stroke via darker outline pass
            $font->color('rgba(255,255,255,0.48)');
            $font->align('left');
            $font->valign('top');
            $font->angle($angle);
          });
          // subtle shadow/outline to make the text read on bright areas
          $img->text('Puls Mobile', $x + 2, $y + 2, function ($font) use ($fontSize, $angle) {
            $font->size($fontSize);
            $font->color('rgba(0,0,0,0.28)');
            $font->align('left');
            $font->valign('top');
            $font->angle($angle);
          });
        }
      }
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
  public function replace(
    ?UploadedFile $file,
    ?string $currentOptimized,
    ?string $currentOriginal,
    string $folder = 'products',
    bool $watermark = true
  ): array {
    if (!$file) {
      return [
        'image_path' => $currentOptimized,
        'original_image_path' => $currentOriginal,
      ];
    }

    // process new first; only delete old after successful save to avoid losing images on failure
    $newPaths = $this->processAndStore($file, $folder, watermark: $watermark);

    $this->delete($currentOptimized);
    $this->delete($currentOriginal);

    return $newPaths;
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
