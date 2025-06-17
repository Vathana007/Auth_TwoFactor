<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;


Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});


// Route::middleware(['auth'])->group(function () {
//     Route::get('/profile', function () {
//         // return view or inertia page for profile edit
//     })->name('profile.edit');
// });

Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
});

Route::prefix('roles')->group(function () {
    Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware(['check:role-list']);
    Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware(['check:role-create']);
    Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware(['check:role-edit']);
    Route::post("/", [RolesController::class, 'store'])->name('roles.store');
    Route::patch("/{id}", [RolesController::class, 'update'])->name('roles.update');
    Route::delete("/{id}", [RolesController::class, 'destroy'])->name('roles.destroy')->middleware(['check:role-delete']);
});

Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware(['check:user-list']);
    Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware(['check:user-create']);
    Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware(['check:user-edit']);
    Route::post("/", [UserController::class, 'store'])->name('users.store');
    Route::patch("/{id}", [UserController::class, 'update'])->name('users.update');
    Route::delete("/{id}", [UserController::class, 'destroy'])->name('users.destroy')->middleware(['check:user-delete']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])->name('categories.index')->middleware(['check:category-list']);
    Route::get('/create', [CategoryController::class, 'create'])->name('categories.create')->middleware(['check:category-create']);
    Route::get('/{id}', [CategoryController::class, 'edit'])->name('categories.edit')->middleware(['check:category-edit']);
    Route::post("/", [CategoryController::class, 'store'])->name('categories.store');
    Route::patch("/{id}", [CategoryController::class, 'update'])->name('categories.update');
    Route::delete("/{id}", [CategoryController::class, 'destroy'])->name('categories.destroy')->middleware(['check:category-delete']);
});

