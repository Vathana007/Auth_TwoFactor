<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $permissions = [
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',
        ];

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
                'can' => collect($permissions)->mapWithKeys(function ($permission) use ($user) {
                    return [$permission => $user ? $user->can($permission) : false];
                }),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }
}