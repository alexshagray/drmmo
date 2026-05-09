<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function index(): Response
    {
        return Inertia::render('Admin/UserManagement', [
            'users' => User::select('id', 'name', 'email', 'role', 'is_approved', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get(),
            'roles' => ['admin', 'staff_1', 'staff_2'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', 'string', Rule::in(['admin', 'staff_1', 'staff_2'])],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // Send OTP to the new user's email
        $this->otpService->generateAndSendOtp($validated['email']);

        return back()->with('status', 'User created successfully. OTP sent to their email.');
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(['admin', 'staff_1', 'staff_2'])],
        ]);

        $user->update(['role' => $validated['role']]);

        return back()->with('status', 'User role updated.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('status', 'User deleted.');
    }

    public function approveUser(User $user)
    {
        $user->update(['is_approved' => true]);
        return back()->with('status', 'User approved successfully.');
    }

    public function rejectUser(User $user)
    {
        $user->delete();
        return back()->with('status', 'User rejected and deleted.');
    }
}
