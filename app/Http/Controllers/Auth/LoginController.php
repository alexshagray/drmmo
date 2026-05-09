<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class LoginController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required',
        ]);

        $user = User::where('name', $validated['username'])->first();

        if (!$user || !Auth::attempt(['email' => $user->email, 'password' => $validated['password']])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'The provided credentials do not match our records.'], 401);
            }
            return back()->withErrors([
                'username' => 'The provided credentials do not match our records.',
            ]);
        }

        // Check if user is approved (for mobile users)
        if ($user->role === 'mobile' && !$user->is_approved) {
            Auth::logout();
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account is pending admin approval. Please wait for approval.'], 403);
            }
            return back()->withErrors([
                'username' => 'Your account is pending admin approval. Please wait for approval.',
            ]);
        }

        // For approved users, return success immediately without OTP
        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'role' => $user->role,
                ]
            ], 200);
        }

        // For web users, still require OTP
        Session::put('otp_user_id', $user->id);
        Session::put('otp_email', $user->email);

        $this->otpService->generateAndSendOtp($user->email);

        Auth::logout();

        return redirect()->route('otp.verify')->with('status', 'OTP sent to your email.');
    }

    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'The provided email does not exist in our records.',
            ]);
        }

        // Generate and send OTP
        $this->otpService->generateAndSendOtp($user->email);

        return back()->with('status', 'OTP sent to your email.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('welcome');
    }
}
