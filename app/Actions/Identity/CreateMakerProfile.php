<?php

namespace App\Actions\Identity;

use App\Models\Identity\MakerProfile;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CreateMakerProfile
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $user, array $attributes): MakerProfile
    {
        $validated = Validator::make($attributes, [
            'business_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:100'],
            'service_area' => ['nullable', 'array'],
            'service_area.*' => ['string', 'max:100'],
        ])->validate();

        return DB::transaction(function () use ($user, $validated): MakerProfile {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);

            if (! $lockedUser->isMaker()) {
                throw new DomainException('Only maker users may create a maker profile.');
            }

            if ($lockedUser->makerProfile()->exists()) {
                throw new DomainException('This maker already has a profile.');
            }

            return $lockedUser->makerProfile()->create($validated);
        });
    }
}
