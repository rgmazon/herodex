<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use App\Services\SuperheroApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function __construct(
        protected SuperheroApiService $superheroService
    ) {}

    /**
     * Search heroes by name.
     * GET /api/heroes/search?q=batman
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $heroes = $this->superheroService->searchByName($request->q);

        if (empty($heroes)) {
            return response()->json([
                'message' => 'No heroes found.',
                'data'    => [],
            ]);
        }

        return response()->json([
            'data' => $heroes,
        ]);
    }

    /**
     * Get a single hero by slug.
     * GET /api/heroes/{slug}
     */
    public function show(string $slug): JsonResponse
    {
        $hero = Hero::where('slug', $slug)->first();

        if (! $hero) {
            return response()->json([
                'message' => 'Hero not found.',
            ], 404);
        }

        return response()->json([
            'data' => $hero,
        ]);
    }

    /**
     * Get all locally cached heroes (paginated).
     * GET /api/heroes
     */
    public function index(Request $request): JsonResponse
    {
        $heroes = Hero::query()
            ->when($request->publisher, fn ($q, $publisher) =>
                $q->where('publisher', $publisher)
            )
            ->when($request->alignment, fn ($q, $alignment) =>
                $q->where('alignment', $alignment)
            )
            ->orderBy('name')
            ->paginate(20);

        return response()->json($heroes);
    }

    /**
     * Compare two heroes side by side.
     * GET /api/heroes/compare?hero1=spider-man&hero2=batman
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'hero1' => ['required', 'string'],
            'hero2' => ['required', 'string'],
        ]);

        $hero1 = Hero::where('slug', $request->hero1)->first();
        $hero2 = Hero::where('slug', $request->hero2)->first();

        if (! $hero1 || ! $hero2) {
            return response()->json([
                'message' => 'One or both heroes not found. Search for them first to cache them locally.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'hero1' => $hero1,
                'hero2' => $hero2,
            ],
        ]);
    }

    /**
     * Return 10 random heroes for the homepage featured section.
     * GET /api/heroes/featured
     */
    public function featured(): JsonResponse
    {
        $heroes = Hero::inRandomOrder()->limit(10)->get();

        return response()->json([
            'data' => $heroes,
        ]);
    }
}