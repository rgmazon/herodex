<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class SearchHistory extends Model
{
    protected $table = 'search_history'; // override Laravel's auto-pluralization

    public $timestamps = false;

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