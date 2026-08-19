<?php

namespace App\Procurement;

enum TechnicalDeviationStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
