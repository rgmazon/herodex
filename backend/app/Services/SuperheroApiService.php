<?php

namespace App\Services;

use App\Models\Hero;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SuperheroApiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.superhero_api.base_url');
    }

    /**
     * Fetch all 731 heroes from the API and upsert into local DB.
     * Run this once to seed, or periodically to refresh.
     */
    public function syncAll(): int
    {
        $response = Http::timeout(30)->get("{$this->baseUrl}/all.json");

        if ($response->failed()) {
            Log::error('SuperheroApiService::syncAll failed to fetch /all.json');
            return 0;
        }

        $heroes = $response->json();
        $count = 0;

        foreach ($heroes as $data) {
            try {
                $this->upsertHero($data);
                $count++;
            } catch (\Throwable $e) {
                Log::error('SuperheroApiService::syncAll upsert failed', [
                    'id'    => $data['id'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $count;
    }

    /**
     * Search locally cached heroes by name (case-insensitive).
     */
    public function searchByName(string $name): array
    {
        return Hero::where('name', 'ilike', "%{$name}%")
            ->orderBy('name')
            ->get()
            ->all();
    }

    /**
     * Find a single hero by external ID — local only.
     */
    public function findByExternalId(int $externalId): ?Hero
    {
        return Hero::where('external_id', $externalId)->first();
    }

    /**
     * Transform akabab API response into our Hero schema and upsert.
     */
    protected function upsertHero(array $data): Hero
    {
        $name = $data['name'];

        return Hero::updateOrCreate(
            ['external_id' => (int) $data['id']],
            [
                'name'             => $name,
                'slug'             => Str::slug($name),
                'image_url'        => $data['images']['md'] ?? null,

                // Biography — camelCase now
                'publisher'        => $data['biography']['publisher'] ?? null,
                'alignment'        => $data['biography']['alignment'] ?? null,
                'full_name'        => $data['biography']['fullName'] ?? null,
                'aliases'          => $data['biography']['aliases'] ?? [],
                'place_of_birth'   => $data['biography']['placeOfBirth'] ?? null,
                'first_appearance' => $data['biography']['firstAppearance'] ?? null,

                // Appearance
                'gender'           => $data['appearance']['gender'] ?? null,
                'race'             => $data['appearance']['race'] ?? null,
                'height'           => $data['appearance']['height'][1] ?? null,
                'weight'           => $data['appearance']['weight'][1] ?? null,

                // Work
                'occupation'       => $data['work']['occupation'] ?? null,

                // Powerstats — already integers in this API
                'intelligence'     => $data['powerstats']['intelligence'] ?? null,
                'strength'         => $data['powerstats']['strength'] ?? null,
                'speed'            => $data['powerstats']['speed'] ?? null,
                'durability'       => $data['powerstats']['durability'] ?? null,
                'combat'           => $data['powerstats']['combat'] ?? null,
                'power'            => $data['powerstats']['power'] ?? null,
            ]
        );
    }
}