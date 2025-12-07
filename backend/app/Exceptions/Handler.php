<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
  /**
   * A list of the exception types that are not reported.
   */
  protected $dontReport = [
    // You can keep this empty; Laravel handles sensible defaults.
  ];

  /**
   * Render an exception into an HTTP response.
   */
  public function render($request, Throwable $e)
  {
    // For browser-ish requests, use the default HTML responses.
    if (! $request->expectsJson()) {
      return parent::render($request, $e);
    }

    // Validation (422)
    if ($e instanceof ValidationException) {
      return $this->error(
        message: 'Validation failed.',
        status: 422,
        type: 'validation_error',
        details: ['errors' => $e->errors()]
      );
    }

    // Auth (401)
    if ($e instanceof AuthenticationException) {
      return $this->error('Unauthenticated.', 401, 'unauthenticated');
    }

    // Forbidden (403)
    if ($e instanceof AuthorizationException) {
      return $this->error('Forbidden.', 403, 'forbidden');
    }

    // Route/model not found (404)
    if ($e instanceof NotFoundHttpException || $e instanceof ModelNotFoundException) {
      return $this->error('Not found.', 404, 'not_found');
    }

    // Method not allowed (405)
    if ($e instanceof MethodNotAllowedHttpException) {
      return $this->error('Method not allowed.', 405, 'method_not_allowed');
    }

    // Too Many Requests (429)
    if ($e instanceof ThrottleRequestsException) {
      return $this->error('Too many requests.', 429, 'rate_limited');
    }

    // Database (hide internals)
    if ($e instanceof QueryException) {
      return $this->error('Database error.', 500, 'database_error');
    }

    // Symfony/Laravel HTTP exceptions (honor their status code)
    if ($e instanceof HttpExceptionInterface) {
      $status = $e->getStatusCode();
      $message = $e->getMessage() ?: 'HTTP error.';
      return $this->error($message, $status, 'http_error');
    }

    // Fallback 500 (hide stack unless APP_DEBUG=true)
    if (config('app.debug')) {
      // In debug, let Laravel show the detailed JSON (helpful in dev)
      return parent::render($request, $e);
    }

    return $this->error('Server error.', 500, 'server_error');
  }

  /**
   * Standard JSON envelope for API errors.
   */
  private function error(string $message, int $status, string $type, array $details = null)
  {
    $payload = [
      'error' => [
        'type'    => $type,
        'message' => $message,
        'status'  => $status,
      ],
    ];

    if ($details) {
      $payload['error']['details'] = $details;
    }

    // Optional: include a request id header if you add such middleware.
    return response()->json($payload, $status);
  }
}
