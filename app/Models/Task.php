<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'worker_id',
        'foreman_id',
        'foreman_notes',
        'completed_at'
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function foreman()
    {
        return $this->belongsTo(User::class, 'foreman_id');
    }
}