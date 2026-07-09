<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HeroController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\SearchHistoryController;
use App\Http\Controllers\HeroTeamController;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Public hero routes
Route::get('/heroes',          [HeroController::class, 'index']);
Route::get('/heroes/search',   [HeroController::class, 'search']);
Route::get('/heroes/featured', [HeroController::class, 'featured']);
Route::get('/heroes/compare',  [HeroController::class, 'compare']);
Route::get('/heroes/{hero}',   [HeroController::class, 'show']);

// News
Route::get('/news', [NewsController::class, 'index']);

Route::get('/image-proxy', function (Illuminate\Http\Request $request) {
    $url = $request->query('url');

    if (!$url || !str_contains($url, 'superherodb.com')) {
        abort(400, 'Invalid image URL');
    }

    $response = Illuminate\Support\Facades\Http::withHeaders([
        'Referer' => 'https://www.superherodb.com',
        'User-Agent' => 'Mozilla/5.0',
    ])->get($url);

    if ($response->failed()) {
        abort(404, 'Image not found');
    }

    return response($response->body(), 200)
        ->header('Content-Type', $response->header('Content-Type'))
        ->header('Cache-Control', 'public, max-age=604800'); // cache 7 days
});

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
    // Search History
    Route::get('/search-history',    [SearchHistoryController::class, 'index']);
    Route::delete('/search-history', [SearchHistoryController::class, 'clear']);

    // Hero Teams
    Route::get('/teams',                                [HeroTeamController::class, 'index']);
    Route::post('/teams',                               [HeroTeamController::class, 'store']);
    Route::delete('/teams/{team}',                      [HeroTeamController::class, 'destroy']);
    Route::post('/teams/{team}/members/{hero}',         [HeroTeamController::class, 'addMember']);
    Route::delete('/teams/{team}/members/{hero}',       [HeroTeamController::class, 'removeMember']);
});