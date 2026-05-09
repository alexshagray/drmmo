<?php

namespace App\Services;

use App\Models\Otp;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class OtpService
{
    public function generateAndSendOtp(string $email): string
    {
        // Delete any existing OTPs for this email
        Otp::where('email', $email)->delete();

        // Generate a 6-digit OTP
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Create OTP record
        Otp::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(5),
            'verified' => false,
        ]);

        // Send OTP email
        $this->sendOtpEmail($email, $code);

        return $code;
    }

    public function verifyOtp(string $email, string $code): bool
    {
        $otp = Otp::where('email', $email)
            ->where('code', $code)
            ->where('verified', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$otp) {
            return false;
        }

        // Mark as verified
        $otp->update(['verified' => true]);

        return true;
    }

    private function sendOtpEmail(string $email, string $code): void
    {
        $subject = 'Your Login OTP Code';
        $message = "Hello,\n\nYour One-Time Password (OTP) for verification is: {$code}\n\nThis code is valid for 5 minutes. Please do not share it with anyone for security purposes.\n\nThank you.";

        // Log the OTP code for testing
        \Log::info("OTP Code for {$email}: {$code}");

        // Send email to the user's email address
        Mail::raw($message, function ($message) use ($email, $subject) {
            $message->to($email)
                ->subject($subject);
        });
    }
}
