<?php

namespace App\Configuration;

enum SpecificationBasis: string
{
    case Exact = 'exact';
    case CategoryBased = 'category_based';
    case Estimated = 'estimated';
}
