<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Show login form
    public function showLogin()
    {
        return view('login');
    }

    // Handle login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Check if user is authorized to login
            if (!$user->is_authorized) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is pending authorization. Please contact administrator.'
                ], 403);
            }
            
            // Check if user is active
            if (!$user->is_active) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been deactivated.'
                ], 403);
            }

            $request->session()->regenerate();
            return response()->json([
                'success' => true,
                'message' => 'Login successful!',
                'user_type' => $user->user_type // Send user type to frontend
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials.'
        ], 401);
    }

    // Handle registration
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'user_type' => 'required|in:client,foreman,ceo,manager,staff', // Admin excluded
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'user_type' => $validated['user_type'],
            'password' => Hash::make($validated['password']),
            'is_authorized' => false, // All registered accounts unauthorized by default
            'authorization_notes' => 'Pending admin approval'
        ]);

        // Don't log them in automatically - they need authorization first
        // Auth::login($user); // REMOVE THIS LINE

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Your account is pending authorization.'
        ]);
    }

    // Handle logout
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully!'
        ]);
    }

    // Check if user is logged in
    public function checkAuth()
    {
        return response()->json([
            'authenticated' => Auth::check(),
            'user' => Auth::user()
        ]);
    }

    // Get current user info
    public function getCurrentUser()
    {
        if (Auth::check()) {
            return response()->json([
                'success' => true,
                'user' => Auth::user()
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Not authenticated'
        ], 401);
    }
}