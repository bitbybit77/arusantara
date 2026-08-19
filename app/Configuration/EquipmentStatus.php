<?php

namespace App\Configuration;

enum EquipmentStatus: string
{
    case Existing = 'existing';
    case Planned = 'planned';
}
