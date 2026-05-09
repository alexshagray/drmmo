<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $role
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, string $role)
    {
        if (!Auth::check()) {
            return redirect()->route('welcome');
        }

        $user = Auth::user();

        // Map role names to match database values
        $roleMapping = [
            'admin' => 'admin',
            'staff1' => 'staff_1',
            'staff2' => 'staff_2',
        ];

        $requiredRole = $roleMapping[$role] ?? $role;

        if ($user->role !== $requiredRole) {
            // Redirect to login/welcome page for unauthorized access
            Auth::logout();
            return redirect()->route('welcome');
        }

        return $next($request);
    }
}
