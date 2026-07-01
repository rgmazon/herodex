<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * List the authenticated user's favorite heroes.
     * GET /api/favorites
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->orderByPivot('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $favorites,
        ]);
    }

    /**
     * Add a hero to favorites.
     * POST /api/favorites/{hero}
     */
    public function store(Request $request, Hero $hero): JsonResponse
    {
        $user = $request->user();

        // Prevent duplicates — check before attaching
        if ($user->favorites()->where('hero_id', $hero->id)->exists()) {
            return response()->json([
                'message' => 'Hero is already in your favorites.',
            ], 409);
        }

        $user->favorites()->attach($hero);

        return response()->json([
            'message' => 'Hero added to favorites.',
            'data'    => $hero,
        ], 201);
    }

    /**
     * Remove a hero from favorites.
     * DELETE /api/favorites/{hero}
     */
    public function destroy(Request $request, Hero $hero): JsonResponse
    {
        $user = $request->user();

        if (! $user->favorites()->where('hero_id', $hero->id)->exists()) {
            return response()->json([
                'message' => 'Hero is not in your favorites.',
            ], 404);
        }

        $user->favorites()->detach($hero);

        return response()->json([
            'message' => 'Hero removed from favorites.',
        ]);
    }

    /**
     * Check if a specific hero is favorited by the authenticated user.
     * GET /api/favorites/{hero}/check
     */
    public function check(Request $request, Hero $hero): JsonResponse
    {
        $isFavorited = $request->user()
            ->favorites()
            ->where('hero_id', $hero->id)
            ->exists();

        return response()->json([
            'favorited' => $isFavorited,
        ]);
    }
}