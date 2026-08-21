<?php

namespace App\Models\Identity;

use App\Identity\MakerProfileStatus;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Deal;
use App\Models\Procurement\Quotation;
use App\Models\Trust\MakerReview;
use App\Models\User;
use App\VerificationStatus;
use Database\Factories\Identity\MakerProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

#[Fillable([
    'user_id',
    'business_name',
    'description',
    'phone',
    'city',
    'service_area',
    'verification_status',
    'verified_at',
    'status',
])]
class MakerProfile extends Model
{
    /** @use HasFactory<MakerProfileFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'verification_status' => 'pending',
        'status' => 'active',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Quotation, $this> */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    /** @return HasMany<Conversation, $this> */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /** @return HasMany<Deal, $this> */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /** @return HasMany<MakerReview, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(MakerReview::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $makerProfile): void {
            $makerProfile->ensureOwnerIsMaker();
            $makerProfile->ensureVerificationIsCoherent();
        });

        static::updating(function (self $makerProfile): void {
            if ($makerProfile->isDirty('user_id')) {
                throw new LogicException('A maker profile owner cannot be reassigned.');
            }

            $makerProfile->ensureOwnerIsMaker();
            $makerProfile->ensureVerificationIsCoherent();
        });
    }

    private function ensureOwnerIsMaker(): void
    {
        $owner = User::query()
            ->whereKey($this->getAttribute('user_id'))
            ->first();

        if (! $owner?->isMaker()) {
            throw new LogicException('A maker profile must belong to a maker user.');
        }
    }

    private function ensureVerificationIsCoherent(): void
    {
        $verificationStatus = $this->getAttribute('verification_status');
        $isVerified = $verificationStatus === VerificationStatus::Verified
            || $verificationStatus === VerificationStatus::Verified->value;
        $hasVerificationTimestamp = $this->getAttribute('verified_at') !== null;

        if ($isVerified !== $hasVerificationTimestamp) {
            throw new LogicException('A maker profile verification timestamp must be present only when verified.');
        }
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'service_area' => 'array',
            'verification_status' => VerificationStatus::class,
            'verified_at' => 'immutable_datetime',
            'status' => MakerProfileStatus::class,
        ];
    }
}
