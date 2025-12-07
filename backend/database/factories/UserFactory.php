<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
	protected $model = User::class;

	public function definition(): array
	{
		return [
			'first_name' => $this->faker->firstName(),
			'last_name'  => $this->faker->lastName(),
			'email'      => $this->faker->unique()->safeEmail(),
			'password'   => 'password', // auto-hashed by model cast
			'role'       => User::ROLE_CUSTOMER,
			'remember_token' => Str::random(10),
		];
	}

	public function admin(): static
	{
		return $this->state(fn() => ['role' => User::ROLE_ADMIN]);
	}

	public function customer(): static
	{
		return $this->state(fn() => ['role' => User::ROLE_CUSTOMER]);
	}
}
