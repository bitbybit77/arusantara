<?php

namespace App\Identity;

enum MakerProfileStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';
}
