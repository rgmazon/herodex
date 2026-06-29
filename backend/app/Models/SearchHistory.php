<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class SearchHistory extends Model
{
    public $timestamps = false; // we use searched_at instead

    protected $fillable = [
        'user_id',
        'keyword',
        'searched_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}