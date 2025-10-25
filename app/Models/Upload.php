<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Upload extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'file_path',
        'file_size',
        'mime_type',
        'upload_type',
        'title',
        'description',
        'user_id',
        'project_id',
        'task_id',
        'is_public',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Upload type constants for easy reference
     */
    const UPLOAD_TYPES = [
        'task' => 'Task Related',
        'image' => 'Image/Photo',
        'report' => 'Report',
        'document' => 'Document',
        'blueprint' => 'Blueprint/Plan',
        'invoice' => 'Invoice',
        'contract' => 'Contract',
        'safety' => 'Safety Document',
        'inspection' => 'Inspection Report',
        'other' => 'Other'
    ];

    /**
     * Get the user who uploaded the file
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the associated project
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the associated task
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get upload type as readable label
     */
    public function getUploadTypeLabel(): string
    {
        return self::UPLOAD_TYPES[$this->upload_type] ?? ucfirst($this->upload_type);
    }

    /**
     * Check if file is an image
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if file is a PDF
     */
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    /**
     * Get file extension
     */
    public function getExtension(): string
    {
        return pathinfo($this->filename, PATHINFO_EXTENSION);
    }

    /**
     * Scope for specific upload types
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('upload_type', $type);
    }

    /**
     * Scope for public files
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for user's files
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}