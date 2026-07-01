<?php

namespace App\Services;

use App\Models\Hero;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SuperheroApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.superhero_api.base_url');
        $this->apiKey  = config('services.superhero_api.key');
    }

    /**
     * Find a hero by name — checks local cache first,
     * falls back to SuperHero API on a miss.
     * Returns an array of Hero models (search can return multiple).
     */
    public function searchByName(string $name): array
    {
        // Check local cache first — return all heroes whose name
        // contains the search term (case-insensitive)
        $cached = Hero::where('name', 'ilike', "%{$name}%")->get();

        if ($cached->isNotEmpty()) {
            return $cached->all();
        }

        // Cache miss — hit the external API
        $response = Http::get("{$this->baseUrl}/{$this->apiKey}/search/{$name}");

        if ($response->failed() || $response->json('response') === 'error') {
            return [];
        }

        $results = $response->json('results') ?? [];

        $heroes = [];
        foreach ($results as $data) {
            $heroes[] = $this->upsertHero($data);
        }

        return array_filter($heroes); // remove any nulls from failed upserts
    }

    /**
     * Find a single hero by their SuperHero API ID.
     * Checks local cache first, falls back to API on a miss.
     */
    public function findByExternalId(int $externalId): ?Hero
    {
        // Check local cache first
        $cached = Hero::where('external_id', $externalId)->first();

        if ($cached) {
            return $cached;
        }

        // Cache miss — hit the external API
        $response = Http::get("{$this->baseUrl}/{$this->apiKey}/{$externalId}");

        if ($response->failed() || $response->json('response') === 'error') {
            return null;
        }

        return $this->upsertHero($response->json());
    }

    /**
     * Transform raw API response into our Hero schema and save/update it.
     * Uses updateOrCreate so re-fetching the same hero is always safe.
     */
    protected function upsertHero(array $data): ?Hero
    {
        try {
            $externalId = (int) $data['id'];

            return Hero::updateOrCreate(
                ['external_id' => $externalId],
                [
                    'name'             => $data['name'],
                    'slug'             => Str::slug($data['name']),
                    'image_url'        => $data['image']['url'] ?? null,

                    // Biography
                    'publisher'        => $data['biography']['publisher'] ?? null,
                    'alignment'        => $data['biography']['alignment'] ?? null,
                    'full_name'        => $data['biography']['full-name'] ?? null,
                    'aliases'          => $data['biography']['aliases'] ?? [],
                    'place_of_birth'   => $data['biography']['place-of-birth'] ?? null,
                    'first_appearance' => $data['biography']['first-appearance'] ?? null,

                    // Appearance
                    'gender'           => $data['appearance']['gender'] ?? null,
                    'race'             => $data['appearance']['race'] ?? null,
                    'height'           => $data['appearance']['height'][1] ?? null, // index 1 = metric
                    'weight'           => $data['appearance']['weight'][1] ?? null, // index 1 = metric

                    // Work
                    'occupation'       => $data['work']['occupation'] ?? null,

                    // Power stats — API returns strings, cast to int (null-safe)
                    'intelligence'     => $this->parseStat($data['powerstats']['intelligence'] ?? null),
                    'strength'         => $this->parseStat($data['powerstats']['strength'] ?? null),
                    'speed'            => $this->parseStat($data['powerstats']['speed'] ?? null),
                    'durability'       => $this->parseStat($data['powerstats']['durability'] ?? null),
                    'combat'           => $this->parseStat($data['powerstats']['combat'] ?? null),
                    'power'            => $this->parseStat($data['powerstats']['power'] ?? null),
                ]
            );
        } catch (\Throwable $e) {
            \Log::error('SuperheroApiService::upsertHero failed', [
                'external_id' => $data['id'] ?? 'unknown',
                'error'       => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Safely parse a powerstats value.
     * The API returns "null" as a literal string for unknown stats.
     */
    protected function parseStat(mixed $value): ?int
    {
        if ($value === null || $value === 'null' || $value === '') {
            return null;
        }

        return (int) $value;
    }
}