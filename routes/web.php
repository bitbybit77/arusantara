<?php

use App\Http\Controllers\Configuration\CalculateProjectController;
use App\Http\Controllers\Configuration\EngineeringResultController;
use App\Http\Controllers\Configuration\ProjectConfigurationController;
use App\Http\Controllers\Configuration\ProjectController;
use App\Http\Controllers\Procurement\RfqController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');

    Route::get('projects/{project}/configuration', [ProjectConfigurationController::class, 'edit'])
        ->name('projects.configuration.edit');
    Route::put('projects/{project}/configuration', [ProjectConfigurationController::class, 'update'])
        ->name('projects.configuration.update');
    Route::post('projects/{project}/calculate', CalculateProjectController::class)
        ->name('projects.calculate');
    Route::get('projects/{project}/engineering', EngineeringResultController::class)
        ->name('projects.engineering.show');

    Route::get('projects/{project}/rfq/create', [RfqController::class, 'create'])
        ->name('projects.rfqs.create');
    Route::post('projects/{project}/rfqs', [RfqController::class, 'store'])
        ->name('projects.rfqs.store');
    Route::get('rfqs/{rfq}', [RfqController::class, 'show'])
        ->name('rfqs.show');
    Route::post('rfqs/{rfq}/publish', [RfqController::class, 'publish'])
        ->name('rfqs.publish');
});

require __DIR__.'/settings.php';
