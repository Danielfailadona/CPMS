<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController; // Add this line

Route::get('/', function () {
    return view('welcome');
});

// ADD YOUR NEW ROUTES BELOW THE EXISTING ONES
Route::get('/construction-report', function () {
    return view('construction-report');
});

Route::post('/create-user', [UserController::class, 'store'])->name('create.user');
Route::get('/get-users', [UserController::class, 'index'])->name('get.users');