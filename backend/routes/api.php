<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HeroController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public hero routes
Route::get('/heroes',              [HeroController::class, 'index']);
Route::get('/heroes/search',       [HeroController::class, 'search']);
Route::get('/heroes/compare',      [HeroController::class, 'compare']);
Route::get('/heroes/{slug}',       [HeroController::class, 'show']);

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});