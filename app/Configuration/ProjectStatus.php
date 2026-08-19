<?php

namespace App\Configuration;

enum ProjectStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Archived = 'archived';
}
