<?php

namespace App\Engineering;

enum CalculationLineType: string
{
    case Load = 'load';
    case Protection = 'protection';
    case PanelComponent = 'panel_component';
}
