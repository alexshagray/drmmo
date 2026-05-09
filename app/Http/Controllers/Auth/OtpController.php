<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class OtpController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function showVerifyForm()
    {
        if (!Session::has('otp_user_id')) {
            return redirect()->route('welcome');
        }

        return Inertia::render('Auth/OtpVerify', [
            'email' => Session::get('otp_email'),
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|digits:6',
            'email' => 'nullable|email',
        ]);

        // Try to get email from request or session
        $email = $request->input('email') ?? Session::get('otp_email');
        $userId = Session::get('otp_user_id');

        if (!$email) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Email is required. Please login again.'], 400);
            }
            return back()->withErrors(['otp' => 'Email is required. Please login again.']);
        }

        if (!$userId && !$email) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Session expired. Please login again.'], 400);
            }
            return back()->withErrors(['otp' => 'Session expired. Please login again.']);
        }

        if (!$this->otpService->verifyOtp($email, $validated['otp'])) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Invalid or expired OTP.'], 400);
            }
            return back()->withErrors(['otp' => 'Invalid or expired OTP.']);
        }

        // If session has user ID, use it; otherwise find user by email
        if ($userId) {
            Auth::loginUsingId($userId);
        } else {
            $user = User::where('email', $email)->first();
            if (!$user) {
                if ($request->expectsJson()) {
                    return response()->json(['message' => 'User not found.'], 400);
                }
                return back()->withErrors(['otp' => 'User not found.']);
            }
            Auth::login($user);
        }

        // Clear session
        Session::forget('otp_user_id');
        Session::forget('otp_email');

        // Check if request expects JSON (mobile API)
        if ($request->expectsJson()) {
            $user = Auth::user();
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

        // Redirect based on user role (web)
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'staff_1') {
            return redirect()->route('staff1.dashboard');
        } elseif ($user->role === 'staff_2') {
            return redirect()->route('staff2.dashboard');
        }

        return redirect('/');
    }

    public function resend()
    {
        $email = Session::get('otp_email');

        if (!$email) {
            return back()->withErrors(['otp' => 'Session expired. Please login again.']);
        }

        $this->otpService->generateAndSendOtp($email);

        return back()->with('status', 'OTP resent successfully.');
    }
}
