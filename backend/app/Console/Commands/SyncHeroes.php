<?php

namespace App\Console\Commands;

use App\Services\SuperheroApiService;
use Illuminate\Console\Command;

class SyncHeroes extends Command
{
    protected $signature = 'heroes:sync';
    protected $description = 'Fetch all heroes from the akabab Superhero API and upsert into local DB';

    public function handle(SuperheroApiService $service): int
    {
        $this->info('Fetching all heroes from API...');

        $count = $service->syncAll();

        $this->info("Done! {$count} heroes synced.");

        return Command::SUCCESS;
    }
}