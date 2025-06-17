<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        // Inertia::share([
        //     'auth' => function () {
        //         $user = Auth::user();
        //         return [
        //             'user' => $user,
        //             'can' => [
        //                 'category-list' => $user?->can('category-list'),
        //                 'category-create' => $user?->can('category-create'),
        //                 'category-edit' => $user?->can('category-edit'),
        //                 'category-delete' => $user?->can('category-delete'),
        //                 'role-list' => $user?->can('role-list'),
        //                 'role-create' => $user?->can('role-create'),
        //                 'role-edit' => $user?->can('role-edit'),
        //                 'role-delete' => $user?->can('role-delete'),
        //                 'user-list' => $user?->can('user-list'),
        //                 'user-create' => $user?->can('user-create'),
        //                 'user-edit' => $user?->can('user-edit'),
        //                 'user-delete' => $user?->can('user-delete'),
        //             ],
        //         ];
        //     },
        // ]);
    }
}
