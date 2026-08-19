<?php

namespace App\Procurement;

enum QuotationItemType: string
{
    case Component = 'component';
    case Fabrication = 'fabrication';
    case Installation = 'installation';
    case Service = 'service';
    case Other = 'other';
}
