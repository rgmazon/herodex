<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use App\Services\SuperheroApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

        // Log search history for authenticated users
        $user = auth('sanctum')->user();
        if ($user) {
            \App\Models\User::find($user->id)?->searchHistory()->create([
                'keyword'     => $request->q,
                'searched_at' => now(),
            ]);
        }

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

    /**
     * Fetch Wikipedia summary for a hero.
     * GET /api/heroes/{slug}/wiki
     */
    public function wiki(Hero $hero): JsonResponse
    {
        $cacheKey = "wiki_{$hero->slug}";

        $data = Cache::remember($cacheKey, now()->addHours(24), function () use ($hero) {
            $headers = ['User-Agent' => 'HeroDex/1.0 (https://herodex-vert.vercel.app)'];

            // Build a list of title variants to try
            $variants = array_unique(array_filter([
                $hero->name,
                // Add period after common honorifics
                preg_replace('/\b(Mr|Mrs|Ms|Dr|St)\b/', '$1.', $hero->name),
                $hero->full_name,
            ]));

            foreach ($variants as $variant) {
                $title = str_replace(' ', '_', $variant);
                $response = Http::withHeaders($headers)
                    ->get("https://en.wikipedia.org/api/rest_v1/page/summary/{$title}");

                if ($response->failed()) continue;
                if ($response->status() === 404) continue;

                $json = $response->json();
                if (($json['type'] ?? '') === 'disambiguation') continue;
                if (!isset($json['extract'])) continue;

                return [
                    'extract'   => $json['extract'],
                    'url'       => $json['content_urls']['desktop']['page'] ?? null,
                    'thumbnail' => $json['thumbnail']['source'] ?? null,
                ];
            }

            return null;
        });

        if (!$data) {
            return response()->json(['message' => 'No Wikipedia article found.'], 404);
        }

        return response()->json(['data' => $data]);
    }
}