<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
  // Laravel 11+/12 resolves the application via bootstrap/app.php automatically
}
