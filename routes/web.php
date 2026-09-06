<?php

use App\Http\Controllers\Configuration\CalculateProjectController;
use App\Http\Controllers\Configuration\EngineeringResultController;
use App\Http\Controllers\Configuration\ProjectConfigurationController;
use App\Http\Controllers\Configuration\ProjectController;
use App\Http\Controllers\Procurement\CustomerQuotationController;
use App\Http\Controllers\Procurement\MakerQuotationController;
use App\Http\Controllers\Procurement\RfqController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/engineering', fn () => Inertia::render('engineering'))->name('public.engineering');
Route::get('/rfq', fn () => Inertia::render('rfq'))->name('public.rfq');
Route::get('/panel-makers', fn () => Inertia::render('panel-makers'))->name('public.panel-makers');
Route::get('/learn', fn () => Inertia::render('learn'))->name('public.learn');
Route::get('/about', fn () => Inertia::render('about'))->name('public.about');

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

    Route::get('quotations/{quotation}', [CustomerQuotationController::class, 'show'])
        ->name('quotations.show');
    Route::post('quotations/{quotation}/deviations/{technicalDeviation}/respond', [CustomerQuotationController::class, 'respondToDeviation'])
        ->name('quotations.deviations.respond');
    Route::post('quotations/{quotation}/discuss', [CustomerQuotationController::class, 'discuss'])
        ->name('quotations.discuss');
    Route::post('quotations/{quotation}/accept', [CustomerQuotationController::class, 'accept'])
        ->name('quotations.accept');

    Route::get('maker/rfqs', [MakerQuotationController::class, 'index'])
        ->name('maker.rfqs.index');
    Route::get('maker/rfqs/{rfq}', [MakerQuotationController::class, 'show'])
        ->name('maker.rfqs.show');
    Route::post('maker/rfqs/{rfq}/quotation', [MakerQuotationController::class, 'store'])
        ->name('maker.rfqs.quotation.store');
    Route::get('maker/quotations/{quotation}/edit', [MakerQuotationController::class, 'edit'])
        ->name('maker.quotations.edit');
    Route::post('maker/quotations/{quotation}/revisions', [MakerQuotationController::class, 'createRevision'])
        ->name('maker.quotations.revisions.store');
    Route::put('maker/quotations/{quotation}', [MakerQuotationController::class, 'update'])
        ->name('maker.quotations.update');
    Route::post('maker/quotations/{quotation}/submit', [MakerQuotationController::class, 'submit'])
        ->name('maker.quotations.submit');
});

require __DIR__.'/settings.php';

// Arusantara public website routes
Route::get('/platform', fn () => Inertia::render('platform'))->name('public.platform');
Route::get('/cara-kerja', fn () => Inertia::render('cara-kerja'))->name('public.how-it-works');
Route::get('/permintaan-penawaran', fn () => Inertia::render('permintaan-penawaran'))->name('public.quotation-request');
Route::get('/solusi', fn () => Inertia::render('solusi'))->name('public.solutions');
Route::get('/pemilik-usaha', fn () => Inertia::render('pemilik-usaha'))->name('public.business-owner');
Route::get('/procurement', fn () => Inertia::render('procurement'))->name('public.procurement');
Route::get('/informasi', fn () => Inertia::render('informasi'))->name('public.information');
Route::get('/faq', fn () => Inertia::render('faq'))->name('public.faq');
Route::get('/insight', fn () => Inertia::render('insight'))->name('public.insight');
Route::get('/info-platform', fn () => Inertia::render('info-platform'))->name('public.platform-info');
Route::get('/kontak', fn () => Inertia::render('kontak'))->name('public.contact');
Route::get('/pengetahuan-dasar', fn () => Inertia::render('pengetahuan-dasar'))->name('public.basics');
Route::get('/tutorial', fn () => Inertia::render('tutorial'))->name('public.tutorial');
Route::get('/academy', fn () => Inertia::render('academy'))->name('public.academy');


require __DIR__.'/google-auth.php';

