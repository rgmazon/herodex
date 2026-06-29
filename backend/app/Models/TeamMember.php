<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\HeroTeam;
use App\Models\Hero;

class TeamMember extends Model
{
    protected $fillable = [
        'hero_team_id',
        'hero_id',
    ];

    public function heroTeam(): BelongsTo
    {
        return $this->belongsTo(HeroTeam::class);
    }

    public function hero(): BelongsTo
    {
        return $this->belongsTo(Hero::class);
    }
}