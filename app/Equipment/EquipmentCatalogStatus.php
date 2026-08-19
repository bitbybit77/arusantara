<?php

namespace App\Equipment;

enum EquipmentCatalogStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Archived = 'archived';
}
