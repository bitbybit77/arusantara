<?php

namespace App\Equipment;

enum ElectricalPhase: string
{
    case SinglePhase = 'single_phase';
    case ThreePhase = 'three_phase';
}
