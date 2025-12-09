<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
	use HasApiTokens, HasFactory, Notifiable, HasUuids;

	public const ROLE_ADMIN       = 'administrator';
	public const ROLE_CUSTOMER    = 'customer';

	protected $fillable = [
		'first_name',
		'last_name',
		'email',
		'password',
		'role',
	];

	protected $hidden = [
		'password',
		'remember_token',
	];

	protected $casts = [
		// Automatically hash when setting $user->password
		'password' => 'hashed',
	];

	// Convenience: "Admin" check
	public function isAdmin(): bool
	{
		return $this->role === self::ROLE_ADMIN;
	}

	// Convenience: full name
	public function getFullNameAttribute(): string
	{
		return trim($this->first_name . ' ' . $this->last_name);
	}

	protected $appends = [
		'full_name',
	];
}
