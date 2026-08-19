<?php

namespace App\Procurement;

enum RfqStatus: string
{
    case Draft = 'draft';
    case Open = 'open';
    case Negotiating = 'negotiating';
    case Awarded = 'awarded';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}
