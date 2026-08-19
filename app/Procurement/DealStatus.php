<?php

namespace App\Procurement;

enum DealStatus: string
{
    case Accepted = 'accepted';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Closed = 'closed';
}
