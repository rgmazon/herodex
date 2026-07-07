<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NewsController extends Controller
{
    /**
     * Fetch superhero-related news, cached for 6 hours.
     * GET /api/news
     */
    public function index(): JsonResponse
    {
        $news = Cache::remember('superhero_news', now()->addHours(6), function () {
            $response = Http::get(config('services.newsapi.base_url') . '/everything', [
                'q'        => 'superhero OR marvel OR "dc comics" OR "comic book"',
                'language' => 'en',
                'sortBy'   => 'publishedAt',
                'pageSize' => 12,
                'apiKey'   => config('services.newsapi.key'),
            ]);

            if ($response->failed()) {
                return [];
            }

            $articles = $response->json('articles') ?? [];

            // Filter out articles with missing images or "[Removed]" content
            return collect($articles)
                ->filter(fn ($a) =>
                    !empty($a['urlToImage']) &&
                    !empty($a['title']) &&
                    $a['title'] !== '[Removed]' &&
                    !empty($a['url'])
                )
                ->values()
                ->map(fn ($a) => [
                    'title'       => $a['title'],
                    'description' => $a['description'] ?? null,
                    'image'       => $a['urlToImage'],
                    'url'         => $a['url'],
                    'source'      => $a['source']['name'] ?? 'Unknown',
                    'published_at' => $a['publishedAt'] ?? null,
                ])
                ->toArray();
        });

        return response()->json([
            'data' => $news,
        ]);
    }
}