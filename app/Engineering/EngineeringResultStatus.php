<?php

namespace App\Engineering;

enum EngineeringResultStatus: string
{
    case Calculated = 'calculated';
    case Assumed = 'assumed';
    case Estimated = 'estimated';
    case RequiresVerification = 'requires_verification';
}
