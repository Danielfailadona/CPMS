<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CrudController;
use App\Http\Controllers\AuthController;

// Public Routes
Route::get('/', function () {
    return view('login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/check-auth', [AuthController::class, 'checkAuth']);

// Protected Routes (require authentication)
Route::middleware(['auth'])->group(function () {
    // Dashboard Routes
    Route::get('/admin-dashboard', function () {
        return view('admin-dashboard');
    });
    
    Route::get('/client-dashboard', function () {
        return view('client-dashboard');
    });
    
    Route::get('/foreman-dashboard', function () {
        return view('foreman-dashboard');
    });
    
    Route::get('/ceo-dashboard', function () {
        return view('ceo-dashboard');
    });
    
    Route::get('/manager-dashboard', function () {
        return view('manager-dashboard');
    });
    
    Route::get('/worker-dashboard', function () {
        return view('worker-dashboard');
    });

    // Construction Report (your original page)
    Route::get('/construction-report', function () {
        return view('construction-report');
    });

    // File download route
Route::get('/download-file', function (Illuminate\Http\Request $request) {
    $filePath = $request->query('path');
    
    // DEBUG 1: Check if path parameter exists
    if (!$filePath) {
        return response()->json(['error' => 'DEBUG 1: File path is required', 'received_path' => $filePath], 400);
    }
    
    // DEBUG 2: Show what we're looking for
    $fullPath = storage_path('app/' . $filePath);
    
    // DEBUG 3: Check multiple possible locations
    $possiblePaths = [
        storage_path('app/' . $filePath),
        storage_path('app/uploads/' . basename($filePath)),
        storage_path('app/private/uploads/' . basename($filePath)),
        storage_path('app/public/' . $filePath)
    ];
    
    $foundPath = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $foundPath = $path;
            break;
        }
    }
    
    // DEBUG 4: Show all paths we checked
    if (!$foundPath) {
        return response()->json([
            'error' => 'DEBUG 4: File not found in any location',
            'requested_path' => $filePath,
            'full_path_tried' => $fullPath,
            'all_paths_checked' => $possiblePaths,
            'storage_app_contents' => scandir(storage_path('app')),
            'uploads_exists' => is_dir(storage_path('app/uploads')),
            'private_uploads_exists' => is_dir(storage_path('app/private/uploads'))
        ], 404);
    }
    
    // Get the original filename from the database if possible
    $filename = $request->query('filename', basename($filePath));
    
    return response()->download($foundPath, $filename);
})->middleware('auth')->name('file.download');


// Simple file upload test endpoint
Route::post('/upload-file-test', function (Illuminate\Http\Request $request) {
    $request->validate([
        'file' => 'required|file|max:10240', // 10MB max
    ]);
    
    if ($request->hasFile('file')) {
        $file = $request->file('file');
        $filename = 'test_' . time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('uploads', $filename, 'local');
        
        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'path' => $path,
            'filename' => $filename
        ]);
    }
    
    return response()->json(['success' => false, 'message' => 'No file uploaded'], 400);
})->middleware('auth');

    // GENERIC CRUD ROUTES FOR ANY TABLE
    Route::prefix('crud')->group(function () {
        Route::get('/{table}', [CrudController::class, 'index']);              // GET ALL records
        Route::get('/{table}/{id}', [CrudController::class, 'show']);          // GET ONE record
        Route::post('/{table}', [CrudController::class, 'store']);             // CREATE record
        Route::put('/{table}/{id}', [CrudController::class, 'update']);        // UPDATE record
        Route::delete('/{table}/{id}', [CrudController::class, 'destroy']);    // DELETE record
        Route::get('/{table}/columns/info', [CrudController::class, 'getColumns']); // GET table columns
    });
});