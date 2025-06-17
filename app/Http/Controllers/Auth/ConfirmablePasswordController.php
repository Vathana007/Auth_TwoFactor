<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password view.
     */
    public function show(): Response
    {
        return Inertia::render('Auth/ConfirmPassword');
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the password entered by the user
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            // If validation fails, throw an exception and pass it back to the frontend
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        // Store that the user has confirmed their password
        $request->session()->put('auth.password_confirmed_at', time());

        // Use Inertia redirection to the intended page
        return redirect()->intended(route('dashboard'));
    }
}
