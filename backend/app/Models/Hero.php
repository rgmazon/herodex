<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\TeamMember;

class Hero extends Model
{
    protected $fillable = [
        'external_id',
        'name',
        'slug',
        'publisher',
        'alignment',
        'image_url',
        'full_name',
        'aliases',
        'place_of_birth',
        'first_appearance',
        'gender',
        'race',
        'height',
        'weight',
        'occupation',
        'intelligence',
        'strength',
        'speed',
        'durability',
        'combat',
        'power',
    ];

    protected $casts = [
        'aliases' => 'array', // auto JSON-encode/decode
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }
}