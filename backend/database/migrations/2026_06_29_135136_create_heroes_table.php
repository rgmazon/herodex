<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('heroes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('external_id')->unique(); // SuperHero API's own ID
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('publisher')->nullable();
            $table->string('alignment')->nullable();
            $table->string('image_url')->nullable();

            // Biography
            $table->string('full_name')->nullable();
            $table->text('aliases')->nullable(); // store as JSON-encoded array
            $table->string('place_of_birth')->nullable();
            $table->string('first_appearance')->nullable();

            // Appearance
            $table->string('gender')->nullable();
            $table->string('race')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();

            // Work
            $table->string('occupation')->nullable();

            // Power stats
            $table->unsignedTinyInteger('intelligence')->nullable();
            $table->unsignedTinyInteger('strength')->nullable();
            $table->unsignedTinyInteger('speed')->nullable();
            $table->unsignedTinyInteger('durability')->nullable();
            $table->unsignedTinyInteger('combat')->nullable();
            $table->unsignedTinyInteger('power')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('heroes');
    }
};