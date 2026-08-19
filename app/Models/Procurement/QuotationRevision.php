<?php

namespace App\Models\Procurement;

use App\Procurement\QuotationStatus;
use Database\Factories\Procurement\QuotationRevisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use LogicException;

/**
 * @property int $id
 * @property int $quotation_id
 * @property int $revision_number
 * @property string $currency_code
 * @property string $component_cost
 * @property string $fabrication_cost
 * @property string $installation_cost
 * @property string $other_cost
 * @property string $subtotal
 * @property string $discount_amount
 * @property string $tax_amount
 * @property string $grand_total
 * @property int|null $lead_time_days
 * @property int|null $warranty_months
 * @property string|null $notes
 * @property Carbon|null $submitted_at
 * @property-read Quotation $quotation
 * @property-read Collection<int, QuotationItem> $items
 * @property-read Collection<int, TechnicalDeviation> $technicalDeviations
 */
#[Fillable([
    'quotation_id',
    'revision_number',
    'currency_code',
    'component_cost',
    'fabrication_cost',
    'installation_cost',
    'other_cost',
    'subtotal',
    'discount_amount',
    'tax_amount',
    'grand_total',
    'lead_time_days',
    'warranty_months',
    'notes',
    'submitted_at',
])]
class QuotationRevision extends Model
{
    /** @use HasFactory<QuotationRevisionFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'currency_code' => 'IDR',
        'component_cost' => '0',
        'fabrication_cost' => '0',
        'installation_cost' => '0',
        'other_cost' => '0',
        'subtotal' => '0',
        'discount_amount' => '0',
        'tax_amount' => '0',
        'grand_total' => '0',
    ];

    /** @return BelongsTo<Quotation, $this> */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /** @return HasMany<QuotationItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /** @return HasMany<TechnicalDeviation, $this> */
    public function technicalDeviations(): HasMany
    {
        return $this->hasMany(TechnicalDeviation::class);
    }

    /** @return HasOne<Deal, $this> */
    public function deal(): HasOne
    {
        return $this->hasOne(Deal::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $revision): void {
            $quotationStatus = Quotation::query()
                ->whereKey($revision->quotation_id)
                ->value('status');

            if (! in_array($quotationStatus, [
                QuotationStatus::Draft->value,
                QuotationStatus::Submitted->value,
                QuotationStatus::Negotiating->value,
            ], true)) {
                throw new LogicException('This quotation can no longer receive revisions.');
            }
        });

        static::updating(function (self $revision): void {
            if ($revision->getRawOriginal('submitted_at') !== null) {
                throw new LogicException('Submitted quotation revisions are immutable.');
            }
        });

        static::deleting(function (self $revision): void {
            if ($revision->getRawOriginal('submitted_at') !== null) {
                throw new LogicException('Submitted quotation revisions are immutable.');
            }
        });
    }

    public function isSubmitted(): bool
    {
        return $this->submitted_at !== null;
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'revision_number' => 'integer',
            'component_cost' => 'decimal:2',
            'fabrication_cost' => 'decimal:2',
            'installation_cost' => 'decimal:2',
            'other_cost' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'lead_time_days' => 'integer',
            'warranty_months' => 'integer',
            'submitted_at' => 'datetime',
        ];
    }
}
