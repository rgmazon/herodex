<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hero_team_id')->constrained('hero_teams')->cascadeOnDelete();
            $table->foreignId('hero_id')->constrained('heroes')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['hero_team_id', 'hero_id']); // no duplicate hero in the same team
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};