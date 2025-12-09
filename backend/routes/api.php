<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\RoleMiddleware;

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
Route::post('/products/detail', [ProductController::class, 'detail'])->name('products.detail');
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

// -------- Authenticated (token) --------
Route::middleware('auth:sanctum')->group(function () {

	// session-like helpers for the client
	Route::get('/me',     [AuthController::class, 'me'])->name('auth.me');
	Route::put('/me',     [AuthController::class, 'updateProfile'])->name('auth.me.update');
	Route::delete('/me',  [AuthController::class, 'destroyProfile'])->name('auth.me.destroy');
	Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

	// Customer orders
	Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
	Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

	// -------- Admin-only --------
	Route::middleware(RoleMiddleware::class . ':administrator')->group(function () {

		// Users CRUD
		Route::apiResource('users', UserController::class);

		// Products listing/detail for backoffice
		Route::get('admin/products', [ProductController::class, 'adminIndex'])->name('admin.products.index');
		Route::get('admin/products/{product}', [ProductController::class, 'adminShow'])->name('admin.products.show');
		Route::post('admin/products/detail', [ProductController::class, 'adminDetail'])->name('admin.products.detail');

		// Orders listing for admins
		Route::get('admin/orders', [OrderController::class, 'adminIndex'])->name('admin.orders.index');
		Route::get('admin/orders/{order}', [OrderController::class, 'show'])->name('admin.orders.show');

		// Products (admin ops only; public list/show above)
		Route::apiResource('admin/products', ProductController::class)
			->only(['store', 'update', 'destroy']);
	});
});
