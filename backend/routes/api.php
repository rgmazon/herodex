<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HeroController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public hero routes
Route::get('/heroes',          [HeroController::class, 'index']);
Route::get('/heroes/search',   [HeroController::class, 'search']);
Route::get('/heroes/compare',  [HeroController::class, 'compare']);
Route::get('/heroes/{hero}',   [HeroController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Favorites
    Route::get('/favorites',              [FavoriteController::class, 'index']);
    Route::post('/favorites/{hero}',      [FavoriteController::class, 'store']);
    Route::delete('/favorites/{hero}',    [FavoriteController::class, 'destroy']);
    Route::get('/favorites/{hero}/check', [FavoriteController::class, 'check']);
});