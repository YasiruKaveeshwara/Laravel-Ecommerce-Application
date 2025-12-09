<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
	/**
	 * Register any application services.
	 */
	public function register(): void
	{
		//
	}

	/**
	 * Bootstrap any application services.
	 */
	public function boot(): void
	{
		// Cleaner API payloads (no "data" wrapper around resources)
		JsonResource::withoutWrapping();

		Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

		// Helpful during dev: catch accidental N+1s
		if (config('app.debug')) {
			Model::preventLazyLoading();
		}
	}
}
