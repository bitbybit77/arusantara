<?php

namespace App\Models\Trust;

use App\Models\Identity\MakerProfile;
use App\Models\Procurement\Deal;
use App\Models\User;
use App\Procurement\DealStatus;
use Database\Factories\Trust\MakerReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

#[Fillable([
    'deal_id',
    'customer_id',
    'maker_profile_id',
    'overall_rating',
    'quality_rating',
    'specification_compliance_rating',
    'communication_rating',
    'delivery_rating',
    'comment',
])]
class MakerReview extends Model
{
    /** @use HasFactory<MakerReviewFactory> */
    use HasFactory;

    /** @var list<string> */
    private const RATING_FIELDS = [
        'overall_rating',
        'quality_rating',
        'specification_compliance_rating',
        'communication_rating',
        'delivery_rating',
    ];

    /** @var list<string> */
    private const PARTICIPANT_FIELDS = [
        'deal_id',
        'customer_id',
        'maker_profile_id',
    ];

    /** @return BelongsTo<Deal, $this> */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /** @return BelongsTo<User, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /** @return BelongsTo<MakerProfile, $this> */
    public function makerProfile(): BelongsTo
    {
        return $this->belongsTo(MakerProfile::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $review): void {
            $review->ensureDealAndParticipantsAreValid();
            $review->ensureRatingsAreValid();
        });

        static::updating(function (self $review): void {
            if ($review->isDirty(self::PARTICIPANT_FIELDS)) {
                throw new LogicException('A maker review deal and participants are immutable.');
            }

            $review->ensureRatingsAreValid();
        });

        static::deleting(function (): never {
            throw new LogicException('Maker reviews preserve completed-deal trust history and cannot be deleted.');
        });
    }

    private function ensureDealAndParticipantsAreValid(): void
    {
        $deal = Deal::query()->find($this->deal_id);

        if ($deal === null
            || ! in_array($deal->status, [DealStatus::Completed, DealStatus::Closed], true)
            || $deal->completed_at === null
            || (int) $deal->customer_id !== (int) $this->customer_id
            || (int) $deal->maker_profile_id !== (int) $this->maker_profile_id) {
            throw new LogicException('A maker review must match a completed deal, its customer, and its maker.');
        }
    }

    private function ensureRatingsAreValid(): void
    {
        foreach (self::RATING_FIELDS as $field) {
            $rating = $this->getAttribute($field);

            if (! is_int($rating) || $rating < 1 || $rating > 5) {
                throw new LogicException('Maker review ratings must be integers from one to five.');
            }
        }
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'overall_rating' => 'integer',
            'quality_rating' => 'integer',
            'specification_compliance_rating' => 'integer',
            'communication_rating' => 'integer',
            'delivery_rating' => 'integer',
        ];
    }
}
