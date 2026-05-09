<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class RegisterController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Store registration data in session temporarily
        Session::put('registration_data', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
        ]);

        // Send OTP to the user's email
        $this->otpService->generateAndSendOtp($validated['email']);

        return response()->json([
            'message' => 'OTP sent to your email. Please verify your account.',
            'email' => $validated['email'],
        ]);
    }

    public function verifyRegistration(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $registrationData = Session::get('registration_data');

        if (!$registrationData) {
            return response()->json([
                'message' => 'Registration session expired. Please register again.',
            ], 400);
        }

        $email = $registrationData['email'];

        // Verify OTP
        $isOtpValid = $this->otpService->verifyOtp($email, $validated['otp']);

        if (!$isOtpValid) {
            return response()->json([
                'message' => 'Invalid or expired OTP code.',
            ], 400);
        }

        // Create user with pending status
        User::create([
            'name' => $registrationData['name'],
            'email' => $registrationData['email'],
            'username' => $registrationData['username'],
            'password' => $registrationData['password'],
            'role' => 'mobile', // Default role for mobile users
            'is_approved' => false, // Pending admin approval
        ]);

        // Clear registration session
        Session::forget('registration_data');

        return response()->json([
            'message' => 'Account created successfully. Your account is pending admin approval.',
        ]);
    }
}
