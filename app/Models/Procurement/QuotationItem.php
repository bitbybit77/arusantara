<?php

namespace App\Models\Procurement;

use App\Procurement\QuotationItemType;
use Database\Factories\Procurement\QuotationItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * @property int $id
 * @property int $quotation_revision_id
 * @property QuotationItemType $type
 * @property string $description
 * @property string|null $manufacturer
 * @property string|null $part_number
 * @property string $quantity
 * @property string $unit
 * @property string $unit_price
 * @property string $line_total
 * @property array<string, mixed>|null $specification
 * @property int $sort_order
 * @property-read QuotationRevision $quotationRevision
 */
#[Fillable([
    'quotation_revision_id',
    'type',
    'description',
    'manufacturer',
    'part_number',
    'quantity',
    'unit',
    'unit_price',
    'line_total',
    'specification',
    'sort_order',
])]
class QuotationItem extends Model
{
    /** @use HasFactory<QuotationItemFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'sort_order' => 0,
    ];

    /** @return BelongsTo<QuotationRevision, $this> */
    public function quotationRevision(): BelongsTo
    {
        return $this->belongsTo(QuotationRevision::class);
    }

    protected static function booted(): void
    {
        static::creating(fn (self $item) => $item->ensureRevisionIsDraft());
        static::updating(fn (self $item) => $item->ensureRevisionIsDraft());
        static::deleting(fn (self $item) => $item->ensureRevisionIsDraft());
    }

    private function ensureRevisionIsDraft(): void
    {
        $revisionIds = array_values(array_unique(array_filter([
            $this->quotation_revision_id,
            $this->getRawOriginal('quotation_revision_id'),
        ])));

        $isSubmitted = QuotationRevision::query()
            ->whereKey($revisionIds)
            ->whereNotNull('submitted_at')
            ->exists();

        if ($isSubmitted) {
            throw new LogicException('Items on submitted quotation revisions are immutable.');
        }
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => QuotationItemType::class,
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
            'specification' => 'array',
            'sort_order' => 'integer',
        ];
    }
}
