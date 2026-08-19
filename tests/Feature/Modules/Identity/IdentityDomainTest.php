<?php

use App\Actions\Identity\CreateMakerProfile;
use App\Identity\MakerProfileStatus;
use App\Identity\UserRole;
use App\Models\Identity\MakerProfile;
use App\Models\User;
use App\VerificationStatus;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('identity schema uses users as the identity root and provides maker profiles', function () {
    expect(Schema::hasColumn('users', 'role'))->toBeTrue()
        ->and(Schema::hasIndex('users', ['role']))->toBeTrue()
        ->and(Schema::hasColumns('maker_profiles', [
            'id',
            'user_id',
            'business_name',
            'description',
            'phone',
            'city',
            'service_area',
            'verification_status',
            'verified_at',
            'status',
        ]))->toBeTrue()
        ->and(Schema::hasIndex('maker_profiles', ['user_id'], 'unique'))->toBeTrue()
        ->and(Schema::hasIndex('maker_profiles', ['verification_status']))->toBeTrue()
        ->and(Schema::hasIndex('maker_profiles', ['status', 'city']))->toBeTrue();
});

test('users expose the controlled customer maker and admin roles', function () {
    $customer = User::factory()->customer()->create();
    $maker = User::factory()->maker()->create();
    $admin = User::factory()->admin()->create();

    expect($customer)->toBeInstanceOf(MustVerifyEmail::class)
        ->and($customer->role)->toBe(UserRole::Customer)
        ->and($customer->isCustomer())->toBeTrue()
        ->and($maker->role)->toBe(UserRole::Maker)
        ->and($maker->isMaker())->toBeTrue()
        ->and($admin->role)->toBe(UserRole::Admin)
        ->and($admin->isAdmin())->toBeTrue();
});

test('maker profile preserves verification data and belongs to a maker user', function () {
    $profile = MakerProfile::factory()->verified()->create([
        'service_area' => ['Bandung', 'Cimahi'],
    ]);

    expect($profile->user->role)->toBe(UserRole::Maker)
        ->and($profile->user->makerProfile->is($profile))->toBeTrue()
        ->and($profile->verification_status)->toBe(VerificationStatus::Verified)
        ->and($profile->status)->toBe(MakerProfileStatus::Active)
        ->and($profile->service_area)->toBe(['Bandung', 'Cimahi'])
        ->and($profile->verified_at)->not->toBeNull();
});

test('a user can have at most one maker profile', function () {
    $maker = User::factory()->maker()->create();

    MakerProfile::factory()->for($maker)->create();

    expect(fn () => MakerProfile::factory()->for($maker)->create())
        ->toThrow(QueryException::class);
});

test('maker profiles can only be created for maker users', function () {
    $action = app(CreateMakerProfile::class);
    $maker = User::factory()->maker()->create();

    $profile = $action->handle($maker, [
        'business_name' => 'Panel Maker Bandung',
        'city' => 'Bandung',
        'service_area' => ['Bandung', 'Cimahi'],
    ]);

    expect($profile->user->is($maker))->toBeTrue()
        ->and($profile->service_area)->toBe(['Bandung', 'Cimahi'])
        ->and(fn () => $action->handle($maker, [
            'business_name' => 'Duplicate Profile',
        ]))->toThrow(DomainException::class)
        ->and(fn () => $action->handle(User::factory()->customer()->create(), [
            'business_name' => 'Invalid Customer Profile',
        ]))->toThrow(DomainException::class);
});

test('database rejects an uncontrolled user role', function () {
    expect(fn () => DB::table('users')->insert([
        'name' => 'Invalid Role',
        'email' => 'invalid-role@example.com',
        'password' => 'secret',
        'role' => 'equipment-manager',
    ]))->toThrow(QueryException::class);
});
