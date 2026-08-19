<?php

namespace App\Procurement;

enum QuotationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Negotiating = 'negotiating';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';
}
