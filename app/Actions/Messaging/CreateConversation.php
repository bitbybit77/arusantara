<?php

namespace App\Actions\Messaging;

use App\Messaging\ConversationStatus;
use App\Models\Identity\MakerProfile;
use App\Models\Messaging\Conversation;
use App\Models\Procurement\Quotation;
use App\Models\Procurement\Rfq;
use DomainException;
use Illuminate\Support\Facades\DB;

class CreateConversation
{
    public function handle(
        Rfq $rfq,
        MakerProfile $makerProfile,
        ?Quotation $quotation = null,
    ): Conversation {
        return DB::transaction(function () use ($rfq, $makerProfile, $quotation): Conversation {
            $lockedRfq = Rfq::query()
                ->whereKey($rfq->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedMakerProfile = MakerProfile::query()
                ->whereKey($makerProfile->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedQuotation = $quotation === null
                ? null
                : Quotation::query()
                    ->whereKey($quotation->getKey())
                    ->lockForUpdate()
                    ->firstOrFail();

            $makerProfileId = $lockedMakerProfile->getKey();

            if ($lockedQuotation !== null) {
                if ((int) $lockedQuotation->rfq_id !== (int) $lockedRfq->getKey()
                    || (int) $lockedQuotation->maker_profile_id !== (int) $makerProfileId) {
                    throw new DomainException('The quotation must belong to the RFQ and maker in this conversation.');
                }

                $makerProfileId = $lockedQuotation->maker_profile_id;
            }

            if (Conversation::query()
                ->where('rfq_id', $lockedRfq->getKey())
                ->where('maker_profile_id', $makerProfileId)
                ->exists()) {
                throw new DomainException('A conversation already exists for this RFQ and maker.');
            }

            return Conversation::query()->create([
                'rfq_id' => $lockedRfq->getKey(),
                'quotation_id' => $lockedQuotation?->getKey(),
                'customer_id' => $lockedRfq->customer_id,
                'maker_profile_id' => $makerProfileId,
                'status' => ConversationStatus::Active,
            ]);
        }, 3);
    }
}
