<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchHistoryController extends Controller
{
    /**
     * List the authenticated user's recent searches.
     * GET /api/search-history
     */
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
            ->searchHistory()
            ->orderByDesc('searched_at')
            ->limit(20)
            ->get(['id', 'keyword', 'searched_at']);

        return response()->json([
            'data' => $history,
        ]);
    }

    /**
     * Clear all search history for the authenticated user.
     * DELETE /api/search-history
     */
    public function clear(Request $request): JsonResponse
    {
        $request->user()->searchHistory()->delete();

        return response()->json([
            'message' => 'Search history cleared.',
        ]);
    }
}