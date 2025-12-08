<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
	return response()->json([
		'app'     => config('app.name'),
		'version' => app()->version(),
		'status'  => 'ok',
	]);
})->name('health');

Route::get('/storage/{path}', function (string $path) {
	$publicRoot = realpath(storage_path('app/public'));
	$requested  = realpath(storage_path('app/public/' . $path));

	if (! $publicRoot || ! $requested || strncmp($requested, $publicRoot, strlen($publicRoot)) !== 0 || ! File::exists($requested)) {
		abort(404);
	}

	return response()->file($requested);
})->where('path', '.*')->name('storage.proxy');
