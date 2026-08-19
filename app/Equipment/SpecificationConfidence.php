<?php

namespace App\Equipment;

enum SpecificationConfidence: string
{
    case Unknown = 'unknown';
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
