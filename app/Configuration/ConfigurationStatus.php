<?php

namespace App\Configuration;

enum ConfigurationStatus: string
{
    case Draft = 'draft';
    case Ready = 'ready';
    case Locked = 'locked';
    case Superseded = 'superseded';
}
