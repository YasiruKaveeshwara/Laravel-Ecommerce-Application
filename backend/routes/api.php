<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Prefix: /api
| Guard: use auth:sanctum for protected routes
| Role:   role:administrator for admin-only
*/

// -------- Public (no auth) --------
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

Route::get('/products',        [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

// -------- Authenticated (token) --------
Route::middleware('auth:sanctum')->group(function () {

	// session-like helpers for the client
	Route::get('/me',     [AuthController::class, 'me'])->name('auth.me');
	Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

	// -------- Admin-only --------
	Route::middleware('role:administrator')->group(function () {

		// Users CRUD
		Route::apiResource('users', UserController::class);

		// Products listing/detail for backoffice
		Route::get('admin/products', [ProductController::class, 'adminIndex'])->name('admin.products.index');
		Route::get('admin/products/{product}', [ProductController::class, 'adminShow'])->name('admin.products.show');

		// Products (admin ops only; public list/show above)
		Route::apiResource('admin/products', ProductController::class)
			->only(['store', 'update', 'destroy']);
	});
});
